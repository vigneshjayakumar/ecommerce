import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-bm-select',
  imports: [NgClass],
  templateUrl: './bm-select.component.html',
  styleUrl: './bm-select.component.css'
})
export class BmSelectComponent implements OnInit {
  @Input({ required: true }) options: { label: string; value: any }[] = [];
  @Input() position: string = ''

  @Output() valueChange = new EventEmitter;
  isOpen = false;

  selectedValue = 'Select';

  ngOnInit(): void {
    if (this.options.length) {
      this.selectedValue = this.options[0].label;
    }
  }

  select(option: { label: string, value: any }) {
    this.selectedValue = option.label
    this.valueChange.emit(option.value)
    // this.value = option.value;
    this.isOpen = false;
  }
}
