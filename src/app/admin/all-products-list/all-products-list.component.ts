import { Component, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, Subscription, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';

import { TAdminProductList, TProduct } from './all-products.modal';
import { AdminProductService } from '../admin-product.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from 'src/app/ui/shared/components/table/table.component';
import { BmPaginationComponent } from 'src/app/ui/shared/components/bm-pagination/bm-pagination.component';

@Component({
  selector: 'app-all-products-list',
  imports: [ReactiveFormsModule, TableComponent, BmPaginationComponent],
  templateUrl: './all-products-list.component.html',
  styleUrl: './all-products-list.component.css',
})
export class AllProductsListComponent implements OnInit, OnDestroy {
  // Refactoring for new UI.
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

  productTableRows: { [key: number]: string[] }[] = [];

  onTableAction(event: { action: string, id: number }) {
    const id = this.searchProductList[event.id].id;
    switch (event.action) {
      case 'edit':
        this.onEdit(id);
        break;
      case 'delete':
        this.onDelete(id);
        break;
      case 'view':
        this.onView(id);
        break;
    }
  }
  // 
  subsList: Subscription[] = [];
  productsList: TAdminProductList['response']['products'] = [];
  searchProductList: TAdminProductList['response']['products'] = [];
  searchInput = new FormControl('');
  searchObs = this.searchInput.valueChanges
    .pipe(
      debounceTime(500),
      tap((searchTerm) => {
        if (searchTerm) {
          this.searchProductList = this.productsList.filter(
            (ele) =>
              ele.product_name
                .toLocaleLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              ele.sku
                .toLocaleLowerCase()
                .includes(searchTerm.toLowerCase()),
          );
          this.mapDataIntoTableRows(this.searchProductList);
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
    private router: Router,
  ) { }

  ngOnInit(): void {
    const subs = this.getAllProductsList().subscribe();
    this.subsList.push(subs);
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

  private getAllProductsList() {
    return this.adminProductService.getAllProductsList().pipe(
      tap((productList) => {
        this.productsList = productList;
        this.searchProductList = this.productsList;
        this.mapDataIntoTableRows(this.searchProductList);
      }),
    );
  }

  onRoute(path: string) {
    this.router.navigate([path]);
  }

  private mapDataIntoTableRows = (schProductList: TProduct[]) => {
    this.productTableRows = [];
    console.log(schProductList, this.productsList)
    schProductList.forEach((ele, i) => {
      const tempEle = {
        [i]: [
          (i + 1).toString(),
          ele.product_name,
          `${ele.stock_count} (${ele.uom})`,
          ele.price.toString(),
          ele.tax_percent.toString(),
          ele.hsn_code,
          ele.sku,
          ele.is_active ? 'Active' : 'Inactive'
        ]
      }
      this.productTableRows.push(tempEle)
    })

  }

  ngOnDestroy(): void {
    this.subsList.forEach((ele) => {
      if (ele) ele.unsubscribe();
    });
  }
}
