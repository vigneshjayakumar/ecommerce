import { Component, inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-create-invoice',
  imports: [ReactiveFormsModule, InvoiceItemsComponent, FormsModule],
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.css',
})
export class CreateInvoiceComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
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
  }
  private onVerifyInvoice(
    productIdArr: { productId: number; quantity: number }[]
  ) {
    const currentDate = new Date();
    const payload: TInvoicePostPayload = {
      invoiceType: this.invoiceType === true ? 'GST' : 'NON-GST',
      invoiceDate:
        currentDate.getDate() +
        '-' +
        (currentDate.getMonth() + 1) +
        '-' +
        currentDate.getFullYear(),
      customer: this.customerDetailsForm.getRawValue(),
      items: productIdArr,
    };
    this.invoiceService.post_Invoice_details = payload;
  }
  onInvoiceTypeChange() {
    if (this.invoiceType)
      return this.customerDetailsForm.get('gstin')?.enable();
    this.customerDetailsForm.get('gstin')?.disable();
  }

  onValuesEmit(event: { productId: number; quantity: number }[]) {
    const quantityArray = event;
    this.onVerifyInvoice(quantityArray);
    this.invoiceService
      .validateInvoiceDetails()
      .pipe(tap((res) => console.log('Validate Invoice Details', res)))
      .subscribe();
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
}
