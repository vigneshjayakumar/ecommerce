import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AdminProductService,
  TPostNewProductPayload,
} from '../admin-product.service';
import { Subscription, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TProduct } from '../all-products-list/all-products.modal';

@Component({
  selector: 'app-create-new-edit-product',
  imports: [ReactiveFormsModule],
  templateUrl: './create-new-edit-product.component.html',
  styleUrl: './create-new-edit-product.component.css',
})
export class CreateNewEditProductComponent implements OnDestroy {
  newProductForm!: FormGroup;
  postProductSubs!: Subscription;
  buttonLable = 'Create';
  isActiveProduct = true;

  private adminProductService = inject(AdminProductService);
  private activatedRoute = inject(ActivatedRoute);

  dataToBeEdited: TProduct | null = null;
  editId: number | null = null;
  paramsIdSubs = this.activatedRoute.paramMap
    .pipe(
      tap((params) => {
        const id = params.get('id');
        if (id) {
          this.editId = +id;
          this.buttonLable = 'Edit';
          this.adminProductService
            .getProductDetailById(this.editId)
            .pipe(
              tap((res) => {
                console.log('PRODUCT', res.response.product);
                this.dataToBeEdited = res.response.product;
                this.isActiveProduct = !this.dataToBeEdited.is_active;
                this.populateForms();
              })
            )
            .subscribe();
          this.initForm();
        } else {
          this.initForm();
        }
      })
    )
    .subscribe();

  private populateForms() {
    this.newProductForm.setValue({
      productName: this.dataToBeEdited?.product_name,
      description: this.dataToBeEdited?.description,
      price: this.dataToBeEdited?.price,
      stockCount: this.dataToBeEdited?.stock_count,
      taxPercentage: this.dataToBeEdited?.tax_percent,
      skuCode: this.dataToBeEdited?.hsn_code,
      isActive: this.dataToBeEdited?.is_active,
    });
    this.newProductForm.controls['skuCode'].disable();
  }

  initForm() {
    this.newProductForm = new FormGroup({
      productName: new FormControl('', { validators: [Validators.required] }),
      price: new FormControl(null, { validators: [Validators.required] }),
      description: new FormControl('', { validators: [Validators.required] }),
      stockCount: new FormControl(null, { validators: [Validators.required] }),
      taxPercentage: new FormControl(null, {
        validators: [Validators.required],
      }),
      skuCode: new FormControl('', { validators: [Validators.required] }),
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
      hsnCode: this.newProductForm.controls['skuCode'].value,
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
      .pipe(tap((res) => console.log('POSTED RESPONSE', res)))
      .subscribe();
  }

  private postEditProduct(payload: TPostNewProductPayload) {
    if (typeof this.editId === 'number') {
      const data = { ...payload, productId: this.editId };
      this.postProductSubs = this.adminProductService
        .postEditProduct(data)
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    if (this.postProductSubs) this.postProductSubs.unsubscribe();
    if (this.paramsIdSubs) this.paramsIdSubs.unsubscribe();
  }
}
