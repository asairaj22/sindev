import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import {RecaptchaLoaderService } from 'ng-recaptcha';
import { Interceptor } from "src/app/interceptor/interceptor";
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { SharedDirectivesModule } from 'src/app/main/modules/shared-module.module';

import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';

const loginRoutes: Routes = [
  {
    path: '',
    component: SignInComponent,
  },
  { path: "login",
   component: SignInComponent 
   },
  { path: "login/:tokenStatus",
   component: SignInComponent 
   },
  { path: "sign-up", component: SignUpComponent },
  { path: "activate-account/:token", component: ActivateAccountComponent },
  { path: "signup-success", component: ActivateAccountComponent },
  { path: "forgot-password", component: ForgotPasswordComponent },
  { path: "change-password", component: ChangePasswordComponent },
  { path: "set-password/:loginDetails", component: SetPasswordComponent },
  { path: "set-password", component: SetPasswordComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    SharedDirectivesModule,
    RouterModule.forChild(loginRoutes)
  ],
  declarations: [SignInComponent,SignUpComponent,ActivateAccountComponent,SetPasswordComponent,ForgotPasswordComponent,ChangePasswordComponent],
  providers: [{
    provide: RECAPTCHA_SETTINGS,
    useValue: {
      siteKey: '6LeVcLsaAAAAAFOU9707e3UUpKvW3p3KOHnwiIZ6',
    } as RecaptchaSettings,
  },
  RecaptchaLoaderService,
    { provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true },
    ]
})
export class LoginModule { }