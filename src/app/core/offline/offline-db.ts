import Dexie, { Table } from "dexie";


export interface ICachedProducts {
    id: number,
    product_name: string,
    updated_at: string
}

export class OfflineDB extends Dexie{
    products!:Table<ICachedProducts>;

    constructor(){
        super('billing-offline-db');

        this.version(1).stores({
            products:'id, product_name'
        })
    }
}

export const offlineDB = new OfflineDB();