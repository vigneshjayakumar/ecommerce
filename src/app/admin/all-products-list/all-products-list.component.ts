import { Component, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, Subscription, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';

import { TAdminProductList, TProduct } from './all-products.modal';
import { AdminProductService } from '../admin-product.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TableComponent, TActionBtnConfig, TActionButtonTriggers } from 'src/app/ui/shared/components/table/table.component';
import { BmPaginationComponent } from 'src/app/ui/shared/components/bm-pagination/bm-pagination.component';
import { BmSelectComponent } from 'src/app/ui/shared/components/bm-select/bm-select.component';
import { BranchWiseService } from 'src/app/branch-wise/branch-wise.service';
import { GlobalSearchService } from 'src/app/common/services/globalSearch.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-all-products-list',
  imports: [ReactiveFormsModule, TableComponent, BmPaginationComponent, BmSelectComponent],
  templateUrl: './all-products-list.component.html',
  styleUrl: './all-products-list.component.css',
})
export class AllProductsListComponent implements OnInit, OnDestroy {
  // Refactoring for new UI.
  actionBtnConfig: Partial<TActionBtnConfig> = { viewBtn: true, editBtn: true, deleteBtn: true }
  productsTableColumn: { key: string, label: string, align?: 'left' | 'center' | 'right' }[] = [
    { key: 'sno', label: 'S.No', align: 'left' },
    { key: 'product_name', label: 'Product Name' },
    { key: 'qty', label: 'Quantity (Units)' },
    { key: 'sell_price', label: 'Selling Price' },
    { key: 'tax_percent', label: 'Tax(%)' },
    { key: 'hsn_code', label: 'HSN Code' },
    { key: 'sku_code', label: 'SKU Code' },
    { key: 'isActive', label: 'Is Active', align: 'right' }
  ];

  productTableRows: { [key: number]: { col: string, value: string }[] }[] = [];

  onTableAction(event: { action: TActionButtonTriggers, id: number }) {
    const id = this.searchProductList[event.id].id;
    switch (event.action) {
      case 'editBtn':
        this.onEdit(+id);
        break;
      case 'deleteBtn':
        this.onDelete(+id);
        break;
      case 'viewBtn':
        this.onView(+id);
        break;
    }
  }
  // 
  limit = '10';
  offset = '0';
  selectedPage = 1;
  totalPages: number = 1;

  branchesList: { value: number, label: string }[] = [{ value: 0, label: 'All' }];
  selectedBranch = 'All'

  subsList: Subscription[] = [];
  productsList: TAdminProductList['response']['products'] = [];
  searchProductList: TAdminProductList['response']['products'] = [];
  searchInput = new FormControl('');
  searchObs = this.searchInput.valueChanges
    .pipe(
      debounceTime(500),
      tap((searchTerm) => {
        if (searchTerm) {
          this.globalSearch({ key: 'q', value: searchTerm }, { key: 'branchesId', value: this.branchArr })
            .subscribe(((searchRes) => { this.searchProductList = searchRes as TProduct[]; this.mapDataIntoTableRows(this.searchProductList); }))
          return this.searchProductList;
        }
        this.searchProductList = this.productsList;
        this.mapDataIntoTableRows(this.searchProductList);
        return this.searchProductList;
      }),
    )
    .subscribe();
  constructor(
    private adminProductService: AdminProductService,
    private router: Router, private branchService: BranchWiseService, private globalSearchService: GlobalSearchService
  ) { }

  ngOnInit(): void {
    const subs = this.branchService.getBranchList('10', '0').pipe(
      tap(res => {
        this.branchesList = [...this.branchesList, ...res.map(ele => ({ value: +ele.id, label: ele.branch_name }))]
        this.selectedBranch = this.branchesList[0].value.toString();
      }), switchMap(() => {
        this.branchArr = this.branchesList.map(ele => ele.value);
        return this.getAllProductsList()
      })
    ).subscribe();
    this.subsList.push(subs);
  }

  private globalSearch(...args: { key: string, value: any }[]) {
    let params = new HttpParams();
    for (const arg of args) {
      params = params.set(arg.key, arg.value);
    }
    return this.globalSearchService.search('PRODUCT', params)
  }

  onEdit(productId: number) {
    this.router.navigate(['/admin/edit/', productId]);
  }

  onView(productId: number) {
    this.router.navigate(['/admin/view/', productId, true])
  }
  onDelete(productId: number) {
    this.adminProductService
      .postDeleteProductById(productId)
      .pipe(switchMap((res) => this.getAllProductsList()))
      .subscribe();
  }

  onSelectChange(event: string) {
    this.selectedBranch = event;
    if (+this.selectedBranch === 0) {
      this.branchArr = this.branchesList.map(ele => +ele.value)
      this.getAllProductsList().subscribe();
    } else {
      this.branchArr = [+event]
      this.getAllProductsList().subscribe()
    }

  }

  branchArr: number[] = [];
  private getAllProductsList() {
    return this.adminProductService.getAllProductsList(this.limit, this.offset, this.branchArr).pipe(
      tap((productList) => {
        this.productsList = productList;
        this.searchProductList = this.productsList;
        this.totalPages = Math.ceil(+productList[0].total_count / +this.limit);
        this.mapDataIntoTableRows(this.searchProductList);
      }),
    );
  }

  onRoute(path: string) {
    this.router.navigate([path]);
  }

  private mapDataIntoTableRows = (schProductList: TProduct[]) => {
    this.productTableRows = [];
    schProductList.forEach((ele, i) => {
      const tempEle = {
        [i]: [
          { col: 'sno', value: (i + 1).toString() },
          { col: 'product_name', value: ele.product },
          { col: 'qty', value: `${ele.overall_count} (${ele.uom})` },
          { col: 'sell_price', value: ele.price.toString() },
          { col: 'tax', value: ele.taxpercent.toString() },
          { col: 'hsn', value: ele.hsn_code },
          { col: 'sku', value: ele.sku },
          { col: 'isActive', value: ele.is_active ? 'Active' : 'Inactive', class: this.activeClass(ele.is_active) }
        ]
      }
      this.productTableRows.push(tempEle)
    })
  }

  private activeClass(status: boolean) {
    let styleClass = 'bm-chip-success';
    if (!status) styleClass = 'bm-chip-danger'
    return styleClass
  }

  onPageLimitChange(event: string) {
    this.limit = event;
    this.offset = '0'
    this.selectedPage = 1;
    this.getAllProductsList().subscribe();
  }

  onPageChange(event: number) {
    this.offset = ((+event - 1) * +this.limit).toString();
    this.selectedPage = event;
    this.getAllProductsList().subscribe();
  }

  ngOnDestroy(): void {
    this.subsList.forEach((ele) => {
      if (ele) ele.unsubscribe();
    });
  }
}
