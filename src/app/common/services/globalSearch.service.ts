import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { TProduct } from "src/app/admin/all-products-list/all-products.modal";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class GlobalSearchService {
    private httpClient = inject(HttpClient);
    private searchStrategies: Record<TSearchType, (query: HttpParams) => Observable<TProduct[] | unknown>> = {
        'BRANCH': (query) => this.searchBranch(query),
        'INVOICE': (query) => this.searchInvoice(query),
        'PRODUCT': (query) => this.searchProducts(query),
    }

    search(type: TSearchType, query: HttpParams) {
        return this.searchStrategies[type](query);
    }

    private searchBranch(query: HttpParams) {
        return this.httpClient.get(`${environment.apiBaseURL}/search/branch`, { params: query, withCredentials: true })
    }
    private searchInvoice(query: HttpParams) {
        return this.httpClient.get(`${environment.apiBaseURL}/search/invoice`, { params: query, withCredentials: true })
    }
    private searchProducts(query: HttpParams): Observable<TProduct[]> {
        return this.httpClient.get<{ message: 'SUCCESS' | 'ERROR', response: TProduct[] }>(
            `${environment.apiBaseURL}/search/product`,
            { params: query, withCredentials: true })
            .pipe(map((res) => res.response))
    }
}

export type TSearchType = 'INVOICE' | 'PRODUCT' | 'BRANCH'