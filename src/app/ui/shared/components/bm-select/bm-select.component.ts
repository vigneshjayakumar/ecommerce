import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bm-select',
  imports: [],
  templateUrl: './bm-select.component.html',
  styleUrl: './bm-select.component.css'
})
export class BmSelectComponent {
  @Input({ required: true }) options: { label: string; value: any }[] = [];
  @Input() value: any;
  isOpen = false;

  select(option: any) {
    this.value = option.value;
    this.isOpen = false;
  }

  get selectedLabel(): string {
  const found = this.options.find(o => o.value === this.value);
  return found ? found.label : 'Select';
}
}
