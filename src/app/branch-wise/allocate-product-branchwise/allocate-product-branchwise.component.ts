import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BranchWiseService, TUnAllocatedProductRes } from '../branch-wise.service';
import { EMPTY, Subscription, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-allocate-product-branchwise',
  imports: [FormsModule],
  templateUrl: './allocate-product-branchwise.component.html',
  styleUrl: './allocate-product-branchwise.component.css'
})
export class AllocateProductBranchwiseComponent implements OnInit, OnDestroy {
  unallocatedProductList: TUnAllocatedProductRes['response']['productsList'] = [];
  branchesList: TUnAllocatedProductRes['response']['branches'] = [];

  mapProductBranchArr: { productId: number, productName: string, availCount: number, branches: { name: string, count: number, branchId: number }[] }[] = []

  private subsArr: Subscription[] = [];

  private branchWiseService = inject(BranchWiseService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const subs = this.authService.accessTokenObs.pipe(switchMap((s) => {
      if (!s) return EMPTY
      return this.branchWiseService.getUnallocatedProductsList()
    }
    )).pipe(tap(res => this.stitchResponse(res))).subscribe();

    this.subsArr.push(subs);
  }

  mapProductsList() {
    const tempBranches: { 'branchId': number, 'count': number, 'name': string }[] = [];
    this.unallocatedProductList.forEach(ele => {
      const temp = {
        productId: +ele.id,
        productName: ele.product_name,
        availCount: +ele.stock_count,
        branches: tempBranches
      }
      this.mapProductBranchArr.push({ ...temp })
    });
    this.branchesList.forEach(branch => {
      const branches = { 'branchId': +branch.id, 'count': 0, 'name': branch.branch_name };
      tempBranches.push(branches);
    })
    this.mapProductBranchArr = this.mapProductBranchArr.map(item => ({ ...item, branches: structuredClone(tempBranches) }))
  }

  onAllocate() {
    const presentStock = this.mapProductBranchArr.filter(ele => ele.branches.reduce((a, b) => ({ ...a, count: a.count + b.count }), { count: 0, name: '', branchId: '' }).count > 0);
    if (!presentStock.length) return
    this.branchWiseService.postAllocateStockLedgerSnapshot(presentStock as any).pipe(switchMap(res => {
      if (res.message === 'SUCCESS') {
        this.mapProductBranchArr = [];
        return this.branchWiseService.getUnallocatedProductsList().pipe(tap(res => this.stitchResponse(res)));
      }
      return EMPTY
    })).subscribe(res => console.log('ALLOCATING STOCK LEDGER', res));
  }

  onCountChange(productId: number) {
    const masterCount = this.unallocatedProductList.find(ele => +ele.id === productId)?.stock_count;
    const foundProduct = this.mapProductBranchArr.find(ele => ele.productId === productId);

    const countChanged = foundProduct?.branches.reduce((a, b) => ({ ...a, count: a.count + b.count }), { name: '', count: 0, branchID: 0 });

    if ((countChanged && masterCount) && +countChanged?.count > +masterCount) return;

    if (foundProduct && countChanged && masterCount)
      foundProduct.availCount = +masterCount - countChanged.count
  }

  private stitchResponse(res: TUnAllocatedProductRes['response']) {
    this.branchesList = res.branches;
    this.unallocatedProductList = res.productsList;
    this.mapProductsList();
  }

  ngOnDestroy(): void {
    this.subsArr.forEach(subs => {
      if (subs) subs.unsubscribe();
    })
  }
}
