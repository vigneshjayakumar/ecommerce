import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements AfterViewInit {
  @Input({ required: true }) columns: { key: string, label: string, align?: 'left' | 'center' | 'right' }[] = [];
  @Input({ required: true }) rows: {
    [key: number]: string[]
  }[] = [];
  @Input({ required: true }) showCheckbox: boolean = false;
  @Input({ required: true }) showAction = true;

  @Output() actionEmit = new EventEmitter();

  ngAfterViewInit(): void {
    console.log(this.rows)
  }

  onEmitAction(action: string, id: number) {
    this.actionEmit.emit({ action, id })
  }
}
