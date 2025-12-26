import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { TAdminProductList } from './all-products.modal';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-all-products-list',
  imports: [NgClass],
  templateUrl: './all-products-list.component.html',
  styleUrl: './all-products-list.component.css',
})
export class AllProductsListComponent implements OnInit, OnDestroy {
  subsList: Subscription[] = [];
  productsList: TAdminProductList['products'] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    const subs = this.apiService
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

  ngOnDestroy(): void {
    this.subsList.forEach((ele) => {
      if (ele) ele.unsubscribe();
    });
  }
}
