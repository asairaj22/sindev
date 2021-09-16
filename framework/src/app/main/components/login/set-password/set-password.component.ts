import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { PasswordStrengthValidator } from "./password-strength.validators";
import { AppService } from 'src/app/app.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from "src/app/platform/util/api.service";
import { ActivateAccountService } from '../activate-account/activate-account.service';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css']
})
export class SetPasswordComponent implements OnInit {
  public myForms: FormGroup;
  passwordModel = '';
  passwordStrength;
  updateSuccess: Boolean = false;
  emailId: string = '';
  tempPassword: string = '';
  code: string;
  passFieldTextType: boolean = false;
  confirmPassFieldTextType: boolean = false;
  emailFlow: boolean = false;
  fullParam:any;
  encpEmail:any = "";


  // token 
  token: string = "";
  tokenRes: any;
  status: string = "";


  constructor(fb: FormBuilder, private customerService: AppService,
    private toastr: ToastrService, private route: ActivatedRoute, private router: Router,
    private apiService: ApiService, private activateAccountService: ActivateAccountService) {
    this.myForms = fb.group({
      password: [null, Validators.compose([Validators.required])],
      confirmPassword: [null, Validators.compose([Validators.required])]
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // if(this.route.snapshot.params['token']) {
    this.route.queryParams.subscribe(param => {
      // this.fullParam = param;
      
      if (param['email'] && param['token']) {
        this.token = param['token'];
        this.encpEmail = param['email'];
        this.emailFlow = true;
        let decryptObj = this.apiService.crypto.decrypt(param['email']);
        // let loginDetails = JSON.parse(decryptObj);
        this.emailId = decryptObj;
        // this.tempPassword = this.apiService.crypto.decrypt(loginDetails.password);
        this.onFetchTokenInfo();
      }
      else {
        this.route.params.subscribe(params => {
          let encryptObj = this.apiService.crypto.decrypt(params.loginDetails);
          let loginDetails = JSON.parse(encryptObj);
          this.emailId = loginDetails.id;
          this.tempPassword = loginDetails.password;
          this.emailFlow = false;
        });
      }

    });
    // }

  }

  detectChange(value: string) {


    this.passwordStrength = this.measureStrength(`${value}`);

  }

  passwordMatchValidator(g: FormGroup) {
    return g.get("password").value === g.get("confirmPassword").value ? null : { mismatch: true };
  }

  measureStrength(pass: string) {
    let score = 0;
    // award every unique letter until 5 repetitions
    let letters = {};
    for (let i = 0; i < pass.length; i++) {
      letters[pass[i]] = (letters[pass[i]] || 0) + 1;
      score += 5.0 / letters[pass[i]];
    }
    // bonus points for mixing it up
    let variations = {
      digits: /\d/.test(pass),
      lower: /[a-z]/.test(pass),
      upper: /[A-Z]/.test(pass),
      nonWords: /\W/.test(pass),
    };

    let variationCount = 0;
    for (let check in variations) {
      variationCount += variations[check] ? 1 : 0;
    }
    score += (variationCount - 1) * 10;
    return Math.trunc(score);
  }

  onSavePassword() {
    this.updateSuccess = false;

    // let encryptedNewPwd = '';
    // encryptedNewPwd = this.EncrDecr.setPassword(this.myForms.controls.password.value);
    let password = (this.tempPassword) ? this.tempPassword : '';
    let encryptPswd = (password && password!='')? this.apiService.crypto.encrypt(password) : '';
    let newPassword = (this.myForms.controls.password.value) ? this.myForms.controls.password.value : '';
    let encryptNewPswd = (newPassword && newPassword!=='') ? this.apiService.crypto.encrypt(newPassword):'';
    let encryptEmail = (this.emailId && this.emailId!=='')? this.apiService.crypto.encrypt(this.emailId):'';
 if(this.emailFlow){
let inputObj = {
      "email": encryptEmail,
      "password": encryptNewPswd
    };

    this.customerService.setNewPassword(inputObj).subscribe(res => {
      if(res && res.body && res.body.errorMessage) {
        this.toastr.error(res.body.errorMessage);
      }
      else{
      let passwordResetDet = res.body;
      this.updateSuccess = true;
      this.toastr.success("Password is changed successfully");
      this.myForms.reset();
      let url = window.location.href;
      let urlArry = url.split('pages');
      let reDirectUrl = urlArry[0] + 'pages/auth/login';
      setTimeout(function () {
        window.location.href = reDirectUrl;
      }, 2000);
    }
    });
 }
  else{
    let inputObj = {
      "email": encryptEmail,
      "password": encryptPswd,
      "newPassword": encryptNewPswd
    };

    this.customerService.setLoginNewPassword(inputObj).subscribe(res => {
      let passwordResetDet = res.body;
      this.updateSuccess = true;
      this.toastr.success("Password is changed successfully");
      this.myForms.reset();
      let url = window.location.href;
      let urlArry = url.split('pages');
      let reDirectUrl = urlArry[0] + 'pages/auth/login';
      setTimeout(function () {
        window.location.href = reDirectUrl;
      }, 2000);
    });
  }  

  }

  togglePassFieldType() {
    this.passFieldTextType = !this.passFieldTextType;
  }
  toggleConfirmPassFieldType() {
    this.confirmPassFieldTextType = !this.confirmPassFieldTextType;
  }

  onFetchTokenInfo() {
    this.activateAccountService.fetchTokenInfo(this.token).subscribe((res) => {
      if (res.body !== null) {
        this.tokenRes = res.body;
        this.status = res.body.status;
      
        // *** possible tokens from api ***
        // Active, Invalid Token, Expired Token
        if(this.status != 'Active') {
          if (this.status == 'Expired Token') {
            sessionStorage.setItem('activeTokenExpiredDetails', JSON.stringify({email: this.encpEmail, token: this.token}));
            this.router.navigate(['/auth/login', 'expiredToken']);
          }
          else if(this.status == 'Invalid Token') {
            this.router.navigate(['/auth/login', 'inValidToken']);
          }
          else {
            this.router.navigate(['/auth/login', 'inValidToken']);
          }
        }
      }
      else {
        this.router.navigate(['/auth/login', 'inValidToken']);
      }


    }, (err) => {
      this.router.navigate(['/auth/login', 'inValidToken']);
    });
  }


}
