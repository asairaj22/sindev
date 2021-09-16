import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { RecaptchaLoaderService, RecaptchaComponent } from 'ng-recaptcha';
import { ApiService } from "src/app/platform/util/api.service";
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm: FormGroup;
  submitted = false;
  unregisteredMail: boolean = false;
  failedLogin: boolean = false;
  showErrorMessage: boolean;
  errorMsg: any;
  reDirectUrl: string;

  constructor(private formBuilder: FormBuilder, private routes: Router, private customerService: AppService, private toastr: ToastrService, private apiService: ApiService) { }

  ngOnInit(): void {

    this.forgotPasswordForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      recaptcha: ['', Validators.required]
    });
  }

  get f() {
    if (this.forgotPasswordForm.controls.recaptcha && this.forgotPasswordForm.controls.recaptcha.errors && this.forgotPasswordForm.controls.recaptcha.errors.required) {
      this.showErrorMessage = true;
    } else {
      this.showErrorMessage = false;
    }
    return this.forgotPasswordForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    let url = window.location.href;
    let urlArry = url.split('pages');
    let email = (this.forgotPasswordForm.controls.email.value) ? this.forgotPasswordForm.controls.email.value : '';
    let encryptedEmail = this.apiService.crypto.encrypt(email);
    this.reDirectUrl = urlArry[0] + 'pages/auth/change-password?email=' + encryptedEmail;
    let inputObj = {
      "username": (this.forgotPasswordForm.controls.email.value) ? this.forgotPasswordForm.controls.email.value : '',
      "activateUrl": (this.reDirectUrl) ? this.reDirectUrl : ''
    };
    this.unregisteredMail = false;
    this.failedLogin = false;
    this.customerService.submitForgetPassword(inputObj).subscribe(res => {
      let passwordResetDet = res.body;
      if (res.body.message) {
        this.failedLogin = true;
        if (res.body.message == "Your account is not activated! Please click here to send activation link") {
          this.unregisteredMail = true;
        }
        else {
          this.errorMsg = res.body.message;
        }
      }
      else {
        this.toastr.success("Please check your Email");
      }

    });
    //this.routes.navigate(["/change-password"]);



    // display form values on success
    // alert(
    //   "SUCCESS!! :-)\n\n" + JSON.stringify(this.forgotPasswordForm.value, null, 4)
    // );
  }
  onActivationClick() {
    let url = window.location.href;
    let urlArry = url.split('pages');
    let activateURL = urlArry[0] + 'pages/auth/login';
    let inputObj = {
      email: (this.forgotPasswordForm.controls.email.value) ? this.forgotPasswordForm.controls.email.value : '',
      activateUrl: activateURL
    };
    this.customerService.triggerActivationEmail(inputObj).subscribe((res) => {
      if (res.body && res.body.message) {
        this.failedLogin = true;
        this.toastr.error(res.body.message);
      }
      else {
        this.toastr.success('Please check your Email');
      }

    });
  }

}
