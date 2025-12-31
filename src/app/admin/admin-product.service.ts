import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { TAdminProductList } from './all-products-list/all-products.modal';
import { map } from 'rxjs/internal/operators/map';
import { ApiHttpService } from '../api-http.service';

@Injectable({
  providedIn: 'root',
})
export class AdminProductService {
  private httpClient = inject(HttpClient);
  private apiService = inject(ApiHttpService);

  private productDetails: TPostNewProductPayload = {
    productName: '',
    description: '',
    price: 0,
    stockCount: 0,
    taxPercent: 0,
    hsnCode: '',
    isActive: 0,
  };

  set Product_details(details: TPostNewProductPayload) {
    this.productDetails = details;
  }

  get Product_details() {
    return this.productDetails;
  }

  //   postNewproduct(productDetails: TPostNewProductPayload) {
  //     return this.apiService.apiHttp('post',environment.localURL,'admin',['addProduct'],productDetails).post(
  //       `${environment.localURL}/admin/addProduct`,
  //       productDetails,
  //       {
  //         withCredentials: true,
  //       }
  //     );
  //   }
  postNewproduct(productDetails: TPostNewProductPayload) {
    return this.httpClient.post(
      `${environment.localURL}/admin/addProduct`,
      productDetails,
      {
        withCredentials: true,
      }
    );
  }

  postEditProduct(
    productDetails: TPostNewProductPayload & { productId: number }
  ) {
    return this.httpClient.post(
      `${environment.localURL}/admin/editProductByProductId`,
      productDetails,
      { withCredentials: true }
    );
  }

  getAllProductsList(): Observable<TAdminProductList['products']> {
    return this.apiService
      .apiHttp<never, TAdminProductList, never>(
        'get',
        environment.localURL,
        'admin',
        ['products']
      )
      .pipe(map((res) => res.products));
  }
}

export type TPostNewProductPayload = {
  productName: string;
  stockCount: number;
  description: string;
  hsnCode: string;
  taxPercent: number;
  price: number;
  isActive: 0 | 1;
};
