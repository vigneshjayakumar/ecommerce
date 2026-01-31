import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-custom-popup-modal',
  imports: [FormsModule],
  templateUrl: './custom-popup-modal.component.html',
  styleUrl: './custom-popup-modal.component.css',
})
export class CustomPopupModalComponent {
  @Input({ required: true }) data!: {
    title: string;
    showCancelBtn: boolean;
    showConfirmBtn: boolean;
    isEmail: boolean;
    isShare: boolean;
  };

  @Output() btnTriggerEvent = new EventEmitter<
    | {
        status: boolean;
        email?: string;
      }
    | { type: 'copy' | 'watsapp'; phoneNumber?: string }
  >();

  email: string = '';
  phoneNumber: string = '';

  private clipboard=inject(Clipboard);

  onButtonClick(status: boolean) {
    if (status && this.data.isEmail)
      return this.btnTriggerEvent.emit({ status: true, email: this.email });
    if (status && !this.data.isEmail)
      return this.btnTriggerEvent.emit({ status: true });
    this.btnTriggerEvent.emit({ status: false });
  }

  onShareType(type: 'copy' | 'watsapp') {
    if (type === 'copy') {
      return this.btnTriggerEvent.emit({ type: type });
    } else {
      return this.btnTriggerEvent.emit({
        type: type,
        phoneNumber: this.phoneNumber,
      });
    }
  }
}
