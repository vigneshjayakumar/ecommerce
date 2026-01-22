import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  };

  @Output() btnTriggerEvent = new EventEmitter<{
    status: boolean;
    email?: string;
  }>();

  email: string = '';
  
  onButtonClick(status: boolean) {
    if (status && this.data.isEmail)
      return this.btnTriggerEvent.emit({ status: true, email: this.email });
    if (status && !this.data.isEmail)
      return this.btnTriggerEvent.emit({ status: true });
    this.btnTriggerEvent.emit({ status: false });
  }
}
