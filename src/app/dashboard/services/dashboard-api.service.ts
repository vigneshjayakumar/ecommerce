import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TInvoiceSummary, TStockSummaryRes } from '../dashboard.component';
import { map, Observable } from 'rxjs';

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