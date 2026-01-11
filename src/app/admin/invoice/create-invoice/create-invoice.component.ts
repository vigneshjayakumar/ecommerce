import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { tap } from 'rxjs/internal/operators/tap';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  InvoiceService,
  TInvoicePostPayload,
  TMerchantInfo,
} from '../invoice.service';
import { InvoiceItemsComponent } from '../invoice-items/invoice-items.component';
import { catchError, EMPTY, Subscription, switchMap, throwError } from 'rxjs';

@Component({
  selector: 'app-create-invoice',
  imports: [ReactiveFormsModule, InvoiceItemsComponent, FormsModule],
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.css',
})
export class CreateInvoiceComponent implements OnInit, OnDestroy {
  private invoiceService = inject(InvoiceService);
  private invoiceItems: { productId: number; quantity: number }[] = [];

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
  private invoiceItemsSubs!: Subscription;
  isEditMode = true;
  private createPostSubs() {
    this.invoiceItemsSubs = this.invoiceService.invoiceArrObs
      .pipe(
        switchMap((data) => {
          if (data.calculateFromDB) {
            this.onVerifyInvoice(data.items);
            return this.postInvoicePayload();
          }
          this.isEditMode = data.isEditMode;
          // if (!this.isEditMode) {
          //   this.customerDetailsForm.disable();
          // } else {
          //   this.customerDetailsForm.enable();
          // }
          return EMPTY;
        })
      )
      .subscribe();
  }
  ngOnInit(): void {
    this.invoiceService
      .fetchMerchentDetails()
      .pipe(
        tap((details) => {
          this.merchantInfo = details;
          if (this.merchantInfo.gstin !== '') {
            this.showInvoiceToggleBtn = true;
          }
        })
      )
      .subscribe();
    this.initForm();
    this.createPostSubs();
  }
  private onVerifyInvoice(items: { productId: number; quantity: number }[]) {
    const currentDate = new Date();
    const payload: TInvoicePostPayload = {
      invoiceType: this.invoiceType === true ? 'GST' : 'NON-GST',
      invoiceDate: currentDate.toISOString().substring(0, 10),
      customer: this.customerDetailsForm.getRawValue(),
      items: items,
    };
    this.invoiceService.post_Invoice_details = payload;
  }
  onInvoiceTypeChange() {
    if (this.invoiceType)
      return this.customerDetailsForm.get('gstin')?.enable();
    this.customerDetailsForm.get('gstin')?.disable();
  }

  private postInvoicePayload() {
    return this.invoiceService.validateInvoiceDetails().pipe(
      tap((res) => {
        if (res.message === 'SUCCESS') {
          this.invoiceService.setInvoiceItemsArr({
            isEditMode: false,
            items: this.invoiceItems,
            calculateFromDB: false,
          });
        }
      })
    );
  }

  private initForm() {
    this.customerDetailsForm = new FormGroup({
      name: new FormControl('', { validators: [Validators.required] }),
      phoneNumber: new FormControl(null, { validators: [Validators.required] }),
      gstin: new FormControl('', { validators: [Validators.required] }),
      address: new FormControl('', { validators: [Validators.required] }),
    });
    this.customerDetailsForm.get('gstin')?.disable();
  }

  ngOnDestroy(): void {
    if (this.invoiceItemsSubs) this.invoiceItemsSubs.unsubscribe();
  }
}
