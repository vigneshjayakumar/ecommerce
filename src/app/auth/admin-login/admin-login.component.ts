import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { tap } from 'rxjs/internal/operators/tap';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css',
})
export class AdminLoginComponent implements OnInit {
  userLoginForm!: FormGroup;
  isSignupScreen = true;

  private authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.checkIfLoginOrSignUp();
    this.initForm();
  }

  onSubmitLogin() {
    console.log(this.userLoginForm.value);
    const email = this.userLoginForm.controls['email'].value;
    const password = this.userLoginForm.controls['password'].value;
    const confirmPassword =
      this.userLoginForm.controls?.['confirmPassword'].value ?? '';
    if (this.isSignupScreen) {
      this.authService
        .postSignUp(email, password, confirmPassword)
        .pipe(
          tap((res) => {
            console.log('SUCCESSFULLY SIGN IN', res);
            this.onClearLogin();
            this.isSignupScreen = false;
          })
        )
        .subscribe();
    } else {
      this.authService
        .postLogin(email, password)
        .pipe(tap((res) => console.log('User Login', res)))
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
          console.log(query);
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
      confirmPassword: new FormControl('', {
        validators: [Validators.required],
      }),
    });
  }

  checkRefresh() {
    const query = {
      authPage: this.isSignupScreen ? 'login' : 'signup',
    };
    this.router.navigate(['/login'], { queryParams: query });
  }
}
