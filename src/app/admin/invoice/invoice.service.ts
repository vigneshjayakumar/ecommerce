import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private httpClient = inject(HttpClient);
  private postInvoiceDetails: TInvoicePostPayload = {
    customer: {
      address: '',
      gstin: '',
      name: '',
      phoneNumber: '',
    },
    invoiceDate: new Date().toDateString(),
    invoiceType: 'NON-GST',
    items: [],
  };

  set post_Invoice_details(data: TInvoicePostPayload) {
    this.postInvoiceDetails = { ...this.postInvoiceDetails, ...data };
    console.log('POST INVOICE DETAILS', this.postInvoiceDetails);
  }

  get post_Invoice_details() {
    return this.postInvoiceDetails;
  }

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

  validateInvoiceDetails() {
    return this.httpClient.post(
      `${environment.localURL}/invoice/validateInvoiceDetails`,
      { invoiceDetails: this.postInvoiceDetails },
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

export type TInvoicePostPayload = {
  invoiceType: 'GST' | 'NON-GST';
  invoiceDate: string;
  customer: {
    name: string;
    gstin: string | null;
    phoneNumber: string;
    address: string | null;
  };
  items?: {
    productId: number;
    quantity: number;
  }[];
};
