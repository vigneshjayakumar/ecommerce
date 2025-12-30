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

  private adminProductService = inject(AdminProductService);
  private activatedRoute = inject(ActivatedRoute);

  dataToBeEdited: TPostNewProductPayload | null = null;
  editId: number | null = null;
  paramsIdSubs = this.activatedRoute.paramMap
    .pipe(
      tap((params) => {
        const id = params.get('id');
        if (id) {
          this.editId = +id;
          this.dataToBeEdited = this.adminProductService.Product_details;
          this.buttonLable = 'Edit';
          this.initForm();
          this.populateForms();
        } else {
          this.initForm();
        }
      })
    )
    .subscribe();

  private populateForms() {
    this.newProductForm.setValue({
      productName: this.dataToBeEdited?.productName,
      description: this.dataToBeEdited?.description,
      price: this.dataToBeEdited?.price,
      stockCount: this.dataToBeEdited?.stockCount,
      taxPercentage: this.dataToBeEdited?.taxPercent,
      skuCode: this.dataToBeEdited?.hsnCode,
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
