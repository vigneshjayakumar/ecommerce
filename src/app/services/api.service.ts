import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/internal/operators/map';
import { TAdminProductList } from '../admin/all-products-list/all-products.modal';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private httpClient: HttpClient) {}

  getAllProductsList(): Observable<TAdminProductList['products']> {
    return this.httpClient
      .get<TAdminProductList>('http://localhost:8000/admin/products')
      .pipe(map((res) => res.products));
  }
}
