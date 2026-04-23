import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { TPaymentOptions } from 'src/app/common/components/payment-confirmation-popup/payment-confirmation-popup.component';
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
        `${environment.apiBaseURL}/invoice/merchantDetails`,
        { withCredentials: true },
      )
      .pipe(map((res) => res.response.merchantData));
  }

  fetchProductList() {
    return this.httpClient.get(
      `${environment.apiBaseURL}/utils/getAllProductListByTenentId`,
      { withCredentials: true },
    );
  }

  validateInvoiceDetails() {
    return this.httpClient
      .post<TCalculatedInvoiceRes>(
        `${environment.apiBaseURL}/invoice/validateInvoiceDetails`,
        { invoiceDetails: this.postInvoiceDetails },
        { withCredentials: true },
      )
      .pipe(
        tap((res) => {
          if (res.message === 'SUCCESS') {
            this.validatedProductList = res.response;
          }
        }),
      );
  }

  generateInvoice(idompotencyKey: string) {
    return this.httpClient.post<{
      message: string;
      response: {
        data: {
          "id": string,
          "invoice_number": string,
          "created_at": string
        }[]
      };
    }>(
      `${environment.apiBaseURL}/invoice/generateInvoice`,
      {
        invoiceDetails: this.postInvoiceDetails,
      },
      { headers: { 'Idempotency-Key': idompotencyKey } },
    );
  }

  fetchInvoiceLists(limit: string, offset: string) {
    const params = {
      limit,
      offset
    }
    return this.httpClient
      .get<TGetInvoiceLists>(
        `${environment.apiBaseURL}/invoice/getInvoiceLists`,
        { params, withCredentials: true },
      )
      .pipe(map((res) => res.response.data));
  }

  onCancelInvoice(id: number) {
    return this.httpClient.delete<{ message: string; response: string }>(
      `${environment.apiBaseURL}/invoice/onCancelInvoice/${id}`,
      { withCredentials: true },
    );
  }

  markAsPaid(id: number, payLoad: { paymentType: TPaymentOptions, amount: number, refId?: string }) {
    return this.httpClient.patch(`${environment.apiBaseURL}/invoice/payInvoice/${id}`, payLoad, { withCredentials: true })
  }

  fetchInvoiceDetailsById(invoiceId: number) {
    return this.httpClient.get<TViewInvoiceDetailsRes>(
      `${environment.apiBaseURL}/invoice/getInvoiceDetailsById/${invoiceId}`,
      { withCredentials: true },
    );
  }

  createInvoicePdf(invoiceId: number) {
    return this.httpClient.get<{ message: 'COMPLETED' | 'ERROR', response: string }>(
      `${environment.apiBaseURL}/invoice/generateInvoice/${invoiceId}`,
      { withCredentials: true },
    );
  }

  shareInvoicePdfViaEmail(data: { email: string; invoiceId: number }) {
    return this.httpClient.post(
      `${environment.apiBaseURL}/invoice/shareInvoiceViaEmail`,
      data,
    );
  }

  generateLink(invoiceId: number) {
    return this.httpClient.get<{
      message: 'SUCCESS' | 'ERROR';
      response: string;
    }>(`${environment.apiBaseURL}/invoice/generatePDFLink/${invoiceId}`);
  }

  confirmInvoiceById(invoiceId: number) {
    return this.httpClient.patch(`${environment.apiBaseURL}/invoice/confirmInvoice/${invoiceId}`, {}, { withCredentials: true })
  }

  onPostSalesReturn(payload: { invoiceId: string, items: { invoiceItemId: number, quantity: number }[] }) {
    return this.httpClient.post(`${environment.apiBaseURL}/invoice/sales-return`, payload, { withCredentials: true })
  }

  getOverallSalesReport() {
    return this.httpClient.get(`${environment.apiBaseURL}/insights/cummilativeSalesReport`, { withCredentials: true })
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
  branchId: number,
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
  branchId: 0,
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

export type TInvoiceListEle = {
  id: number;
  tenant_id: number;
  invoice_number: string;
  invoice_type: string;
  customer_name: string;
  customer_gstin: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  invoice_status: 'DRAFT' | 'PAID' | 'CANCELLED' | 'CONFIRMED';
  created_by: number;
  created_at: Date;
  total_pages: string
};

export type TViewInvoiceDetailsRes = {
  message: 'SUCCESS' | 'ERROR';
  response: {
    overAll: {
      id: number;
      tenant_id: number;
      invoice_number: string;
      invoice_type: string;
      customer_name: string;
      customer_gstin: string;
      subtotal: string;
      tax_amount: string;
      total_amount: string;
      invoice_status: string;
      created_by: string;
      created_at: Date;
    };
    items: TViewInvoiceDetailsItemsArr[];
  };
};

type TViewInvoiceDetailsItemsArr = {
  id: number;
  invoice_id: number;
  product_id: number;
  product_name_snapshot: string;
  hsn_code: string;
  quantity: number;
  price_snapshot: string;
  tax_rate: string;
  tax_amount: string;
  line_total: string;
  tenant_id: number;
};
