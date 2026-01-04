import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private httpClient = inject(HttpClient);

  fetchMerchentDetails(): Observable<TMerchantInfo> {
    return this.httpClient
      .get<TMerchantDataResponse>(
        `${environment.localURL}/invoice/merchantDetails`,
        { withCredentials: true }
      )
      .pipe(map((res) => res.response.merchantData));
  }

  fetchProductList() {
    return this.httpClient.get(
      `${environment.localURL}/utils/getAllProductListByTenentId`,
      { withCredentials: true }
    );
  }
}

export type TMerchantDataResponse = {
  message: string;
  response: {
    merchantData: TMerchantInfo;
  };
};

export type TMerchantInfo = {
  id: number;
  tenant_name: string;
  address: string;
  state: string;
  country: string;
  gstin: string;
  email_id: string;
  pincode: number;
};
