import { Injectable, signal, Signal } from "@angular/core";

export type TToastTypes = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';

export interface IToasts {
    id: number,
    type: TToastTypes,
    message: string,
    duration: number

}
@Injectable({ providedIn: 'root' })
export class ToasterService {
    toastSig = signal<IToasts[]>([]);

    private id = 0;

    success(message: string) {
        this.show('SUCCESS', message);
    }

    error(error: string) {
        this.show('ERROR', error);
    }

    warning(message: string) {
        this.show('WARNING', message);
    }

    info(message: string) {
        this.show('WARNING', message);
    }


    private show(toastType: TToastTypes, message: string, duration = 3000) {
        const toast: IToasts = {
            id: ++this.id,
            type: toastType,
            message,
            duration
        }

        this.toastSig.update(prv => [...prv, toast]);

        setTimeout(() => this.removeToast(toast.id), duration);

    }

    removeToast(id: number) {
        this.toastSig.update(prv => prv.filter(t => t.id !== id));
    }

}