import { Component, OnInit, HostListener, ViewChild, ElementRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { PasswordStrengthValidator } from "../../../login/change-password/password-strength.validators";
import { SearchCountryField, TooltipLabel, CountryISO } from "ngx-intl-tel-input";
import { requireCheckboxesToBeCheckedValidator } from "./require-checkboxes-to-be-checked.validator";
import { AppService } from "src/app/app.service";
import * as CustomerData from '../create-user.json';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as CountryCodes from "src/app/countryCode.json";
import { ApiService } from "src/app/platform/util/api.service";

@Component({
  selector: "app-create-users",
  templateUrl: "./create-users.component.html",
  styleUrls: ["./create-users.component.css"],
})
export class CreateUsersComponent implements OnInit {
  @ViewChild('loginElement', { static: false }) captionField: ElementRef;
  countryCodes: any = CountryCodes;
  custModel: any = CustomerData;
  public myForms: FormGroup;
  searchText: any;
  passwordModel = "";
  passwordStrength;
  custId: string = "";
  submitted = false;
  departmentDetails: any = [];
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  departmentName: any;
  businessEmailalreadyExistBoolean: boolean = false;
  showToolTip: boolean = false;
  // Password Strength
  primaryRole: any;
  errorLength: boolean = false;
  regexBoolean: boolean = false;
  pwdLength: number = 0;
  statusPwd: string = "";
  // Password Strength
  preferredCountries: CountryISO[] = [CountryISO.Qatar];
  form = new FormGroup({
    // ...more form controls...
    myCheckboxGroup: new FormGroup({
        passwordRecoveryViaEmail: new FormControl(false),
        passwordRecoveryViaSms: new FormControl(false),
      },
      requireCheckboxesToBeCheckedValidator()
    ),
    // ...more form controls...
  });

  sentTestEmailList: any = {
    "type": "email",
    "sendTime": new Date(),
    "receiver": [{
      "email": "",
      "name": ""
    }],
    "characteristic": [
      {
        "name": "template_data",
        "value": {
        }
      }, {
        "name": "template_id",
        "value": 8
      }
    ]
  }

  passwordType: string = 'userDefined';

  constructor(private routes: Router, fb: FormBuilder, private appService: AppService, private toastr: ToastrService, private apiService: ApiService) {
    this.custId = sessionStorage.getItem("customerId");
    this.myForms = fb.group({
      loginId: ["", [Validators.required, Validators.pattern(this.appService.emailIdValidatePattern)]],
      businessEmailId: ["", [Validators.required, Validators.pattern(this.appService.emailIdValidatePattern)]],
      loginIdAsBusinessId: [false],
      name: ["", Validators.required],
      password: ["", Validators.required],
      mobileSearch: [""],
      phone: ["",Validators.minLength(8)],
      faxSearch: [""],
      fax: ["",Validators.minLength(8)],
      telePhoneSearch: [""],
      telephone: ["",Validators.minLength(8)],
      departmentName: [""],
      roleset: ["Primary Admin", Validators.required],
      passwordRecoveryViaEmail: [true],
      passwordRecoveryViaSms: [false],
      loginEmail: [""],
      limitAccess: ["wholeSite", Validators.required],
      applicationLaunching: ["sameBrowserWindow", Validators.required],
      otpNotification: ["emailOtp", Validators.required]
    });
  }

  password;
  show = false;
  getEmailList: any = [];
  getRoleDetails: any = [];
  isLoginIdAsBusinessId: boolean = false;

  ngOnInit(): void {
    this.getEmailAlreadyExistList();
    this.password = 'password';
    // this.getDepartmentDetails(this.custId);
    if (this.passwordType == 'userDefined') {
      this.myForms.controls['password'].setValue('Singtel!1234');
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getDepartmentDetails(this.custId);
      this.getMasterData();
    }, 2000);
  }

  loginEmail: string;
  name: string;

  getTestEmail(event) {
    this.loginEmail = event.target.value;
  }

  changeData(event) { }

  changPrimary(event) { }


  sendTestEmail(emailerror) {
    if (emailerror == null) {
      this.sentTestEmailList.receiver[0].email = this.myForms.value.loginId;
      // this.sentTestEmailList.receiver[0].name = this.name;
      // this.sentTestEmailList.characteristic[0].name = this.name;
      this.appService.getSendTestMail(this.sentTestEmailList).subscribe(data => {
        if (data) {

          if (data.body.status == 'SUCCESS') {
            this.toastr.success('Email sent successfully. Please check your Inbox');
          }
        }
      });
    }
    else {
      this.toastr.warning('Please enter Login Id!');
      window.scrollTo(0, 0);
      this.captionField.nativeElement.focus();
    }
  }

  phoneEmptyBoolean: boolean = false;
  faxEmptyBoolean: boolean = false;
  telephoneEmptyBoolean: boolean = false;
  getPhoneValid(event) {

    if (event.target.value == "") {

      this.phoneEmptyBoolean = true;
    }
    else {
      this.phoneEmptyBoolean = false;
    }
  }
  countryCodeLabel: string = "+65";
  countryCodeFaxLabel: string = "+65";
  countrycodeTelephoneLabel: string = "+65";
  phoneDropdown: boolean = false;
  faxDropdown: boolean = false;
  telePhoneDown: boolean = false;

  phoneDummy: boolean = false;
  faxDummy: boolean = false;
  telephoneDummy: boolean = false;
  getCountryList() {
    this.phoneDropdown = !this.phoneDropdown;
  }
  getFaxCountryList() {
    this.faxDropdown = !this.faxDropdown;
  }
  gettelePhoneCountryList() {
    this.telePhoneDown = !this.telePhoneDown;
  }

  getParticularTelephoneCountry(dialcode) {
    this.countrycodeTelephoneLabel = dialcode;
    this.gettelePhoneCountryList();
    this.searchText = "";
  }

  getParticularFaxCountry(dialcode) {
    this.countryCodeFaxLabel = dialcode;
    this.getFaxCountryList();
    this.searchText = "";
  }

  getparticularCountry(dialcode) {
    this.countryCodeLabel = dialcode;
    this.getCountryList();
    this.searchText = "";
  }

  @HostListener('document:click')
  clickout() {
    // if(this.phoneDropdown != this.phoneDummy)
    // {
    //   this.phoneDummy = this.phoneDropdown;
    // }
    // else {
    //   this.phoneDropdown = false;
    //   this.phoneDummy = false;
    // }
    // if(this.telePhoneDown != this.telephoneDummy)
    // {
    //   this.telephoneDummy = this.telePhoneDown;
    // }
    // else {
    //   this.telePhoneDown = false;
    //   this.telephoneDummy = false;
    // }
    // if(this.faxDropdown != this.faxDummy)
    // {
    //   this.faxDummy = this.faxDropdown;
    // }
    // else {
    //   this.faxDropdown = false;
    //   this.faxDummy = false;
    // }

  }

  onClick() {
    if (this.password === 'password') {
      this.password = 'text';
      this.show = true;
    } else {
      this.password = 'password';
      this.show = false;
    }
  }

  changePwd(event) {
    let numbers = /[^0-9]/g;
    let alphabets = /[^a-z]/g;
    let caps = /[^A-Z]/g;
    let nonSpecialSymbol = /[^A-Za-z0-9]/g;
    this.pwdLength = event.target.value.length;

    if (event.target.value.length < 8) {
      this.errorLength = true;
      this.regexBoolean = true;
      this.statusPwd = "Weak";
    } else {
      // More than 8 Characters
      let totalNumbers = event.target.value.replace(numbers, '').length;
      let totalCaps = event.target.value.replace(caps, '').length;
      let totalAlphabets = event.target.value.replace(alphabets, '').length;
      let totalSpecialCharacter = (event.target.value.length - event.target.value.replace(nonSpecialSymbol, '').length);
      // If atleast one special character AND number AND caps - Medium
      // Above Medium Condition and having extra one special character OR number OR caps - Strong
      if (totalNumbers > 0 && totalCaps > 0 && totalAlphabets > 0 && totalSpecialCharacter > 0) {
        this.errorLength = false;
        if (totalNumbers > 1 || totalCaps > 1 || totalSpecialCharacter > 1) {
          this.regexBoolean = false;
          this.statusPwd = "Strong";
        } else {
          this.regexBoolean = true;
          this.statusPwd = "Medium";
        }
      } else {
        this.statusPwd = "Weak";
        this.errorLength = true;
      }
    }
  }

  getMasterData() {
    let obj = { "type": "role", "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '' }
    this.appService.getMasterData(obj).subscribe(data => {
      if (data) {
        this.getRoleDetails = data.body;
      }
    });
  }

  getDepartmentDetails(custId) {
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.appService.departmentDetails(custId, individualObj).subscribe(data => {
      if (data) {
        // this.departmentDetails = data.body;
        setTimeout(() => {
          this.departmentDetails = data.body.sort((t1, t2) => {
            let name1 = t1.name.toLowerCase();
            let name2 = t2.name.toLowerCase();
            if (name1 > name2) { return 1; }
            if (name1 < name2) { return -1; }
            return 0;
          });

          this.departmentDetails.forEach(nameSet => {
            if (this.departmentName == nameSet.id) {
              this.myForms.controls['departmentName'].setValue(nameSet);
            }
          });

        }, 1000);

        //  this.departmentDetails.forEach(nameSet =>{
        //   if(this.departmentName == nameSet.id)
        //   {
        //     this.myForms.controls['departmentName'].setValue(nameSet);
        //   }
        // });
      }
    })
  }

  detectChange(value: string) {
    this.passwordStrength = this.measureStrength(`${value}`);
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

  get f() {
    return this.myForms.controls;
  }

  createUser() {
    this.submitted = true;
    let password = (this.myForms.controls.password.value) ? this.myForms.controls.password.value : "";
    let encryptPswd = this.apiService.crypto.encrypt(password);
    //let decryptPswd = this.apiService.crypto.decrypt(password);
    if (this.myForms.invalid || this.emailalreadyExistBoolean) {
      window.scrollTo(0, 0);
      return;
    }
    this.getCustomerDetails(this.myForms.value, encryptPswd);
  }


  dataArray: any = [];
  getCustomerDetails(fvalue, encryptPswd) {
    var encryptPassword = encryptPswd;
    let data = this.custModel.default;
    data.id = this.custId;
    data.individualId = (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '';
    data.custRelatedParty[0].role = fvalue.roleset;
    data.custRelatedParty[0].Customer_id = this.custId;
    data.custRelatedParty[0].individual.firstName = fvalue.name;
    if (this.passwordType == 'userDefined') {
      data.custRelatedParty[0].individual.status = 'Open';
    }
    else {
      data.custRelatedParty[0].individual.status = 'Active';
    }

    data.passWord = encryptPassword;
    data.passwordType = this.passwordType;
    let url = window.location.href;
    let urlArry = url.split('pages');
    let encryptUserInfo = this.apiService.crypto.encrypt(JSON.stringify({ id: this.myForms.value.loginId, password: this.myForms.value.password }));
    let encryptEmail = this.apiService.crypto.encrypt(this.myForms.value.loginId);
    let reDirectURL = urlArry[0] + 'pages/auth/set-password?email=' + encryptEmail;
    data.activateUrl = reDirectURL;
    data.custRelatedParty[0].individual.useLoginId = fvalue.loginIdAsBusinessId;

    data.custRelatedParty[0].individual.indvCharacteristic.forEach(ind => {
      if (ind.name == "departmentId") { ind.value = fvalue.departmentName ? fvalue.departmentName.id : '' }
      if (ind.name == "accessLevel") { ind.value = "Essentials only" }
      if (ind.name == "appLaunching") { ind.value = "New Browser Window" }
      if (ind.name == "otpNotification") { ind.value = "Email" }
      if (ind.name == "passwordRecoveryMode") { ind.value = "Email" }
      if (ind.name == "passwordRecoveryEmail") { ind.value = this.myForms.value.loginId }
      if (ind.name == "passwordRecoveryMobile") { ind.value = "" }
    });
    data.custRelatedParty[0].individual.indvContactMedium.forEach(contact => {
      if (contact.type == "mobile") { contact.characteristic.phoneNumber = fvalue.phone; contact.characteristic.countryCode = this.countryCodeLabel; }
      if (contact.type == "fax") { contact.characteristic.faxNumber = fvalue.fax; contact.characteristic.countryCode = this.countryCodeFaxLabel }
      if (contact.type == "telephone") { contact.characteristic.phoneNumber = fvalue.telephone; contact.characteristic.countryCode = this.countrycodeTelephoneLabel }
      if (contact.type == "loginid") { contact.characteristic.emailAddress = fvalue.loginId }
      if (contact.type == "contactEmailId") { contact.characteristic.emailAddress = fvalue.businessEmailId }

    })

    this.appService.createDetails(this.custId, data).subscribe(data => {
      if (data.body) {
        this.dataArray = data.body;
        let decryptPswd = this.apiService.crypto.decrypt(encryptPassword);
        this.myForms.controls['password'].setValue(decryptPswd);
        if (this.dataArray.individualUserCreation == "Success") {
          this.toastr.success('User Created Successfully!');
          this.routes.navigate(["/manage-users"]);
        } else {
          let message = (this.dataArray.message && this.dataArray.message != "") ? this.dataArray.message : "Error in creating user";
          this.toastr.warning(message);
        }
      }
    });
  }

  getEmailAlreadyExistList() {
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.appService.getEmailAlreadyExistList(individualObj).subscribe(data => {
      if (data) {

        this.getEmailList = data.body;
      }
    });
  }
  emailalreadyExistBoolean: boolean = false;

  checkEmailAlreadyExist() {
    // if (this.myForms.controls.loginId.status == 'INVALID') {
    //   this.myForms.controls['loginIdAsBusinessId'].setValue(false);
    //   this.myForms.controls['businessEmailId'].setValue("");
    //   this.isLoginIdAsBusinessId = false;
    // }
    // else {
    if (this.myForms.value.loginIdAsBusinessId == true) {
      this.myForms.controls['businessEmailId'].setValue(this.myForms.value.loginId);
    }
    if (this.myForms.value.loginIdAsBusinessId == true && this.myForms.controls.loginId.status == 'INVALID') {
      this.myForms.get('businessEmailId').markAsDirty();
    }
    if(this.myForms.controls.loginId.errors){
      this.myForms.controls['businessEmailId'].setValue('');
    }
    // }

    let existdata = this.getEmailList.filter(exist => exist.emailAddress.toLowerCase() == this.myForms.value.loginId.toLowerCase());
    if (existdata.length > 0) {
      this.emailalreadyExistBoolean = true;
    }
    else {
      this.emailalreadyExistBoolean = false;
      // if(this.myForms.value.loginId != "") {
      //   this.myForms.patchValue({  
      //     loginEmail: this.myForms.value.loginId,  
      //   }); 
      // } 
    }
  }

  onPasswordTypeCheck(passwordType) {
    this.passwordType = passwordType;
    if (this.passwordType == 'userDefined') {
      this.myForms.controls['password'].setValue('Singtel!1234');
    }
    else {
      this.myForms.controls['password'].setValue('');
      this.pwdLength = 0;
    }
  }

  onSetBusinessId() {
    if (this.myForms.value.loginIdAsBusinessId === true) {
      this.myForms.controls['businessEmailId'].setValue(this.myForms.value.loginId);
    }
    else {
      this.myForms.controls['businessEmailId'].setValue("");
      this.isLoginIdAsBusinessId = false;
    }
    this.onValidateBusinessId();
  }

  onValidateBusinessId() {
    if (this.myForms.value.loginIdAsBusinessId === false &&
      this.myForms.value.businessEmailId == this.myForms.value.loginId) {
      this.isLoginIdAsBusinessId = true;

    }
    else {
      this.isLoginIdAsBusinessId = false;
      let existdata = this.getEmailList.filter(exist => exist.emailAddress.toLowerCase() == this.myForms.value.businessEmailId.toLowerCase());
      if (existdata.length > 0) {
        this.businessEmailalreadyExistBoolean = true;
      }
      else {
        this.businessEmailalreadyExistBoolean = false;
        // if(this.myForms.value.loginId != "") {
        //   this.myForms.patchValue({  
        //     loginEmail: this.myForms.value.loginId,  
        //   }); 
        // } 
      }
    }


  }

  onToolTipShow(value) {
    if ('show' == value) {
      this.showToolTip = true;
    }
    else {
      this.showToolTip = false;
    }
  }

  onDiscardChanges() {
    this.myForms.reset();
    this.myForms.controls['loginIdAsBusinessId'].setValue(false);
    this.myForms.controls['roleset'].setValue('Primary Admin');
    this.myForms.controls['passwordRecoveryViaEmail'].setValue(true);
    this.myForms.controls['passwordRecoveryViaSms'].setValue(false);
    this.myForms.controls['limitAccess'].setValue('wholeSite');
    this.myForms.controls['applicationLaunching'].setValue('sameBrowserWindow');
    this.myForms.controls['otpNotification'].setValue('emailOtp');
    this.passwordType = 'userDefined';
    if (this.passwordType == 'userDefined') {
      this.myForms.controls['password'].setValue('Singtel!1234');
    }
    this.isLoginIdAsBusinessId = false;
  }
}
