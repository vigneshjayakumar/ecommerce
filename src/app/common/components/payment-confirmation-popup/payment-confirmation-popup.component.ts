import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BmSelectComponent } from 'src/app/ui/shared/components/bm-select/bm-select.component';

@Component({
  selector: 'app-payment-confirmation-popup',
  imports: [FormsModule, BmSelectComponent],
  templateUrl: './payment-confirmation-popup.component.html',
  styleUrl: './payment-confirmation-popup.component.css'
})
export class PaymentConfirmationPopupComponent implements OnChanges {
  @Input({ required: true }) data!: {
    title: string;
    showCancelBtn: boolean;
    showConfirmBtn: boolean;
    amount: number;
  };

  @Output() btnTriggerEvent = new EventEmitter<{ paymentType: TPaymentOptions, amount: number, refId?: string } | false>();

  paymentRefNumber: string = '';
  paymentType: TPaymentOptions = 'CASH';
  amount: number = 0
  paymentOptions: TPaymentOptions[] = ['CASH', 'UPI', 'CARD', 'BANK TRANSFER'];
  paymentSelectOptions = this.paymentOptions.map(type => ({ label: type, value: type }));
  isPartial = false;

  ngOnChanges(): void {
    this.amount = this.data.amount;
  }

  onPaymentTypeChange(paymentType: TPaymentOptions) {
    this.paymentType = paymentType;
    if (paymentType === 'CASH') this.paymentRefNumber = '';
  }

  onButtonClick(status: boolean) {
    if (status)
      return this.btnTriggerEvent.emit({ paymentType: this.paymentType, amount: this.amount, refId: this.paymentRefNumber });
    this.btnTriggerEvent.emit(false);
  }
}

export type TPaymentOptions = 'CASH' | 'UPI' | 'CARD' | 'BANK TRANSFER';