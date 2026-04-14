import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { tap } from 'rxjs/internal/operators/tap';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { v4 as uuidV4 } from 'uuid';

import {
  InvoiceService,
  TCalculatedInvoiceRes,
  TInvoicePostPayload,
  TMerchantInfo,
} from '../invoice.service';
import { catchError, Subscription, switchMap, throwError } from 'rxjs';
import { AdminProductService } from '../../admin-product.service';
import { TProduct } from '../../all-products-list/all-products.modal';
import { Router } from '@angular/router';
import { TProductByBranchIdRes, TransferService } from 'src/app/stocks/transfer-products/transfer.service';
import { INRCurrency } from 'src/app/common/pipes/inr-currency.pipe';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-create-invoice',
  imports: [ReactiveFormsModule, FormsModule, INRCurrency, NgClass],
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.css',
})
export class CreateInvoiceComponent implements OnInit, OnDestroy {
  private invoiceService = inject(InvoiceService);
  private adminService = inject(AdminProductService);
  private transferService = inject(TransferService);
  private router = inject(Router);

  private idompotencyKey: string | null = null;
  isGeneratedInvoice = false;
  isInvoiceAwaitingConfirm = false;
  generatedInvoiceId: number = 0;
  private subsArr: (Subscription | undefined)[] = [];
  showInvoiceToggleBtn = false;
  invoiceType = false;
  merchantInfo: TMerchantInfo = {
    tenant_name: '',
    address: '',
    country: '',
    state: '',
    pincode: 0,
    gstin: '',
    id: 0,
    email_id: '',
  };
  branchList: { id: string, branch_name: string }[] = [];
  branchSelect = new FormControl('');
  customerDetailsForm!: FormGroup;
  isEditMode = true;

  branchId = 0;
  branchChangeSubs = this.branchSelect.valueChanges.pipe(tap(branchId => { if (branchId) { this.fetchProductListBranchWise(+branchId) } })).subscribe();

  ngOnInit(): void {
    const subs = this.merchantDetails().pipe(switchMap(() => this.getBranchList())).subscribe(() => this.fetchProductListBranchWise(+this.branchList[0].id));
    this.initForm();
    this.fetchProductsList();

    this.subsArr.push(subs);
  }
  private onVerifyInvoice(items: { productId: number; quantity: number }[]) {
    const currentDate = new Date();
    const customerDetails = {
      address: this.customerDetailsForm.controls['address'].value,
      gstin: this.customerDetailsForm.controls['gstin'].value,
      name: this.customerDetailsForm.controls['name'].value,
      phoneNumber: this.customerDetailsForm.controls['phoneNumber'].value,
    };
    const payload: TInvoicePostPayload = {
      invoiceType: this.invoiceType === true ? 'GST' : 'NON-GST',
      invoiceDate: currentDate.toISOString().substring(0, 10),
      customer: customerDetails,
      branchId: this.branchId,
      items: items,
    };
    if (!payload.items.length) console.log('Items must be present');
    this.invoiceService.post_Invoice_details = payload;
    const subs = this.postInvoicePayload().subscribe();
    this.subsArr.push(subs);
  }
  onInvoiceTypeChange() {
    if (this.invoiceType)
      return this.customerDetailsForm.get('gstin')?.enable();
    this.customerDetailsForm.get('gstin')?.disable();
  }
  private merchantDetails() {
    return this.invoiceService.fetchMerchentDetails().pipe(
      tap((details) => {
        this.merchantInfo = details;
        if (this.merchantInfo.gstin !== '') {
          this.showInvoiceToggleBtn = true;
        }
      }),
    );
  }

  private getBranchList() {
    return this.transferService.getBranchLists().pipe(tap(res => {
      this.branchList = res;
    }))
  }

  private postInvoicePayload() {
    return this.invoiceService.validateInvoiceDetails().pipe(
      tap((res) => {
        if (res.message === 'SUCCESS') {
          this.validatedProductsList = res.response;
          this.customerDetailsForm.disable();
          this.isEditMode = false;
        } else {
          this.isEditMode = true;
        }
      }),
    );
  }

  onCalculateTotalAmount() {
    const invoiceItems = this.filterChoosenProductIdAndQuantity();
    this.onVerifyInvoice(invoiceItems);
  }

  private filterChoosenProductIdAndQuantity() {
    const itemsArr = this.invoiceItemArr.getRawValue();
    const productIdQtyArr: { productId: number; quantity: number }[] = [];
    itemsArr.forEach((ele) => {
      const found = this.branchWiseProductList.find(
        (product) => +product.product_id === +ele.productName,
      );
      if (found) {
        productIdQtyArr.push({ productId: +found.product_id, quantity: ele.quantity });
      }
    });
    return productIdQtyArr;
  }
  private initForm() {
    this.customerDetailsForm = new FormGroup({
      name: new FormControl('', { validators: [Validators.required] }),
      phoneNumber: new FormControl(null, { validators: [Validators.required] }),
      gstin: new FormControl(''),
      address: new FormControl('', { validators: [Validators.required] }),
      invoiceItemsArr: new FormArray([]),
    });
    const formInitGroup = this.initInvoiceItemForm();
    this.invoiceItemArr.push(formInitGroup);
    this.customerDetailsForm.get('gstin')?.disable();
  }

  get invoiceItemArr() {
    return this.customerDetailsForm.get('invoiceItemsArr') as FormArray;
  }
  onDeleteFormEle(index: number) {
    this.invoiceItemArr.removeAt(index);
  }

  validatedProductsList: TCalculatedInvoiceRes['response'] = {
    calculatedInvoiceItems: [],
    total: {
      totalAmount: 0,
      totalPrice: 0,
      totalTax: 0,
    },
  };
  private initInvoiceItemForm() {
    const group = new FormGroup({
      productName: new FormControl('', { validators: [Validators.required] }),
      quantity: new FormControl(null, {
        validators: [Validators.required, Validators.min(1)],
      }),
      uom: new FormControl(
        { value: null, disabled: true },
        { validators: [Validators.required] },
      ),
    });
    const subs = group
      .get('productName')
      ?.valueChanges.pipe(
        tap((productId) => {
          if (productId) {
            this.calculateTaxForProduct(group, productId);
          }
        }),
      )
      .subscribe();
    this.subsArr.push(subs);
    return group;
  }

  private calculateTaxForProduct(form: FormGroup, productId: string) {
    const productObj = this.branchWiseProductList.find(
      (ele) => +ele.id === +productId,
    );
    if (productObj) {
      const amount = +productObj.price;

      let taxRate = amount * (Number(productObj.tax_percent) / 100);
      taxRate = Math.round((taxRate + Number.EPSILON) * 100) / 100;

      let totalAmount = +amount + Number(taxRate);
      totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100;

      form.get('uom')?.setValue(productObj.uom, { emitEvent: false });
      const quantityFormField = form.get('quantity');
      quantityFormField?.setValue(1, { emitEvent: false });
      quantityFormField?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(+productObj.current_qty),
      ]);
    }
  }

  productList: TProduct[] = [];
  branchWiseProductList: TProductByBranchIdRes['response'] = [];
  private fetchProductsList() {
    const subs = this.adminService.getAllProductsList()
      .pipe(
        tap((res) => (this.productList = res.filter((ele) => ele.is_active))),
      )
      .subscribe();
    this.subsArr.push(subs);
  }

  private fetchProductListBranchWise(branchId: number) {
    this.branchId = branchId;
    const subs = this.transferService.getProductListByBranchId(branchId)
      .pipe(tap(res => this.branchWiseProductList = res))
      .subscribe();
    this.subsArr.push(subs)
  }

  onGenerateInvoice() {
    if (this.idompotencyKey === null) this.idompotencyKey = uuidV4();
    this.isGeneratedInvoice = true;
    const subs = this.invoiceService
      .generateInvoice(this.idompotencyKey)
      .pipe(
        catchError((err) => {
          this.isGeneratedInvoice = false;
          return throwError(() => new Error(err));
        }),
      )
      .subscribe((res) => {
        if (res.message === 'SUCCESS') {
          this.isGeneratedInvoice = false;
          this.isInvoiceAwaitingConfirm = true;
          this.idompotencyKey = null;
          this.generatedInvoiceId = +res.response.data[0].id;
        }
      });
    this.subsArr.push(subs);
  }

  onConfirmInvoice() {
    this.invoiceService.confirmInvoiceById(this.generatedInvoiceId).subscribe((res) => {
      this.router.navigate(['/admin/invoice/invoice-lists']);
    });
  }

  addFormEle() {
    const group = this.initInvoiceItemForm();
    this.invoiceItemArr.push(group);
  }
  addEnableEdit() {
    this.isEditMode = true;
    this.customerDetailsForm.enable();
    this.onInvoiceTypeChange();
  }
  ngOnDestroy(): void {
    this.subsArr.forEach((subs) => {
      if (subs) subs.unsubscribe();
    });
    this.subsArr = [];
  }
}
