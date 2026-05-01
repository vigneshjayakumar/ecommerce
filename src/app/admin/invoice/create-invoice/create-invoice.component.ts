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
import { catchError, EMPTY, Subscription, switchMap, throwError } from 'rxjs';
import { AdminProductService } from '../../admin-product.service';
import { TProduct } from '../../all-products-list/all-products.modal';
import { Router } from '@angular/router';
import { TProductByBranchIdRes, TransferService } from 'src/app/stocks/transfer-products/transfer.service';
import { INRCurrency } from 'src/app/common/pipes/inr-currency.pipe';
import { NgClass } from '@angular/common';
import { BmSelectComponent } from 'src/app/ui/shared/components/bm-select/bm-select.component';

@Component({
  selector: 'app-create-invoice',
  imports: [ReactiveFormsModule, FormsModule, INRCurrency, NgClass, BmSelectComponent],
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
  branchList: { value: string, label: string }[] = [];
  branchSelect = new FormControl('');
  customerDetailsForm!: FormGroup;
  isEditMode = true;


  branchWiseProductList: TProductByBranchIdRes['response'] = [];
  branchId = 0;
  branchChangeSubs = this.branchSelect.valueChanges
    .pipe(
      switchMap(branchId => {
        if (branchId) return this.fetchProductListBranchWise(+branchId)
        return EMPTY
      })).subscribe();

  ngOnInit(): void {
    const subs = this.merchantDetails()
      .pipe(
        switchMap(() => this.getBranchList()),
        switchMap(() => this.fetchProductListBranchWise(+this.branchList[0].value))
      ).subscribe();
    this.initForm();
    // this.fetchProductsList();

    this.subsArr.push(subs);
  }
  private onVerifyInvoice(items: { productId: number; quantity: number }[]) {
    const currentDate = new Date();
    const customerDetails = {
      address: this.customerDetailsForm.controls['address'].value ? this.customerDetailsForm.controls['address'].value : null,
      gstin: this.customerDetailsForm.controls['gstin'].value ? this.customerDetailsForm.controls['gstin'].value : null,
      name: this.customerDetailsForm.controls['name'].value ? this.customerDetailsForm.controls['name'].value : null,
      phoneNumber: this.customerDetailsForm.controls['phoneNumber'].value ? this.customerDetailsForm.controls['phoneNumber'].value : null,
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
    if (this.invoiceType) {
      return this.customerDetailsForm.get('gstin')?.enable();
    }
    this.customerDetailsForm.get('gstin')?.disable();
  }
  private merchantDetails() {
    return this.invoiceService.fetchMerchentDetails().pipe(
      tap((details) => {
        this.merchantInfo = details;
        if (this.merchantInfo.gstin) {
          this.showInvoiceToggleBtn = true;
        }
      }),
    );
  }
  branchWiseProductDropDown: { value: string, label: string }[] = [];
  selectedBranch = '';
  onBranchChange(event: string) {
    this.selectedBranch = event;
    this.branchSelect.setValue(this.selectedBranch);
  }
  private getBranchList() {
    return this.transferService.getBranchLists().pipe(tap(res => {
      this.branchList = res.map(ele => ({ value: ele.id, label: ele.branch_name }));
      this.selectedBranch = this.branchList[0].label;
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
        (product) => product.product_name === ele.productName,
      );
      if (found) {
        productIdQtyArr.push({ productId: +found.product_id, quantity: ele.quantity });
      }
    });
    return productIdQtyArr;
  }
  private initForm() {
    this.customerDetailsForm = new FormGroup({
      name: new FormControl(''),
      phoneNumber: new FormControl(null),
      gstin: new FormControl(''),
      address: new FormControl(''),
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
    this.updateDropdownBySelectedForm();
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


  onProductSelect(productName: string, index: number) {
    const group = this.invoiceItemArr.at(index) as FormGroup;


    group.get('productName')?.setValue(productName);

    const product = this.branchWiseProductList.find(p => p.product_name === productName);
    if (product) {
      group.patchValue({
        uom: product.uom
      });
      this.calculateTaxForProduct(group, product.id);
    }
    this.updateDropdownBySelectedForm();
  }

  private fetchProductListBranchWise(branchId: number) {
    this.branchId = branchId;
    return this.transferService.getProductListByBranchId(branchId)
      .pipe(tap(res => {
        this.branchWiseProductList = res.filter((ele) => ele.is_active);
        this.branchWiseProductDropDown = this.branchWiseProductList.map(
          ele => ({ value: ele.product_name, label: ele.product_name })
        )
      }))
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

  private updateDropdownBySelectedForm() {
    const selectedProducts = this.filterChoosenProductIdAndQuantity();
    const selectedProductSet = new Set(selectedProducts.map(product => product.productId));

    const same = this.branchWiseProductList.filter(item => !selectedProductSet.has(+item.product_id))

    this.branchWiseProductDropDown = same.map(ele => ({ value: ele.product_name, label: ele.product_name }));
  }

  ngOnDestroy(): void {
    this.subsArr.forEach((subs) => {
      if (subs) subs.unsubscribe();
    });
    this.subsArr = [];
  }
}
