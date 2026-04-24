import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { tap } from 'rxjs/internal/operators/tap';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { v4 as uuidV4 } from 'uuid';
import { catchError, throwError } from 'rxjs';

import { AdminProductService } from 'src/app/admin/admin-product.service';
import { TProduct } from 'src/app/admin/all-products-list/all-products.modal';
import { PurchasesService, TDefaultBranchRes, TPostPurchasesPayload } from './purchases.service';
import { AuthService } from 'src/app/auth/auth.service';
import { BmSelectComponent } from 'src/app/ui/shared/components/bm-select/bm-select.component';

@Component({
  selector: 'app-purchases',
  imports: [ReactiveFormsModule, BmSelectComponent],
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.css'
})
export class PurchasesComponent implements OnInit, OnDestroy {
  private purchasesService = inject(PurchasesService);
  private authService = inject(AuthService);
  private adminProductService = inject(AdminProductService);

  private idompotencyId: string | null = null;
  private subs!: Subscription;

  isSubmitted = false;
  allProductsList: TProduct[] = [];
  purchasesForm = new FormGroup({
    branchId: new FormControl('', { validators: [Validators.required] }),
    supplierId: new FormControl(''),
    remarks: new FormControl(''),
    items: new FormArray([])
  })

  defaultBranchObj: { branch_code: string, branch_name: string, branch_type: string, is_default_branch: boolean } = { 'branch_code': '', 'branch_name': '', 'branch_type': '', is_default_branch: false };

  branchList: TDefaultBranchRes['response'] = [];
  branchListCopy: { label: string, value: string }[] = [];
  selectedBranchName = this.defaultBranchObj.branch_name;

  ngOnInit(): void {
    this.subs = this.authService.accessTokenObs.pipe(switchMap((s) => {
      if (!s) return EMPTY
      return this.purchasesService.getDefaultBranch()
    }
    )).pipe(
      catchError(() => throwError(() => new Error('FAILED TO FETCH DEFAULT BRANCH'))),
      tap(list => {
        this.branchList = list;
        this.branchListCopy = this.branchList.map(ele => ({ value: ele.id.toString(), label: ele.branch_name }));
        const found = list.find(ele => ele.is_default_branch);
        if (found) {
          this.defaultBranchObj = found
        }
      }),
      switchMap(() => this.adminProductService.getAllProductsList('10', '0'))
    ).pipe(tap(res => this.allProductsList = res))
      .subscribe();
  }

  get purchasesItemArr() {
    return this.purchasesForm.get('items') as FormArray;
  }

  addItem() {
    this.purchasesItemArr.push(this.createItemsFormArray())
  }

  private createItemsFormArray(): FormGroup {
    return new FormGroup({
      'productId': new FormControl(0, { validators: [Validators.required, Validators.min(1)] }),
      'qty': new FormControl(0, { validators: [Validators.required, Validators.min(1)] }),
      unitCost: new FormControl(0, { validators: [Validators.required, Validators.min(1)] })
    })
  }

  onBranchChange(event: string) {
    this.selectedBranchName = event;
    this.purchasesForm.controls['branchId'].setValue(this.selectedBranchName)
  }

  onSubmitPurchases() {
    console.log('form Valid', this.purchasesForm.valid, this.purchasesForm.value, this.purchasesItemArr.length)
    if (!this.purchasesForm.valid || !this.purchasesItemArr.length) return;
    if (this.idompotencyId === null) this.idompotencyId = uuidV4();
    this.isSubmitted = true;
    const formData = this.purchasesForm.controls;
    const data: TPostPurchasesPayload = {
      'branchId': +formData.branchId.value!,
      'idempotencyKey': this.idompotencyId,
      'items': this.purchasesItemArr.value ?? [],
      'remarks': formData.remarks.value ?? '',
      'supplierId': ''
    }

    this.purchasesService.postPurchaseData(data).pipe(tap(res => {
      if (res.message === 'SUCCESS') this.idompotencyId = null;
      this.isSubmitted = false;
    }), catchError(err => {
      this.isSubmitted = false;
      return throwError(() => err)
    })).subscribe(res => console.log('POST PURCHASES', res));
  }

  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
  }
}