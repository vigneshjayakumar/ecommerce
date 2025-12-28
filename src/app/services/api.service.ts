import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/internal/operators/map';
import { TAdminProductList } from '../admin/all-products-list/all-products.modal';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private httpClient: HttpClient) {}

  getAllProductsList(): Observable<TAdminProductList['products']> {
    return this.httpClient
      .get<TAdminProductList>(`${environment.localURL}/admin/products`)
      .pipe(map((res) => res.products));
  }
}
