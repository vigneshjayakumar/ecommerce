import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BmSelectComponent } from '../bm-select/bm-select.component';

@Component({
  selector: 'app-bm-pagination',
  imports: [NgClass, BmSelectComponent],
  templateUrl: './bm-pagination.component.html',
  styleUrl: './bm-pagination.component.css'
})
export class BmPaginationComponent {
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) totalPages = 1;

  @Input({ required: true }) pageCount = '10';

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageLimitChange = new EventEmitter<string>();

  countPerPageOptions = [
    { value: 10, label: '10 / Page' },
    { value: 15, label: '15 / Page' },
    { value: 20, label: '20 / Page' },
    { value: 25, label: '25 / Page' },

  ]

  get pages(): number[] {
    const pagesArr = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    if (this.totalPages > 6) {
      pagesArr.splice(0, 1);
      pagesArr.splice(-1, this.totalPages - 6)
    }
    return pagesArr
  }

  onPageLimtChange(event: string) {
    this.pageCount = event;
    this.pageLimitChange.emit(event);
  }
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.pageChange.emit(page);
  }

}
