import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/internal/operators/map';

import {
  TAdminProductList,
  TProduct,
} from './all-products-list/all-products.modal';
import { ApiHttpService } from '../api-http.service';

@Injectable({
  providedIn: 'root',
})
export class AdminProductService {
  private httpClient = inject(HttpClient);
  private apiService = inject(ApiHttpService);

  postNewproduct(productDetails: TPostNewProductPayload) {
    return this.httpClient.post<{ message: string }>(
      `${environment.apiBaseURL}/admin/addProduct`,
      productDetails,
      {
        withCredentials: true,
      }
    );
  }

  postEditProduct(
    productDetails: TPostNewProductPayload & { productId: number }
  ) {
    return this.httpClient.post<{ message: string }>(
      `${environment.apiBaseURL}/admin/editProductByProductId`,
      productDetails,
      { withCredentials: true }
    );
  }

  getProductDetailById(productId: number) {
    return this.httpClient.get<TProductByIdRes>(
      `${environment.apiBaseURL}/admin/product/${productId}`,
      { withCredentials: true }
    );
  }

  postDeleteProductById(productId: number) {
    return this.httpClient.post(
      `${environment.apiBaseURL}/admin/deleteProduct`,
      { productId: productId },
      { withCredentials: true }
    );
  }

  getAllProductsList(): Observable<TAdminProductList['response']['products']> {
    return this.apiService
      .apiHttp<never, TAdminProductList, never>(
        'get',
        environment.apiBaseURL,
        'admin',
        ['products']
      )
      .pipe(map((res) => res.response.products));
  }
}

export type TPostNewProductPayload = {
  productName: string;
  stockCount: number;
  description: string;
  hsnCode: string;
  sku: string;
  uom: string,
  taxPercent: number;
  price: number;
  isActive: 0 | 1;
};

type TProductByIdRes = { message: string; response: { product: TProduct } };
