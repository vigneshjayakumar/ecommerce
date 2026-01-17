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

import {
  InvoiceService,
  TCalculatedInvoiceRes,
  TInvoicePostPayload,
  TMerchantInfo,
} from '../invoice.service';
import { Subscription } from 'rxjs';
import { AdminProductService } from '../../admin-product.service';
import { TProduct } from '../../all-products-list/all-products.modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-invoice',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.css',
})
export class CreateInvoiceComponent implements OnInit, OnDestroy {
  private invoiceService = inject(InvoiceService);
  private adminService = inject(AdminProductService);
  private router = inject(Router);

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

  customerDetailsForm!: FormGroup;
  isEditMode = true;

  ngOnInit(): void {
    const subs = this.merchantDetails().subscribe();
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
      const found = this.productList.find(
        (product) => product.product_name === ele.productName,
      );
      if (found) {
        productIdQtyArr.push({ productId: found.id, quantity: ele.quantity });
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
      quantity: new FormControl(null, { validators: [Validators.required] }),
      taxRate: new FormControl(
        { value: null, disabled: true },
        { validators: [Validators.required] },
      ),
      rate: new FormControl(
        { value: null, disabled: true },
        { validators: [Validators.required] },
      ),
      amount: new FormControl(
        { value: null, disabled: true },
        { validators: [Validators.required] },
      ),
    });
    const subs = group
      .get('productName')
      ?.valueChanges.pipe(
        tap((data) => {
          if (data) {
            this.calculateTaxForProduct(group, data);
          }
        }),
      )
      .subscribe();
    this.subsArr.push(subs);
    return group;
  }

  private calculateTaxForProduct(form: FormGroup, product: string) {
    const productObj = this.productList.find(
      (ele) => ele.product_name === product,
    );
    if (productObj) {
      const amount = productObj.price;

      let taxRate = amount * (Number(productObj.tax_percent) / 100);
      taxRate = Math.round((taxRate + Number.EPSILON) * 100) / 100;

      let totalAmount = +productObj.price + Number(taxRate);
      totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100;

      form.get('rate')?.setValue(amount, { emitEvent: false });
      form.get('taxRate')?.setValue(taxRate, { emitEvent: false });
      const quantityFormField = form.get('quantity');
      quantityFormField?.setValue(1, { emitEvent: false });
      quantityFormField?.setValidators([
        Validators.required,
        Validators.max(productObj.stock_count),
      ]);
      form.get('amount')?.setValue(totalAmount, { emitEvent: false });
    }
  }

  productList: TProduct[] = [];
  private fetchProductsList() {
    const subs = this.adminService
      .getAllProductsList()
      .pipe(tap((res) => (this.productList = res)))
      .subscribe();
    this.subsArr.push(subs);
  }

  onGenerateInvoice() {
    const subs = this.invoiceService.generateInvoice().subscribe((res) => {
      if (res.message === 'SUCCESS')
        this.router.navigate(['/admin/invoice/invoice-lists']);
    });
    this.subsArr.push(subs);
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
