import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, Pipe } from '@angular/core';

@Component({
  selector: 'app-table',
  imports: [NgClass],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnChanges {
  @Input({ required: true }) columns: { key: string, label: string, align?: 'left' | 'center' | 'right' }[] = [];
  @Input({ required: true }) rows: {
    [key: number]: { col: string, value: string, class?: string, formatter?: (value: string) => string }[]
  }[] = [];
  @Input({ required: true }) showCheckbox: boolean = false;
  @Input({ required: true }) showAction = true;
  @Input({ required: true }) actionBtnConfig: Partial<TActionBtnConfig> = {
    viewBtn: false,
    deleteBtn: false,
    editBtn: false,
    cancelBtn: false,
    payNowBtn: false
  }

  @Output() actionEmit = new EventEmitter<{ action: TActionButtonTriggers, id: number }>();

  ngOnChanges(): void {
    // this.transformDataWithPipe()
    console.log(this.rows);
  }

  onEmitAction(action: TActionButtonTriggers, id: number) {
    this.actionEmit.emit({ action, id })
  }

  // private transformDataWithPipe() {
  //   this.rows.forEach((rows, i) => {
  //     rows[i] = rows[i].map(row => {
  //       const value = row.value;
  //       if (row.pipe instanceof DatePipe) {
  //         console.log('DATE')
  //         row.value = row.pipe.transform(row.value, 'short') ?? ''
  //       }
  //       return { ...row, value }
  //     })
  //   })
  // }
}

export type TActionButtonTriggers = 'viewBtn' | 'deleteBtn' | 'cancelBtn' | 'editBtn' | 'pdfDownload' | 'payNowBtn';
export type TActionBtnConfig = { [key in TActionButtonTriggers]: boolean }