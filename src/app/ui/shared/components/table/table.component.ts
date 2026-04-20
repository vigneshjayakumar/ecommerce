import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-table',
  imports: [NgClass],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  @Input({ required: true }) columns: { key: string, label: string, align?: 'left' | 'center' | 'right' }[] = [];
  @Input({ required: true }) rows: {
    [key: number]: { col: string, value: string, class?: string, formatter?: (value: string) => string }[]
  }[] = [];
  @Input({ required: true }) showCheckbox: boolean = false;
  @Input({ required: true }) showAction = true;
  @Input() actionBtnConfig: Partial<TActionBtnConfig> = {
    viewBtn: false,
    deleteBtn: false,
    editBtn: false,
    cancelBtn: false,
    payNowBtn: false
  }

  @Output() actionEmit = new EventEmitter<{ action: TActionButtonTriggers, id: number }>();

  onEmitAction(action: TActionButtonTriggers, id: number) {
    this.actionEmit.emit({ action, id })
  }
}

export type TActionButtonTriggers = 'viewBtn' | 'deleteBtn' | 'cancelBtn' | 'editBtn' | 'pdfDownload' | 'payNowBtn';
export type TActionBtnConfig = { [key in TActionButtonTriggers]: boolean }