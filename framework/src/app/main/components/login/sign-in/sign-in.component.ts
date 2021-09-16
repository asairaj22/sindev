import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { EncrDecrService } from 'src/app/shared/encr-decr-service.service';
import { IsLoadingService } from "@service-work/is-loading";
import { first } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../../../platform/util/api.service';
import { PreviousRouteService } from '../../../../shared/service/previous-router.service';
import { AppService } from "src/app/app.service";
import { ActivateAccountService } from '../activate-account/activate-account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.css"],
})
export class SignInComponent implements OnInit {
  password;
  show = false;
  unregisteredMail: boolean = false;
  activateURL: any;
  loginForm: FormGroup;
  formSubmitted = false;
  failedLogin: boolean = false;
  invalidlogin = 0;
  maxLimit = 5;
  time;
  loginFormData = {};
  portalUrl;
  pathInfo;
  accountName;
  appName;
  loading: boolean = false;
  returnUrl: string;
  expiredTokenEmailID:string;
  loginErrorMsg: string;

  token: string = "";
  tokenRes: any;
  status: string = "";
  statusTitle: string = "";
  statusMessage: string = "";
  userName: string = "";
  paramEmailId: string = "";
  encptParamEmailId:string ="";

  constructor(
    private formBuilder: FormBuilder,
    private routes: Router,
    private isLoadingService: IsLoadingService,
    private httpClient: HttpClient, private EncrDecr: EncrDecrService,
    private router: Router, private apiService: ApiService, private previousRouteService: PreviousRouteService,
    private appService: AppService,
    private activateAccountService: ActivateAccountService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }
  get f() {
    return this.loginForm.controls;
  }
  ngOnInit(): void {
    // if(this.previousRouteService.getPreviousUrl() != sessionStorage.getItem("routeURL") && sessionStorage.getItem('productDetail') == "true"){
    //   sessionStorage.setItem('productDetail', "false");
    // }


    //**********query parma implementation */
    if (this.route.snapshot.queryParams['token']) {
      this.route.queryParams.subscribe(param => {
        if (param['token']) {
          this.token = param['token'];
          this.onFetchTokenInfo();
        }
      });
    }

    //**********path parma implementation */
    if (this.route.snapshot.params['tokenStatus']) {
      this.route.params.subscribe((param: any) => {
        if (param.tokenStatus == 'expiredToken' && sessionStorage.getItem('activeTokenExpiredDetails')) {
          let res = JSON.parse(sessionStorage.getItem('activeTokenExpiredDetails'));
          this.token = res['token'];
          let decryptObj = this.apiService.crypto.decrypt(res['email']);
          this.encptParamEmailId= res['email'];
          this.paramEmailId = decryptObj;
          this.onFetchTokenInfo();
        }
        else if(param.tokenStatus == 'inValidToken') {
          this.status = 'Invalid Token';
        }
      });
    }

    this.previousRouteService.previousUrl$.subscribe((previousUrl: string) => {
      if (previousUrl != sessionStorage.getItem("routeURL") && sessionStorage.getItem('productDetail') == "true") {
        sessionStorage.setItem('productDetail', "false");
      }
    });
    this.password = 'password';
    this.loginForm = this.formBuilder.group({
      username: ["", [Validators.required, Validators.email, Validators.pattern(this.appService.emailIdValidatePattern)]],
      rememberMe: [false],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }
  // [A-Za-z\d$@$!%*?&]
  // convenience getter for easy access to form fields


  onClick() {
    if (this.password === 'password') {
      this.password = 'text';
      this.show = true;
    } else {
      this.password = 'password';
      this.show = false;
    }
  }

  onLoginUser() {

    this.formSubmitted = true;
    this.unregisteredMail = false;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loginFormData["uname"] = this.loginForm.get("username").value;
    var encryptedPwd = this.EncrDecr.setPassword(
      this.loginForm.get("password").value
    );

    // this.pathInfo = location.pathname;
    // var splitted = this.pathInfo.split("/", 4);
    // this.accountName = splitted[1];
    // if (splitted[3] == 'pages') {
    //   this.appName = splitted[2];
    // }

    let url = window.location.href;
    let urlArry = url.split('pages');
    this.activateURL = urlArry[0] + 'pages/auth/login';
    let body = new HttpParams();
    body = body.set('uname', this.loginForm.get("username").value)
      .set('password', encodeURIComponent(encryptedPwd))
      .set('activateUrl', this.activateURL)
      .set('remember', 'on')
      .set('auth', 'EXTERNAL')
      .set('keepMeSignedIn', this.loginForm.get("rememberMe").value ? 'on' : 'off')
      .set('account', this.apiService.accountName)
      .set('app', this.apiService.appName);

    this.portalUrl = location.origin;
    this.httpClient.post<any>(this.portalUrl + '/api/login', body, {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8')
    }).subscribe(
      (res: any) => {


        let loginResultData = res.body || res;
        if (res.errorMsg) {
          this.failedLogin = true;
          let errMsg = (res.errorMsg) ? JSON.parse(res.errorMsg) : {};
          this.loginErrorMsg = (errMsg.errorMessage) ? errMsg.errorMessage : 'unexpected error';
          if (this.loginErrorMsg == 'NEW_PASSWORD_REQUIRED') {
            let encryptObj = this.apiService.crypto.encrypt(JSON.stringify({ id: this.loginForm.get("username").value, password: this.loginForm.get("password").value }));
            this.router.navigate(['/auth/set-password', encryptObj]);
          }
          else if (this.loginErrorMsg == 'Your account is not activated! Please click here to send activation link') {
            this.unregisteredMail = true;
          }
        }
        else {
          this.failedLogin = false;
          if (typeof loginResultData == "string") {
            loginResultData = JSON.parse(loginResultData);
          }
          if (loginResultData.status == "redirect") {
            this.appService.setUserLoginStatus(true);
            location.href = this.portalUrl + loginResultData.redirectURL;
            //this.router.navigateByUrl(loginResultData.redirectURL);
          }
        }
      },
      (err: any) => { console.error(err) }
    );
    //  alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.loginForm.value))
  }

  resetTimer() {
    clearTimeout(this.time);
    this.time = setTimeout(() => {
      this.invalidlogin = 0;
    }, 6300);
  }

  onReset() {
    this.formSubmitted = false;
    this.loginForm.reset();
  }

  onFetchTokenInfo() {
    this.activateAccountService.fetchTokenInfo(this.token).subscribe((res) => {
      if (res.body !== null) {
        this.tokenRes = res.body;
        this.status = res.body.status;
        this.userName = res.body.firstName;
      

        switch (this.status) {
          case 'Active':
            this.statusTitle = "Account Activation Success!";
            this.statusMessage = `${this.userName}, Welcome to Singtel Matrix Digital Service Platform.`;
            break;
          case 'Expired Token':
           
            this.statusTitle = "Sorry, your token expired!";
            this.statusMessage = `We'll need to re-send your activation link.`;
            this.expiredTokenEmailID = res.email;
            break;
          case 'Invalid Token':
            this.statusTitle = "Sorry, your token is invalid!";
            this.statusMessage = `We can't proceed with this token.`;
            break;
          default:
            this.statusTitle = '';
            this.statusMessage = 'Something went wrong';
        }
      }
      else {
        this.status = '';
        this.statusTitle = '';
        this.statusMessage = 'Something went wrong';
      }


    }, (err) => {

      this.status = '';
      this.statusTitle = '';
      this.statusMessage = 'Something went wrong';
    });
  }

  onTryAgainExpiredToken() {
    let url = window.location.href;
    let urlArry = url.split('pages');
    let reDirectURL = urlArry[0] + 'pages/auth/set-password?email='+this.encptParamEmailId;
    sessionStorage.removeItem('activeTokenExpiredDetails');
    if (this.paramEmailId != '') {
      this.activateAccountService.tryAgainExpiredToken(
        { "email": this.paramEmailId, activateUrl: reDirectURL }
      ).subscribe((res) => {

        this.status = 'Token Resent';
        this.statusTitle = '';
        this.statusMessage = `your Singtel Account activation link send to your email address. Please, verify it.`;

      },
        (err) => {

          this.status = '';
          this.statusTitle = '';
          this.statusMessage = `your Singtel Account activation failed.`;
          this.toastr.error('Failed');
        });
    }else if(this.expiredTokenEmailID){
      let encryptExpiredEmailID = this.apiService.crypto.encrypt(this.expiredTokenEmailID);
      let reDirectExpURL = urlArry[0] + 'pages/auth/login';
      this.activateAccountService.tryAgainExpiredToken(
        { "email": encryptExpiredEmailID , activateUrl: reDirectExpURL}
      ).subscribe((res) => {

        this.status = 'Token Resent';
        this.statusTitle = '';
        this.statusMessage = `your Singtel Account activation link send to your email address. Please, verify it.`;

      },
        (err) => {

          this.status = '';
          this.statusTitle = '';
          this.statusMessage = `your Singtel Account activation failed.`;
          this.toastr.error('Failed');
        });
    }
    else {
      this.status = '';
      this.statusTitle = '';
      this.statusMessage = `Something went wrong`;
      this.toastr.error('Email ID not found');
    }

  }
  onActivationClick() {
    let inputObj = {
      email: this.loginForm.get("username").value ? this.loginForm.get("username").value : "",
      activateUrl: this.activateURL
    };
    this.appService.triggerActivationEmail(inputObj).subscribe((res) => {
      if (res.body && res.body.message) {
        this.toastr.error(res.body.message);
      }
      else {
        this.toastr.success('Please check your Email');
      }

    });
  }
}
