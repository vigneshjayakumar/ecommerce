import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map } from "rxjs/internal/operators/map";
import { environment } from "src/environments/environment";

@Injectable({ providedIn: 'root' })
export class UtilsService {
    private httpClient = inject(HttpClient);

    getUOMConstants() {
        return this.httpClient.get<TGetUOM>(`${environment.apiBaseURL}/utils/constants/get-uom`).pipe(map(res => res.response.list))
    }
}

type TGetUOM = { message: string, response: { list: TUOM } }
export type TUOM = { value: string, label: string }[]