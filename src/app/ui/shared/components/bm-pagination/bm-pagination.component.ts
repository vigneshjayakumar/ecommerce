import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-bm-pagination',
  imports: [NgClass],
  templateUrl: './bm-pagination.component.html',
  styleUrl: './bm-pagination.component.css'
})
export class BmPaginationComponent {
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  countPerPageOptions = [
    { value: 10, lable: '10 / Page' },
    { value: 15, lable: '15 / Page' },
    { value: 20, lable: '20 / Page' },
    { value: 25, lable: '25 / Page' },

  ]

  get pages(): number[] {
    const pagesArr = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    if (this.totalPages > 6) {
      pagesArr.splice(0, 1);
      pagesArr.splice(-1, this.totalPages - 6)
    }
    return pagesArr
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.pageChange.emit(page);
  }

}
