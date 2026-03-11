import { Routes } from "@angular/router";

import { PurchasesComponent } from "./purchases/purchases.component";
import { TransferProductsComponent } from "./transfer-products/transfer-products.component";
import { StocksComponent } from "./stocks.component";


export const stockRoutes: Routes = [
    {
        path: '', component: StocksComponent, children: [
            {
                path: 'purchases', component: PurchasesComponent
            },
            {
                path: 'transfer', component: TransferProductsComponent
            }
        ]
    },

]