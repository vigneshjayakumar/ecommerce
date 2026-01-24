import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private httpClient = inject(HttpClient);

  getSalesReport(payload: { start: string; end: string }) {
    return this.httpClient.get(
      `${environment.apiBaseURL}/insights/sales-report`,
      { params: payload },
    );
  }
}
