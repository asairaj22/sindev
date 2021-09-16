import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
// import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input';
import { SignUpService } from './sign-up.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {ApiService} from "src/app/platform/util/api.service";
import { AppService } from "src/app/app.service";
import * as CountryCodes from "src/app/countryCode.json";
import { appProperties } from "../../../../app.message";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  // SearchCountryField = SearchCountryField;
  // TooltipLabel = TooltipLabel;
  // CountryISO = CountryISO;
  // preferredCountries: CountryISO[] = [CountryISO.Qatar];
  registerForm: FormGroup;
  formSubmitted = false;
  passwordType:string = 'password';
  countryCodes:any = CountryCodes;
  countryCodeLabel:string = "+65";
  searchText: string;
  phoneDropdown:boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private signUpService: SignUpService,
    private router: Router,
    public toastr: ToastrService,
    private appService: AppService,
    private apiService :ApiService
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      fullName: ["", [Validators.required, Validators.minLength(1), Validators.pattern("^[a-zA-Z0-9 ]*$")]],
      email: ["",
        [Validators.required,
        Validators.email,
       
        Validators.pattern(this.appService.emailIdValidatePattern)]
      ],
      phone: ["",Validators.minLength(8)],
      companyName: ["", 
      [Validators.required, 
      Validators.minLength(1)
      ]
      ],
      password: ["",
        [Validators.required,
        Validators.minLength(8),
        Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+]).{5,}$")
        ]
      ],
      mobileSearch:[""],
      acceptTerms: [false, Validators.requiredTrue],
      concentTerms: [false, Validators.requiredTrue]
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onUpdatePhoneNumber(event) {
  
    this.registerForm.patchValue({
      phone: event.value
    });
  }

  onRegisterUser() {
    this.formSubmitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
     
      return;
    }
let url = window.location.href;
    let urlArry = url.split('pages');
    let reDirectURL = urlArry[0] + 'pages/auth/login';
    // window.location.href = reDirectUrl;
    // display form values on success
    let password = (this.registerForm.value.password)? this.registerForm.value.password :"";
    let encryptPswd = this.apiService.crypto.encrypt(password);

    let userInfo:any = {
      fullName: this.registerForm.value.fullName.replace(/\s+/g, ' '),
      email: this.registerForm.value.email,
      phone: this.registerForm.value.phone,
      countryCode: this.countryCodeLabel,
      companyName: this.registerForm.value.companyName.replace(/\s+/g, ' '),
      password: (encryptPswd)? encryptPswd :"",
      acceptTerms:this.registerForm.value.acceptTerms,
      concentTerms: this.registerForm.value.concentTerms,
      activateUrl: reDirectURL
    };

    
    
    this.signUpService.createUser(userInfo)
      .subscribe((res) => {
       
        if (res.status === 200 && res.body.message === 'Email already exists') {
          this.toastr.error( 'Email already exists, Try with new Email Id', 'Account Creation Failed', {
            timeOut: 5000,
          });
          // this.toastr.error(appProperties.signUpAlready, 'Account Creation Failed', {timeOut: 5000});
        }
        if (res.status === 200 && res.body.message.includes('Please enter valid email ID')) {
          this.toastr.error( res.body.message, 'Account Creation Failed', {
            timeOut: 5000,
          });
          // this.toastr.error(appProperties.signUpAlready, 'Account Creation Failed', {timeOut: 5000});
        }
        if(res.status === 200 && res.body.message === 'Sign up') {
          this.toastr.success('Account Creation Success!', 'Success', {
            timeOut: 5000,
          });
          sessionStorage.setItem('firstLoginWizard', 'true');
          this.router.navigate(['/auth/signup-success']);
        }
        // else {
        //   this.toastr.error('Something went wrong', 'Account Creation Failed', {
        //     timeOut: 5000,
        //   });
        // }

      }, (err) => {
       
        this.toastr.error(err.error.errorMessage, 'Account Creation Failed', {
          timeOut: 5000,
        });
      });
  }

  getCountryList(){
    this.phoneDropdown = !this.phoneDropdown;
  }

  getparticularCountry(dialcode){
    this.countryCodeLabel = dialcode;
    this.getCountryList();
    this.searchText = "";
  }

  numberOnly(event):boolean{​​​​​​​​
    const charCode = event.which ? event.which : event.keyCode;
    if(charCode >31&&(charCode <48|| charCode >57)){​​​​​​​​
      return false;
    }​​​​​​​​
    return true;
  }

  gotoTerms() {
    let url = window.location.href;
    let urlArry = url.split('pages');
    let reDirectUrl = urlArry[0] + 'pages/terms' ;
    this.router.navigate([]).then(result => {window.open(reDirectUrl,'_blank'); })
    sessionStorage.setItem('gotoBack', '/auth/sign-up')
  }

}
