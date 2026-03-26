import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";

import { environment } from "src/environments/environment";
import { TTransferPayload } from "./transfer-products.component";

@Injectable({ 'providedIn': 'root' })
export class TransferService {
    private httpClient = inject(HttpClient);

    getBranchLists() {
        return this.httpClient.get<TBranchListResp>(`${environment.apiBaseURL}/transfer/get-branch-list`, { withCredentials: true }).pipe(map(res => res.response))
    }

    getProductListByBranchId(branchId: number) {
        return this.httpClient.get<TProductByBranchIdRes>(`${environment.apiBaseURL}/transfer/getProductsByBranchId/${branchId}`, { withCredentials: true }).pipe(map(res => res.response))
    }

    postStockTransferBtnBranch(payload: TTransferPayload) {
        return this.httpClient.post(`${environment.apiBaseURL}/transfer/postStockTransfer`, payload, { withCredentials: true })
    }
}


type TBranchListResp = {
    "message": "SUCCESS" | 'ERROR',
    "response": {
        "id": string,
        "branch_name": string
    }[]
}

export type TProductByBranchIdRes = {
    "message": "SUCCESS" | 'ERROR',
    "response": {
        "id": string,
        "tenant_id": string,
        "product_id": string,
        "branch_id": string,
        "current_qty": string,
        "last_updated_at": string,
        "stock_value": string,
        uom: string,
        price: string,
        tax_percent: string,
        product_name: string,
        destProductQty?: number,
        shiftCount?: number
    }[]
}