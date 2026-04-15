import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BranchWiseService, TTenantBranchDetails } from '../branch-wise.service';
import { tap } from 'rxjs/internal/operators/tap';
import { TableComponent } from 'src/app/ui/shared/components/table/table.component';
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

  productsTableColumn: { key: string, label: string, align?: 'left' | 'center' | 'right' }[] = [
    { key: 'sno', label: 'S.No' },
    { key: 'branch_name', label: 'Branch Name' },
    { key: 'branch_code', label: 'Branch Code' },
    { key: 'phone_number', label: 'Phone Number' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'inventory', label: 'Inventory', align: 'center' },
    { key: 'low_stock_count', label: 'Low Stock', align: 'center' },
    { key: 'out_of_stock', label: 'Out of Stock', align: 'center' },
  ];

  productTableRows: any[] = [];

  branchListObs = this.branchService.getBranchList().pipe(tap(res => this.mapDataIntoTableRows(res)));

  onTableAction(event: any) { }

  onRouteToCreateBranch() {
    this.router.navigate(['/branch/create-branch']);
  }

  private mapDataIntoTableRows = (schProductList: TTenantBranchDetails[]) => {
    this.productTableRows = [];
    schProductList.forEach((ele, i) => {
      const tempEle = {
        [i]: [
          { col: 'sno', value: (i + 1).toString() },
          { col: 'branch_name', value: ele.branch_name },
          { col: 'branch_code', value: ele.branch_code },
          { col: 'phone_number', value: ele.phone_number },
          { col: 'address', value: ele.address },
          { col: 'city', value: ele.city },
          { col: 'inventory', value: 100 },
          { col: 'low_stock_count', value: 20, class: 'bm-chip-warning' },
          { col: 'out_of_stock', value: 10, class: 'bm-chip-danger' },
        ]
      }
      this.productTableRows.push(tempEle);
    });
  }
}
