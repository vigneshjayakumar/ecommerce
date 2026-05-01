import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

import { environment } from "src/environments/environment";



@Injectable({
    providedIn: 'root'
})
export class ElectronPrintService {
    private httpClient = inject(HttpClient);

    postPrint(payload: any) {
        return this.httpClient.post(`${environment.printAgent}/print`, payload)
    }
}