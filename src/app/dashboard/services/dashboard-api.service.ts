import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TInvoiceSummary, TStockSummaryRes } from '../dashboard.component';
import { map, Observable } from 'rxjs';
import { IDateRange } from 'src/app/ui/shared/components/bm-date-range/bm-date-range.component';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private httpClient = inject(HttpClient);

  getSalesReport(payload: {
    start: string;
    end: string;
  }): Observable<TInvoiceSummary['response']> {
    return this.httpClient
      .get<TInvoiceSummary>(`${environment.apiBaseURL}/insights/sales-report`, {
        params: payload,
      })
      .pipe(map((res) => res.response));
  }
  getStockReport(): Observable<TStockSummaryRes['response']> {
    return this.httpClient
      .get<TStockSummaryRes>(`${environment.apiBaseURL}/insights/stock-report`)
      .pipe(map((res) => res.response));
  }

  getTotalRevenueTrends(date: string) {
    const params = {
      date
    }
    return this.httpClient.get<TTotalRevenueTrends>(`${environment.apiBaseURL}/insights/totalRevenueTrends`, { params, withCredentials: true })
  }

  getRevenueGraph(days: string, branchId: string) {
    const params = {
      days, branchId
    }
    return this.httpClient.get<TRevenueGraphData>(`${environment.apiBaseURL}/insights/revenue-graph`, { params, withCredentials: true })
  }

  getTopSeller(days: string, branchId: string) {
    const params = {
      days, branchId
    }
    return this.httpClient.get<TTopSellerGraphData>(`${environment.apiBaseURL}/insights/top-seller`, { params, withCredentials: true })
  }

  getTotalItemsBranchwise() {
    return this.httpClient.get<TTotalItemsCountBranchwise>(`${environment.apiBaseURL}/insights/total-items-branchwise`, { withCredentials: true })
  }

  getInvocieDailyPrint(dateRange: IDateRange) {
    return this.httpClient.post<TOverallInvoicePrintRes>(`${environment.apiBaseURL}/insights/print-invoice-report`, { dateRange }, { withCredentials: true })
  }

  getPurchaseDailyPrint(dateRange: IDateRange) {
    return this.httpClient.post<TOverAllPurchasePrintRes>(`${environment.apiBaseURL}/insights/print-purchase-report`, { dateRange }, { withCredentials: true })
  }

  getTransferDailyPrint(dateRange: IDateRange) {
    return this.httpClient.post<TOverallTransferPrintRes>(`${environment.apiBaseURL}/insights/print-transfer-report`, { dateRange }, { withCredentials: true })
  }


}

export type TTotalRevenueTrends = {
  "message": "SUCCESS",
  "response":
  {
    totalRevenue: {
      "current_revenue": string,
      "previous_revenue": string,
      "trend_percent": string,
      "trend_direction": string
    }
    invoiceStatusDetails: {
      paid: any[],
      cancelled: any[],
      confirmed: any[]
    }
  }
}

export type TRevenueGraphData = {
  message: 'SUCCESS' | 'ERROR',
  response: {
    revenueGraph: { date: string, revenue: string }[]
  }
}

export type TTopSellerGraphData = {
  "message": "SUCCESS",
  "response": {
    "topSeller": {
      "name": string,
      "value": string,
      "percent": string
    }[]
  }
}

export type TTotalItemsCountBranchwise = {
  "message": "SUCCESS",
  "response": {
    "totalItems": {
      "total_products": string,
      "total_stock_quantity": string,
      "low_stock_count": string,
      "out_of_stock_count": string,
      critical_stock_count: string
    }
  }
}

export type TOverAllPurchasePrintRes = TGenericMessageRes & {
  response: {
    "created_at": string,
    "branch_name": string,
    "total_qty": string,
    "total_cost": string,
    "purchase_no": string,
  }[]
}

export type TOverallInvoicePrintRes = TGenericMessageRes & {
  response: {
    "invoice_number": string,
    "total_amount": string,
    "invoice_status": string,
    "created_at": string,
  }[],
}

export type TOverallTransferPrintRes = TGenericMessageRes & {
  response: {
    "from_branch_id": string,
    "to_branch_id": string,
    "total_qty": string,
    "total_items": number,
    "transfer_no": string,
  }[]
}

export type TGenericMessageRes = { message: 'ERROR' | 'SUCCESS' }