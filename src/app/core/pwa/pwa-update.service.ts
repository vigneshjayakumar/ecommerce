import { Injectable } from "@angular/core";
import { SwUpdate } from "@angular/service-worker";

@Injectable({
    providedIn: 'root'
})
export class PwaUpdateService {
    constructor(private swUpdate: SwUpdate) {
        if (this.swUpdate.isEnabled) {
            this.swUpdate.versionUpdates.subscribe(() => {
                console.log('New Version Avaliable');
                location.reload();
            })
        }
    }
}