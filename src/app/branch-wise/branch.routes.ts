import { Routes } from "@angular/router";

import { CreateBranchComponent } from "./create-branch/create-branch.component";
import { AllocateProductBranchwiseComponent } from "./allocate-product-branchwise/allocate-product-branchwise.component";
import { BranchWiseComponent } from "./branch-wise.component";
import { BranchListComponent } from "./branch-list/branch-list.component";
import { ViewEditBranchComponent } from "./view-edit-branch/view-edit-branch.component";

export const branchwiseRoutes: Routes = [
    {
        path: '', component: BranchWiseComponent,
        children: [
            {
                'path': 'create-branch', component: CreateBranchComponent
            },
            { path: 'list', component: BranchListComponent },
            { path: 'view-edit-branch', component: ViewEditBranchComponent },
            {
                path: 'allocate-product', component: AllocateProductBranchwiseComponent
            },
            {
                path: '', redirectTo: 'list', pathMatch: 'full'
            }
        ]
    },
]