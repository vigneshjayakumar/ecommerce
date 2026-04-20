import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { tap } from 'rxjs/internal/operators/tap';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css',
})
export class AdminLoginComponent implements OnInit {
  userLoginForm!: FormGroup;
  isSignupScreen = true;
  isNewUser = false;

  //otp properties.
  isOTPLogin = false;
  phoneNumber: string = '';
  otpCode = '';
  isOTPSent = false;

  private authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.checkIfLoginOrSignUp();
    this.initForm();
  }

  onSubmitLogin() {
    const email = this.userLoginForm.controls['email'].value;
    const password = this.userLoginForm.controls['password'].value;
    const confirmPassword =
      this.userLoginForm.controls?.['confirmPassword'].value ?? '';
    if (this.isSignupScreen && !this.isNewUser) {
      this.authService
        .postSignUp(email, password, confirmPassword)
        .pipe(
          tap((res) => {
            if (res.response.newUser) {
              this.isNewUser = res.response.newUser;
            } else {
              this.onClearLogin();
              this.isSignupScreen = false;
              this.router.navigate(['/login'], {
                queryParams: { authPage: 'login' },
              });
            }
          })
        )
        .subscribe();
    } else if (!this.isNewUser) {
      this.authService.postLogin(email, password).subscribe();
    } else {
      const userName = this.userLoginForm.controls['userName'].value;
      const phoneNumber = this.userLoginForm.controls['phoneNumber'].value;
      const payload = {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        phoneNumber: phoneNumber,
        userName: userName,
      };
      this.authService
        .postRegisterUser(payload)
        .pipe(
          tap((res) => {
            this.onClearLogin();
            this.isSignupScreen = false;
            this.isNewUser = false;
            this.router.navigate(['/login'], {
              queryParams: { authPage: 'login' },
            });
          })
        )
        .subscribe();
    }
  }

  onClearLogin() {
    this.userLoginForm.reset();
  }

  private checkIfLoginOrSignUp() {
    this.activatedRoute.queryParams
      .pipe(
        tap((query: any) => {
          if (query.authPage && query.authPage === 'login') {
            this.isSignupScreen = false;
          } else {
            this.isSignupScreen = true;
          }
        })
      )
      .subscribe();
  }
  private initForm() {
    this.userLoginForm = new FormGroup({
      email: new FormControl('', {
        validators: [Validators.email, Validators.required],
      }),
      password: new FormControl('', { validators: [Validators.required] }),
      userName: new FormControl('', { validators: [Validators.required] }),
      phoneNumber: new FormControl(null, { validators: [Validators.required] }),
      confirmPassword: new FormControl('', {
        validators: [Validators.required],
      }),
    });
  }

  checkRefresh() {
    this.isOTPLogin = false;
    const query = {
      authPage: this.isSignupScreen ? 'login' : 'signup',
    };
    this.router.navigate(['/login'], { queryParams: query });
  }

  onLoginWithOTP() {
    this.isOTPLogin = !this.isOTPLogin;
  }
  onSendOTP() {
    const phoneNumber = "+91" + this.phoneNumber.toString().trim();
    this.authService.postOTP(phoneNumber).pipe(tap(res => {
      if (res.message === 'SUCCESS') this.isOTPSent = true;
      console.log(res)
    })).subscribe();
  }

  onVerifyOTP() {
    const phoneNumber = "+91" + this.phoneNumber.toString().trim();
    this.authService.verifyOTP(phoneNumber, this.otpCode).pipe(tap(res => console.log('OTP SUCCESS', res))).subscribe();
  }
}
