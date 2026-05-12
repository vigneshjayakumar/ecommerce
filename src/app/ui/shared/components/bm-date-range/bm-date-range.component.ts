import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-bm-date-range',
  imports: [],
  templateUrl: './bm-date-range.component.html',
  styleUrl: './bm-date-range.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BmDateRangeComponent),
      multi: true
    }
  ]
})
export class BmDateRangeComponent implements ControlValueAccessor {
  @Input() placeholder = 'Select date range';
  value: IDateRange = { from: null, to: null };
  @Output() emitDate = new EventEmitter()
  isOpen = false;
  disabled = false;

  private onChange = (value: IDateRange) => { };
  private onTouched = () => { };

  writeValue(value: IDateRange): void {
    if (value) this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggle() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    this.onTouched();
  }

  onApplyDate() {
    this.isOpen = false;
    this.emitDate.emit(true)
  }

  updateFrom(date: string) {
    this.value = { ...this.value, from: date };
    this.emitChange();
  }

  updateTo(date: string) {
    this.value = { ...this.value, to: date };
    this.emitChange();
  }

  clear() {
    this.value = { from: null, to: null };
    this.emitChange();
  }

  private emitChange() {
    this.onChange(this.value);
  }

  get label(): string {
    if (this.value.from && this.value.to) {
      return `${this.value.from} — ${this.value.to}`;
    }
    return this.placeholder;
  }
}

export interface IDateRange {
  from: string | null;
  to: string | null;
}