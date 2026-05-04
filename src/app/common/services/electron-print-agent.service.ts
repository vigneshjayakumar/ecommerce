import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

import { environment } from "src/environments/environment";



@Injectable({
    providedIn: 'root'
})
export class ElectronPrintService {
    private httpClient = inject(HttpClient);

    postPrint(payload: TPrinterPayload) {
        return this.httpClient.post(`${environment.printAgent}/print`, payload)
    }

    getUSBDetails() {
        return this.httpClient.get(`${environment.printAgent}/usb-devices`)
    }

    smallTestPrint() {
        return this.httpClient.post(`${environment.printAgent}/print`, {
            "transport": "native-usb",
            "vendorId": 4070,
            "productId": 33054,
            "format": "text",
            "text": "NATIVE USB TEST\nYICHIP POS58\n",
            "cut": true
        })
    }
}


export type TPrinterPayload = {
    "transport": "usb",
    "title": "Invoice",
    "vendorId": 4070,
    "productId": 33054,
    "subtitle": string,
    "address": string,
    "invoiceNo": string,
    "orderNo": string,
    "date": string,
    "items": {
        "name": string,
        "qty": number,
        "price": string,
        "total": string,
    }[],
    "subtotal": string,
    "tax": string,
    "discount": string,
    "total": string,
    "paid": string,
    "balance": string,
    "footer": "Thank You!!!",
    "cut": true
}