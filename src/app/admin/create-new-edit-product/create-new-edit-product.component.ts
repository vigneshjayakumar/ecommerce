import { Component, inject, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription, switchMap, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import {
  AdminProductService,
  TPostNewProductPayload,
} from '../admin-product.service';
import { TProduct } from '../all-products-list/all-products.modal';
import { TUOM, UtilsService } from 'src/app/common/services/utils.service';
import { BmSelectComponent } from 'src/app/ui/shared/components/bm-select/bm-select.component';

@Component({
  selector: 'app-create-new-edit-product',
  imports: [ReactiveFormsModule, FormsModule, BmSelectComponent],
  templateUrl: './create-new-edit-product.component.html',
  styleUrl: './create-new-edit-product.component.css',
})
export class CreateNewEditProductComponent implements OnDestroy {
  newProductForm!: FormGroup;
  postProductSubs!: Subscription;
  buttonLable = 'Create';
  isActiveProduct = true;
  isViewMode = false;
  uoms: TUOM = [];

  private adminProductService = inject(AdminProductService);
  private activatedRoute = inject(ActivatedRoute);
  private utilsService = inject(UtilsService);
  private router = inject(Router);

  dataToBeEdited: TProduct | null = null;
  editId: number | null = null;
  paramsIdSubs = this.activatedRoute.paramMap
    .pipe(
      tap((params) => {
        const id = params.get('id');
        if (id) {
          this.isViewMode = params.get('isViewMode') === 'true' ? true : false;
          this.editId = +id;
          this.buttonLable = 'Save';
          this.adminProductService
            .getProductDetailById(this.editId)
            .pipe(
              tap((res) => {
                this.dataToBeEdited = res.response.product;
                this.isActiveProduct = !!this.dataToBeEdited.is_active;
                this.populateForms();
              }),
            )
            .subscribe();
          this.initForm();
        } else {
          this.initForm();
        }
      }), switchMap(() => this.getUOMConstants())
    )
    .subscribe();

  private populateForms() {
    this.newProductForm.setValue({
      productName: this.dataToBeEdited?.product_name,
      description: this.dataToBeEdited?.description,
      price: this.dataToBeEdited?.price,
      stockCount: this.dataToBeEdited?.stock_count,
      uom: this.dataToBeEdited?.uom,
      taxPercentage: this.dataToBeEdited?.tax_percent,
      skuCode: this.dataToBeEdited?.sku,
      hsnCode: this.dataToBeEdited?.hsn_code,
      isActive: this.dataToBeEdited?.is_active,
    });
    this.newProductForm.controls['skuCode'].disable();
  }

  selectedUom = '';
  onUomChange(event: string) {
    this.selectedUom = event;
    this.newProductForm.controls['uom'].setValue(event);
  }

  initForm() {
    this.newProductForm = new FormGroup({
      productName: new FormControl('', { validators: [Validators.required] }),
      price: new FormControl(null, { validators: [Validators.required] }),
      description: new FormControl('', { validators: [Validators.required] }),
      stockCount: new FormControl(null, { validators: [Validators.required] }),
      uom: new FormControl(),
      taxPercentage: new FormControl(null, {
        validators: [Validators.required],
      }),
      skuCode: new FormControl('', { validators: [Validators.required] }),
      hsnCode: new FormControl(''),
      isActive: new FormControl(false, { validators: [Validators.required] }),
    });
  }

  onSubmit() {
    const payload: TPostNewProductPayload = {
      productName: this.newProductForm.controls['productName'].value,
      description: this.newProductForm.controls['description'].value,
      price: this.newProductForm.controls['price'].value,
      stockCount: this.newProductForm.controls['stockCount'].value,
      taxPercent: this.newProductForm.controls['taxPercentage'].value,
      sku: this.newProductForm.controls['skuCode'].value,
      uom: this.newProductForm.controls['uom'].value,
      hsnCode: this.newProductForm.controls['hsnCode'].value,
      isActive: this.newProductForm.controls['isActive'].value ? 1 : 0,
    };
    if (this.editId) {
      return this.postEditProduct(payload);
    }
    this.postNewProduct(payload);
  }

  private postNewProduct(payload: TPostNewProductPayload) {
    this.postProductSubs = this.adminProductService
      .postNewproduct(payload)
      .pipe(
        tap((res) => {
          if (res.message !== 'ERROR') {
            this.onRouteToProductList();
          }
        }),
      )
      .subscribe();
  }

  private postEditProduct(payload: TPostNewProductPayload) {
    if (typeof this.editId === 'number') {
      const data = { ...payload, productId: this.editId };
      this.postProductSubs = this.adminProductService
        .postEditProduct(data)
        .subscribe((res: { message: string }) => {
          if (res.message !== 'ERROR') {
            this.onRouteToProductList();
          }
        });
    }
  }

  private onRouteToProductList() {
    this.router.navigate(['/admin/products-list']);
  }

  private getUOMConstants() {
    return this.utilsService.getUOMConstants().pipe(tap(res => { this.uoms = res; this.selectedUom = this.uoms[0].value }))
  }

  ngOnDestroy(): void {
    if (this.postProductSubs) this.postProductSubs.unsubscribe();
    if (this.paramsIdSubs) this.paramsIdSubs.unsubscribe();
  }
}
