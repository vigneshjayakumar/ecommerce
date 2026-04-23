import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-bm-select',
  imports: [NgClass],
  templateUrl: './bm-select.component.html',
  styleUrl: './bm-select.component.css'
})
export class BmSelectComponent {
  @Input({ required: true }) options: { label: string; value: any }[] = [];
  @Input() position: string = ''
  // @Input({ required: true }) value: string = '';
  @Input() value: string = '';

  @Output() valueChange = new EventEmitter;
  isOpen = false;

  select(option: any) {
    this.valueChange.emit(option.value)
    // this.value = option.value;
    this.isOpen = false;
  }


  get selectedLabel(): string {
    const found = this.options.find(o => o.value === this.value);
    return found ? found.label : 'Select';
  }
}
