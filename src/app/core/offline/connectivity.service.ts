import { Injectable } from "@angular/core";
import { fromEvent, map, merge, of } from "rxjs";


@Injectable({ providedIn: 'root' })
export class ConnectivityService {
    online$ = merge(
        of(navigator.onLine),
        fromEvent(window, 'online').pipe(map(() => true)),
        fromEvent(window, 'offline').pipe(map(() => false))
    )
}