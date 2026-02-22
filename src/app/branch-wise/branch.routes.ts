import { Routes } from "@angular/router";

import { CreateBranchComponent } from "./create-branch/create-branch.component";
import { AllocateProductBranchwiseComponent } from "./allocate-product-branchwise/allocate-product-branchwise.component";
import { BranchWiseComponent } from "./branch-wise.component";

export const branchwiseRoutes: Routes = [
    {
        path: '', component: BranchWiseComponent,
        children: [
            {
                'path': 'create-branch', component: CreateBranchComponent
            },
            {
                path: 'allocate-product', component: AllocateProductBranchwiseComponent
            },
            {
                path: '', redirectTo: 'allocate-product', pathMatch: 'full'
            }
        ]
    },
]