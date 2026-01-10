import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private httpClient = inject(HttpClient);
  private validatedProductList: TCalculatedInvoiceRes['response'] = {
    calculatedInvoiceItems: [],
    total: {
      totalAmount: 0,
      totalPrice: 0,
      totalTax: 0,
    },
  };

  get validated_products_list() {
    return this.validatedProductList;
  }

  private invoiceItemsArr: {
    isEditMode: boolean;
    items: TInvoicePostPayload['items'];
    calculateFromDB: boolean;
  } = {
    isEditMode: true,
    items: [],
    calculateFromDB: false,
  };
  private invoiceItemsArrListener = new BehaviorSubject<
    typeof this.invoiceItemsArr
  >(this.invoiceItemsArr);
  public readonly invoiceArrObs = this.invoiceItemsArrListener.asObservable();

  setInvoiceItemsArr<T extends typeof this.invoiceItemsArr>(data: T) {
    this.invoiceItemsArr = data;
    this.invoiceItemsArrListener.next(this.invoiceItemsArr);
  }

  private postInvoiceDetails: TInvoicePostPayload = INIT_POST_INVOICE_PAYLOAD;
  set post_Invoice_details(data: TInvoicePostPayload) {
    this.postInvoiceDetails = { ...this.postInvoiceDetails, ...data };
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
    return this.httpClient
      .post<TCalculatedInvoiceRes>(
        `${environment.localURL}/invoice/validateInvoiceDetails`,
        { invoiceDetails: this.postInvoiceDetails },
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          if (res.message === 'SUCCESS') {
            this.validatedProductList = res.response;
          }
        })
      );
  }

  generateInvoice() {
    return this.httpClient.post(
      `${environment.localURL}/invoice/generateInvoice`,
      {
        invoiceDetails: this.postInvoiceDetails,
      }
    );
  }

  fetchInvoiceLists() {
    return this.httpClient
      .get<TGetInvoiceLists>(
        `${environment.localURL}/invoice/getInvoiceLists`,
        { withCredentials: true }
      )
      .pipe(map((res) => res.response.data));
  }

  onCancelInvoice(id: number) {
    return this.httpClient.delete(
      `${environment.localURL}/invoice/onCancelInvoice/${id}`,
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
  items: {
    productId: number;
    quantity: number;
  }[];
};

const INIT_POST_INVOICE_PAYLOAD: TInvoicePostPayload = {
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

export type TCalculatedInvoiceRes = {
  message: string;
  response: {
    calculatedInvoiceItems: TCalculatedBillItem[];
    total: {
      totalAmount: number;
      totalPrice: number;
      totalTax: number;
    };
  };
};

type TCalculatedBillItem = {
  productName: string;
  quantity: number;
  price: number;
  taxRate: number;
  amount: number;
  productId: number;
};

export type TGetInvoiceLists = {
  message: 'SUCCESS' | 'ERROR';
  response: {
    data: TInvoiceListEle[];
  };
};

type TInvoiceListEle = {
  id: number;
  tenant_id: number;
  invoice_number: string;
  invoice_type: string;
  customer_name: string;
  customer_gstin: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  invoice_status: 'DRAFT' | 'PAID' | 'CANCELLED';
  created_by: number;
  created_at: Date;
};
