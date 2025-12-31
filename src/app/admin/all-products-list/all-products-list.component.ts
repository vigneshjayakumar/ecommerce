import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

import { TAdminProductList } from './all-products.modal';
import { AdminProductService } from '../admin-product.service';

@Component({
  selector: 'app-all-products-list',
  imports: [NgClass],
  templateUrl: './all-products-list.component.html',
  styleUrl: './all-products-list.component.css',
})
export class AllProductsListComponent implements OnInit, OnDestroy {
  subsList: Subscription[] = [];
  productsList: TAdminProductList['products'] = [];

  constructor(
    private adminProductService: AdminProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const subs = this.adminProductService
      .getAllProductsList()
      .pipe(
        tap((res) => {
          this.productsList = res;
          console.log('RESPONES LISTS', this.productsList);
        })
      )
      .subscribe();
    this.subsList.push(subs);
  }

  onEdit(productDetails: (typeof this.productsList)[0]) {
    const data = {
      productName: productDetails.product_name,
      description: productDetails.description,
      hsnCode: productDetails.hsn_code,
      stockCount: productDetails.stock_count,
      taxPercent: productDetails.tax_percent,
      price: productDetails.price,
      isActive: productDetails.is_active,
    };
    this.adminProductService.Product_details = data;
    this.router.navigate(['/admin/edit/', productDetails.id]);
  }

  ngOnDestroy(): void {
    this.subsList.forEach((ele) => {
      if (ele) ele.unsubscribe();
    });
  }
}
