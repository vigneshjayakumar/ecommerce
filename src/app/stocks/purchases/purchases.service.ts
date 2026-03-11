import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";

import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class PurchasesService {
    private httpClient = inject(HttpClient);

    getDefaultBranch() {
        return this.httpClient.get<TDefaultBranchRes>(
            `${environment.apiBaseURL}/purchases/default-branch`, { withCredentials: true }
        ).pipe(map(res => res.response))
    }

    postPurchaseData(data: TPostPurchasesPayload) {
        return this.httpClient.post<{ message: 'SUCCESS' | 'ERROR' }>(`${environment.apiBaseURL}/purchases/post-purchases`, data, { withCredentials: true })
    }

}

export type TDefaultBranchRes = {
    "message": "SUCCESS" | 'ERROR',
    "response": {
        "branch_name": string,
        "branch_type": string,
        "branch_code": string,
        "is_default_branch": boolean,
        id: number
    }[]
}

export type TPostPurchasesPayload = {
    "branchId": number,
    "supplierId": number | '',
    "remarks": string,
    "idempotencyKey": string,
    "items":
    { "productId": number, "qty": number, "unitCost": number }[]
}