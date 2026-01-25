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
}
