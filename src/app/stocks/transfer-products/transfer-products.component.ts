import { catchError, Subscription, tap, throwError } from 'rxjs';
import { NgTemplateOutlet } from '@angular/common';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { v4 as uuidV4 } from 'uuid';

import { TProductByBranchIdRes, TransferService } from './transfer.service';
import { AuthService } from '../../auth/auth.service';
import { BmSelectComponent } from 'src/app/ui/shared/components/bm-select/bm-select.component';

@Component({
  selector: 'app-transfer-products',
  imports: [NgTemplateOutlet, ReactiveFormsModule, FormsModule, BmSelectComponent],
  templateUrl: './transfer-products.component.html',
  styleUrl: './transfer-products.component.css'
})
export class TransferProductsComponent implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private transferService = inject(TransferService);
  private idompotencyId: string | null = null;

  selectedBranchName = '';
  selectedDstBranchName = '';

  branchList: { value: string, label: string }[] = [];
  dstBranchList: { value: string, label: string }[] = [];
  productsByBranch: TProductByBranchIdRes['response'] = [];
  srcBranchForm = new FormControl('');
  dstBranchForm = new FormControl('');
  isTransferOngoing = false;

  payloadObj: TTransferPayload = {
    'fromBranchId': 0,
    'toBranchId': 0,
    'remarks': '', 'items': [],
    idomeID: ''
  }

  srcBranchChangeSubs = this.srcBranchForm.valueChanges.pipe(switchMap(branch => {
    if (branch) {
      this.dstBranchList = this.branchList.filter(ele => ele.value !== branch);
      this.payloadObj.fromBranchId = +branch;
      return this.transferService.getProductListByBranchId(+branch)
    }
    return EMPTY
  })).pipe(tap(products => this.productsByBranch = products)).subscribe();

  dstBranchChangeSubs = this.dstBranchForm.valueChanges.pipe(switchMap(branch => {
    if (branch) {
      this.payloadObj.toBranchId = +branch;
      return this.transferService.getProductListByBranchId(+branch)
    }
    return EMPTY
  })).pipe(tap(products => {
    if (products.length) {
      this.productsByBranch = this.productsByBranch.map((pro, i) => ({ ...pro, 'destProductQty': +products[i].current_qty }));
    }
  })).subscribe();

  subs!: Subscription
  ngOnInit(): void {
    this.subs = this.authService.accessTokenObs.pipe(switchMap((s) => {
      if (!s) return EMPTY
      return this.transferService.getBranchLists()
    }
    )).pipe(tap(list => this.branchList = list.map(ele => ({ value: ele.id, label: ele.branch_name })))).subscribe();
  }

  onDstBranchChange(event: string) {
    this.selectedDstBranchName = event;
    this.dstBranchForm.setValue(event);
  }

  onsrcBranchChange(event: string) {
    this.selectedBranchName = event;
    this.srcBranchForm.setValue(event);
  }

  onProductQtyChange(data: TProductByBranchIdRes['response'][0]) {
    this.productsByBranch = this.productsByBranch.map(ele => (ele.id === data.id ? { ...ele, current_qty: (+ele.current_qty - (ele.shiftCount ?? 0)).toString() } : ele));
    this.productsByBranch = this.productsByBranch.map(ele => (ele.id === data.id ? { ...ele, destProductQty: (+(ele.destProductQty ?? 0) + (ele.shiftCount ?? 0)) } : ele));
  }

  onSumbitTransfer() {
    this.isTransferOngoing = true;
    if (this.idompotencyId === null) this.idompotencyId = uuidV4();
    const toTransferProducts = this.productsByBranch.filter(ele => !!ele.shiftCount);
    this.payloadObj.items = toTransferProducts.map(ele => ({ 'productId': +ele.product_id, 'qty': ele.shiftCount ? ele.shiftCount : 0 }));
    this.payloadObj.idomeID = this.idompotencyId;
    this.transferService.postStockTransferBtnBranch(this.payloadObj).pipe(tap(res => console.log('RESPONSE', res)), catchError(err => {
      this.isTransferOngoing = false;
      return throwError(() => new Error(err))
    })).subscribe(() => {
      this.isTransferOngoing = false;
      this.idompotencyId = null
    })
  }
  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
    if (this.srcBranchChangeSubs) this.srcBranchChangeSubs.unsubscribe();
  }
}

// Payload for transfer products.
export type TTransferPayload = {
  "fromBranchId": number,
  "toBranchId": number,
  "remarks": string,
  "items": { "productId": number, "qty": number }[],
  'idomeID': string,
}