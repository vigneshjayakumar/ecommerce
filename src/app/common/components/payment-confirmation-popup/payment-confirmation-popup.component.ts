import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-confirmation-popup',
  imports: [FormsModule],
  templateUrl: './payment-confirmation-popup.component.html',
  styleUrl: './payment-confirmation-popup.component.css'
})
export class PaymentConfirmationPopupComponent implements OnChanges, AfterViewInit, OnInit {
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
  isPartial = false;

  ngAfterViewInit(): void {
    this.amount = this.data.amount;
    console.log(this.amount);
  }

  ngOnInit(): void {
    this.amount = this.data.amount;
    console.log('INIT', this.amount);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.amount = this.data.amount;
    console.log(changes);
  }

  onButtonClick(status: boolean) {
    if (status)
      return this.btnTriggerEvent.emit({ paymentType: this.paymentType, amount: this.amount, refId: this.paymentRefNumber });
    this.btnTriggerEvent.emit(false);
  }
}

export type TPaymentOptions = 'CASH' | 'UPI' | 'CARD' | 'BANK TRANSFER'