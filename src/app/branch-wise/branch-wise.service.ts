import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { TProduct } from "../admin/all-products-list/all-products.modal";
import { map, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class BranchWiseService {
    constructor(private httpClient: HttpClient) { }

    getBranchList(limit: string, offset: string) {
        const params = {
            limit, offset
        }
        return this.httpClient.get<{ message: 'SUCCESS' | 'ERROR', response: TTenantBranchDetails[] }>(
            `${environment.apiBaseURL}/branch/branch-list`, { params, withCredentials: true }
        ).pipe(map(res => res.response))
    }

    postCreateBranch(payload: TCreateBranch) {
        return this.httpClient.post(`${environment.apiBaseURL}/branch/create-branch`, payload, { withCredentials: true })
    }

    getUnallocatedProductsList(): Observable<TUnAllocatedProductRes['response']> {
        return this.httpClient.get<TUnAllocatedProductRes>(
            `${environment.apiBaseURL}/branch/unallocated-products`, { withCredentials: true }).pipe(
                map(res => res.response)
            )
    }

    postAllocateStockLedgerSnapshot(payload: {
        productID: number;
        productName: string;
        availCount: number, branches: { count: number, branchId: number, name: string }[]
    }) {
        return this.httpClient.post<{ message: 'ERROR' | 'SUCCESS', response: { isInserted: number, snapshot: number } }>(`${environment.apiBaseURL}/branch/allocate-ledger-snapshot`, payload, { withCredentials: true })
    }

}

export type TUnAllocatedProductRes = {
    message: 'SUCCESS' | 'ERROR',
    response: {
        productsList: (TProduct & {
            created_at: string;
            tenant_id: string;
            updated_at: string;
            updated_by: string;
        })[],
        branches: TTenantBranchDetails[]
    }
}

export type TCreateBranch = {
    'branchName': string,
    branchCode: string,
    branchType: string,
    address: string,
    city: string,
    state: string,
    pincode: number,
    phoneNumber: string,
    email: string,
    isActive: boolean
    isDefault: boolean,
    gstNumber: string
}

export type TTenantBranchDetails = {
    address: string;
    branch_code: string;
    branch_name: string;
    branch_type: string;
    city: string;
    created_at: string;
    created_by: string;
    email: string;
    gst_number: string;
    id: string;
    is_active: boolean;
    is_default_branch: boolean;
    phone_number: string;
    pincode: string;
    state: string;
    tenant_id: string;
    total_pages: string
}