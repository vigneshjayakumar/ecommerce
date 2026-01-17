import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, switchMap, tap } from 'rxjs';
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
  productsList: TAdminProductList['response']['products'] = [];

  constructor(
    private adminProductService: AdminProductService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const subs = this.getAllProductsList().subscribe();
    this.subsList.push(subs);
  }

  onEdit(productId: number) {
    this.router.navigate(['/admin/edit/', productId]);
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
      }),
    );
  }

  onRoute() {
    this.router.navigate(['/admin/create-new']);
  }

  ngOnDestroy(): void {
    this.subsList.forEach((ele) => {
      if (ele) ele.unsubscribe();
    });
  }
}
