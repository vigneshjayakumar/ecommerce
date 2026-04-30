import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { BranchWiseService, TCreateBranch } from '../branch-wise.service';
import { BmSelectComponent } from 'src/app/ui/shared/components/bm-select/bm-select.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-branch',
  imports: [ReactiveFormsModule, BmSelectComponent],
  templateUrl: './create-branch.component.html',
  styleUrl: './create-branch.component.css'
})
export class CreateBranchComponent implements OnDestroy {
  private branchWiseService = inject(BranchWiseService);
  private router = inject(Router);
  private postSub!: Subscription;

  branchTypeList: ['HQ', 'WAREHOUSE', 'DISTRIBUTION', 'STORE'] = ['HQ', 'WAREHOUSE', 'DISTRIBUTION', 'STORE'];
  copiedBranchType = this.branchTypeList.map(ele => ({ label: ele, value: ele }));
  selectBranchType: string = this.branchTypeList[0];

  createBranchForm: FormGroup = new FormGroup({
    name: new FormControl(null, { validators: [Validators.required] }),
    branchCode: new FormControl(null, { validators: [Validators.required] }),
    branchType: new FormControl(this.selectBranchType, { validators: [Validators.required] }),
    address: new FormControl(null, { validators: [Validators.required] }),
    city: new FormControl(null, { validators: [Validators.required] }),
    state: new FormControl(null, { validators: [Validators.required] }),
    pincode: new FormControl(null, { validators: [Validators.required] }),
    phoneNumber: new FormControl(null, { validators: [Validators.minLength(10), Validators.maxLength(10)] }),
    email: new FormControl(null, { validators: [Validators.email] }),
    isActive: new FormControl(true),
    gstNumber: new FormControl(null),
    isDefault: new FormControl(false),
  })

  onSubmit() {
    const formData = this.createBranchForm;
    const payload: TCreateBranch = {
      'branchName': formData.controls['name'].value,
      'branchCode': formData.controls['branchCode'].value,
      'branchType': formData.controls['branchType'].value.trim(),
      city: formData.controls['city'].value,
      state: formData.controls['state'].value,
      address: formData.controls['address'].value,
      pincode: formData.controls['pincode'].value,
      phoneNumber: (formData.controls['phoneNumber'].value)?.toString(),
      email: formData.controls['email'].value,
      isActive: formData.controls['isActive'].value,
      isDefault: formData.controls['isDefault'].value,
      gstNumber: formData.controls['gstNumber'].value
    }
    this.postSub = this.branchWiseService.postCreateBranch(payload).subscribe((res => {
      if (res.message === 'SUCCESS') {
        this.router.navigate(['/branch/list'])
      }
    }))
  }

  onClear() {
    this.createBranchForm.reset()
  }

  onBranchTypeChange(event: string) {
    this.selectBranchType = event;
    this.createBranchForm.controls['branchType'].setValue(event)
  }

  ngOnDestroy(): void {
    if (this.postSub) this.postSub.unsubscribe();
  }

}
