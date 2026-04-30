import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BranchWiseService, TTenantBranchDetails } from '../branch-wise.service';
import { tap } from 'rxjs/internal/operators/tap';
import { TableComponent, TActionBtnConfig, TActionButtonTriggers } from 'src/app/ui/shared/components/table/table.component';
import { BmPaginationComponent } from 'src/app/ui/shared/components/bm-pagination/bm-pagination.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-branch-list',
  imports: [AsyncPipe, TableComponent, BmPaginationComponent],
  templateUrl: './branch-list.component.html',
  styleUrl: './branch-list.component.css'
})
export class BranchListComponent {
  private branchService = inject(BranchWiseService);
  private router = inject(Router);

  limit = '10';
  selectedPage = 1;
  offset = '0';
  totalPages = 1;

  actionBtnConfig: Partial<TActionBtnConfig> = { viewBtn: true }

  productsTableColumn: { key: string, label: string, align?: 'left' | 'center' | 'right' }[] = [
    { key: 'sno', label: 'S.No' },
    { key: 'branch_name', label: 'Branch Name' },
    { key: 'branch_code', label: 'Branch Code' },
    { key: 'phone_number', label: 'Phone Number' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'inventory', label: 'Inventory', align: 'center' },
    { key: 'low_stock_count', label: 'Low Stock (<100)', align: 'center' },
    { key: 'out_of_stock', label: 'Out of Stock', align: 'center' },
  ];

  productTableRows: any[] = [];

  branchListObs = this.fetchBranchList();

  onPageChange(event: number) {
    this.offset = ((event - 1) * +this.limit).toString();
    this.selectedPage = event;
    this.fetchBranchList().subscribe();
  }

  onRouteTo(path: '/stocks/purchases' | '/stocks/transfer' | "/branch/allocate-product" | '/branch/create-branch') {
    this.router.navigate([path]);
  }

  fetchBranchList() {
    return this.branchService.getBranchList(this.limit, this.offset).pipe(tap(res => this.mapDataIntoTableRows(res)))
  }

  onPageLimitChange(event: string) {
    this.limit = event;
    this.fetchBranchList().subscribe()
  }
  onTableAction(event: { action: TActionButtonTriggers, id: number }) {
    switch (event.action) {
      case 'viewBtn':
        // new Branch view component
        break;
    }
  }
  private mapDataIntoTableRows = (schProductList: TTenantBranchDetails[]) => {
    this.productTableRows = [];
    this.totalPages = Math.ceil(+schProductList[0].total_count / +this.limit);
    schProductList.forEach((ele, i) => {
      const tempEle = {
        [i]: [
          { col: 'sno', value: (i + 1).toString() },
          { col: 'branch_name', value: `${ele.branch_name} - ${ele.branch_type}` },
          { col: 'branch_code', value: ele.branch_code },
          { col: 'phone_number', value: ele.phone_number },
          { col: 'address', value: ele.address },
          { col: 'city', value: ele.city },
          { col: 'inventory', value: Number(ele.qty).toFixed(2) },
          { col: 'low_stock_count', value: ele.low_count, class: 'bm-chip-warning' },
          { col: 'out_of_stock', value: ele.out_of_stock, class: 'bm-chip-danger' },
        ]
      }
      this.productTableRows.push(tempEle);
    });
  }
}
