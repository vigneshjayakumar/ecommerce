import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BranchWiseService, TCreateBranch } from '../branch-wise.service';

@Component({
  selector: 'app-create-branch',
  imports: [ReactiveFormsModule],
  templateUrl: './create-branch.component.html',
  styleUrl: './create-branch.component.css'
})
export class CreateBranchComponent {
  private branchWiseService = inject(BranchWiseService);

  branchTypeList: ['HQ', 'WAREHOUSE', 'DISTRUBUTION', 'STORE'] = ['HQ', 'WAREHOUSE', 'DISTRUBUTION', 'STORE']

  createBranchForm: FormGroup = new FormGroup({
    name: new FormControl(null, { validators: [Validators.required] }),
    branchCode: new FormControl(null, { validators: [Validators.required] }),
    branchType: new FormControl(null, { validators: [Validators.required] }),
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
    console.log(this.createBranchForm.value);
    const formData = this.createBranchForm;
    const payload: TCreateBranch = {
      'branchName': formData.controls['name'].value,
      'branchCode': formData.controls['branchCode'].value,
      'branchType': formData.controls['branchType'].value,
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
    this.branchWiseService.postCreateBranch(payload).subscribe()
  }

  onClear() {
    this.createBranchForm.reset()
  }

}
