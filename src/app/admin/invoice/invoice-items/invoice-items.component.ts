import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';

import { AdminProductService } from '../../admin-product.service';
import { TProduct } from '../../all-products-list/all-products.modal';

@Component({
  selector: 'app-invoice-items',
  imports: [ReactiveFormsModule],
  templateUrl: './invoice-items.component.html',
  styleUrl: './invoice-items.component.css',
})
export class InvoiceItemsComponent implements OnInit, OnDestroy {
  invoiceItemForm!: FormGroup;
  parentForm = new FormGroup({
    invoiceItemsArr: new FormArray([]),
  });
  productList: TProduct[] = [];

  private adminService = inject(AdminProductService);
  private subscriptionsArr: (Subscription | undefined)[] = [];
  constructor() {
    const formInitGroup = this.initForm();
    this.invoiceItemArr.push(formInitGroup);
  }
  ngOnInit(): void {
    const subs = this.adminService
      .getAllProductsList()
      .pipe(tap((res) => (this.productList = res)))
      .subscribe();
    this.subscriptionsArr.push(subs);
  }

  get invoiceItemArr() {
    return this.parentForm.get('invoiceItemsArr') as FormArray;
  }

  addFormEle() {
    const group = this.initForm();
    this.invoiceItemArr.push(group);
  }

  onDeleteFormEle(index: number) {
    this.invoiceItemArr.removeAt(index);
  }

  private initForm() {
    const group = new FormGroup({
      productName: new FormControl('', { validators: [Validators.required] }),
      quantity: new FormControl(null, { validators: [Validators.required] }),
      taxRate: new FormControl(
        { value: null, disabled: true },
        { validators: [Validators.required] }
      ),
      rate: new FormControl(
        { value: null, disabled: true },
        { validators: [Validators.required] }
      ),
      amount: new FormControl(
        { value: null, disabled: true },
        { validators: [Validators.required] }
      ),
    });
    const subs = group
      .get('productName')
      ?.valueChanges.pipe(
        tap((data) => {
          if (data) {
            this.calculateTaxForProduct(group, data);
          }
        })
      )
      .subscribe();

    this.subscriptionsArr.push(subs);
    return group;
  }
  private calculateTaxForProduct(form: FormGroup, product: string) {
    const productObj = this.productList.find(
      (ele) => ele.product_name === product
    );
    if (productObj) {
      const amount = productObj.price;

      let taxRate = amount * (Number(productObj.tax_percent) / 100);
      taxRate = Math.round((taxRate + Number.EPSILON) * 100) / 100;

      let totalAmount = +productObj.price + Number(taxRate);
      totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100;

      form.get('rate')?.setValue(amount, { emitEvent: false });
      form.get('taxRate')?.setValue(taxRate, { emitEvent: false });
      form.get('quantity')?.setValue(1, { emitEvent: false });
      form.get('amount')?.setValue(totalAmount, { emitEvent: false });
    }
  }
  onCalculateTotalAmount() {
    console.log(this.invoiceItemArr.getRawValue());
  }

  ngOnDestroy(): void {
    this.subscriptionsArr.forEach((subs) => {
      if (subs) subs.unsubscribe();
    });
    this.subscriptionsArr = [];
  }
}
