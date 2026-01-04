import { Component, inject, OnInit } from '@angular/core';
import { tap } from 'rxjs/internal/operators/tap';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { InvoiceService, TMerchantInfo } from '../invoice.service';
import { InvoiceItemsComponent } from '../invoice-items/invoice-items.component';

@Component({
  selector: 'app-create-invoice',
  imports: [ReactiveFormsModule, InvoiceItemsComponent],
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.css',
})
export class CreateInvoiceComponent implements OnInit {
  private invoiceService = inject(InvoiceService);

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
      .pipe(tap((details) => (this.merchantInfo = details)))
      .subscribe();
    this.initForm();
  }
  onVerifyInvoice() {
    console.log(this.customerDetailsForm.value);
  }

  private initForm() {
    this.customerDetailsForm = new FormGroup({
      name: new FormControl('', { validators: [Validators.required] }),
      phoneNumber: new FormControl(null, { validators: [Validators.required] }),
      gstin: new FormControl('', { validators: [Validators.required] }),
      address: new FormControl('', { validators: [Validators.required] }),
    });
  }
}
