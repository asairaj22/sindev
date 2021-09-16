import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { AppService } from "src/app/app.service";
import { Table } from "primeng/table";
import { SelectItem } from 'primeng/api';
import { Customer } from "src/app/main/components/users/manage-users/manage-users";
import { FormBuilder, FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input';
import * as CustomerModelData from 'src/app/main/components/users/manage-users/create-user.json';
import { Router } from '@angular/router';
import { ApiService } from "src/app/platform/util/api.service";
import { ToastrService } from 'ngx-toastr';
declare var $: any;
import * as CountryCodes from "src/app/countryCode.json";
import { GlobalDataService } from 'src/app/main/services/global.service';
import * as _ from "lodash";

@Component({
  selector: 'app-individual-user',
  templateUrl: './individual-user.component.html',
  styleUrls: ['./individual-user.component.css']
})
export class IndividualUserComponent implements OnInit {
  countryCodes: any = CountryCodes;
  @ViewChild("dt", { static: false }) table: Table;
  @ViewChild('generalForm', { static: false }) generalForm: NgForm;
  submitted = false;
  custModel: any = CustomerModelData;
  custId: any;
  customers: Customer[];
  customerData: any = [];
  customerName: string;
  customerNameInput: string;
  customerNameDefault: string;
  customerStatus: string;
  customerEmail: any;
  paginationBoolean: boolean = false;
  customerfaxNumber: any;
  departmentName: string = "";
  customerphoneNumber: any;
  essential: string = "active";
  validDate: any;
  resetEmail: string;
  customerTelephoneNumber: any;
  selectedCustomers: Customer[];
  captchaNumber: any;
  custDetails: any = {};
  account: string = "";
  accountSet: string = '';
  customer: any = [];
  separateDialCode = true;
  custPhone: any;
  custTelePhone: any;
  custFax: any;
  getRoleDetails: any = [];
  getAccessSet = this.globalDataService.accessSet['individualUsersPage'];
  getSharedObjAccessSet: any;
  emailIdArray: any = [];
  auditData: any;
  lastSuccess: any;
  lastFailure: any;
  lastUpdate: any;
  lastLogout: any;
  invalidAttempts: string;
  departmentDetails: any = [];
  primaryRole: string;
  roleObj: any = {};
  roleBoolean: boolean = false;
  isPrimaryContact: boolean = false;
  randomOne: number = Math.floor(Math.random() * 8 + 10);
  randomTwo: number = Math.floor(Math.random() * 5 + 10);
  primarySelect: string = "";
  public myForms: FormGroup;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  oldPrimaryContactId: number = 0;
  getInstanceDetails: any = [];
  searchText: any;
  assignNumber: number = 0;
  custIndividualId: number;
  showToolTip: boolean = false;
  isLoginIdAsBusinessId: boolean = false;
  servercontactEmailId: string;
  tempCustomerfax: any;
  tempCustomermobile: any;
  tempCustomertele: any;


  constructor(private customerService: AppService, private routes: Router, fb: FormBuilder, private toastr: ToastrService, private apiService: ApiService, private globalDataService: GlobalDataService, private elementRef: ElementRef) {
    this.myForms = fb.group({
      loginId: ["", [Validators.required, Validators.pattern(this.customerService.emailIdValidatePattern)]],
      businessEmailId: ["", [Validators.required, Validators.pattern(this.customerService.emailIdValidatePattern)]],
      loginIdAsBusinessId: [false],
      name: ["", Validators.required],
      mobilePhone: ["", Validators.minLength(8)],
      fax: ["", Validators.minLength(8)],
      telephone: ["", Validators.minLength(8)],
      departmentName: [""],
      telePhoneSearch: [""],
      faxSearch: [""],
      mobileSearch: [""],
      //  [Validators.required]
    });
    this.custId = sessionStorage.getItem("customerId");
    let getUserAccountId = JSON.parse(sessionStorage.getItem("userAccountDetails"));
    this.custIndividualId = getUserAccountId.id;
    if (sessionStorage.getItem("individualDetail")) {
      let getObj = this.apiService.crypto.decrypt(sessionStorage.getItem("individualDetail"));
      this.customerService.manageIndividualUser = getObj ? JSON.parse(getObj) : {};
      this.custDetails = this.customerService.manageIndividualUser;
      if (this.custDetails.assignId && this.custDetails.assignId > 0) {
        this.assignNumber = this.custDetails.assignId;
      }
    }
    // if (Object.keys(this.customerService.manageIndividualUser).length == 0) {
    // } else {
    //   if(sessionStorage.getItem("individualDetail")) {
    //     let getObj = this.apiService.crypto.decrypt(sessionStorage.getItem("individualDetail"));        
    //     this.customerService.manageIndividualUser = getObj ? JSON.parse(getObj) : {};
    //   }

    //   this.custDetails = this.customerService.manageIndividualUser;
    //   if (this.custDetails.assignId && this.custDetails.assignId > 0) {
    //     this.assignNumber = this.custDetails.assignId;
    //   }
    // }

  }

  ngOnInit() {
    // this.currentAccessTab();
    let emailId = sessionStorage.getItem("ep-username");
    let accountName = (sessionStorage.getItem('ep-accountname')) ? sessionStorage.getItem('ep-accountname') : '';
    let appName = (sessionStorage.getItem('ep-proj-active')) ? JSON.parse(sessionStorage.getItem('ep-proj-active')).contextPath : '';
    this.emailIdArray.push(emailId);
    let obj = {
      "userList": this.emailIdArray,
      "isPlatformAudit": false,
      "apiList": [],
      "appList": [appName],
      "appLevelPlatformModuleList": ["Platform Login", "Platform Logout"],
      "changedObjectNameList": [],
      "fromDate": "",
      "toDate": "",
      "eventType": "All",
      "customFilter": true,
      "accountName": accountName
    }
    this.apiService.invokePlatformServiceApi('/auditLog/getAudit', 'POST', obj).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        this.auditData = res.body;
        let loginDetailsData = this.auditData;
        loginDetailsData.sort(function (a, b) {
          return a.createdDate - b.createdDate
        });
        this.lastUpdate = new Date(loginDetailsData[loginDetailsData.length - 1].createdDate);
        let successLoginData = loginDetailsData.filter(function (item) { return (item.changeSummary.indexOf("Login Success") >= 0); });
        successLoginData.sort(function (a, b) {
          return a.createdDate - b.createdDate
        });
        this.lastSuccess = new Date(successLoginData[successLoginData.length - 1].createdDate);
        let failureLoginData = loginDetailsData.filter(function (item) { return (item.changeSummary.indexOf("Login Failed") >= 0); });
        failureLoginData.sort(function (a, b) {
          return a.createdDate - b.createdDate
        });
        this.invalidAttempts = failureLoginData.length;
        this.lastFailure = new Date(failureLoginData[failureLoginData.length - 1].createdDate);
        let successLogoutData = loginDetailsData.filter(function (item) { return (item.changeSummary.indexOf("Logout Success") >= 0); });
        successLogoutData.sort(function (a, b) {
          return a.createdDate - b.createdDate
        });
        if (successLogoutData.length >= 0 && successLogoutData.createdDate) {
          this.lastLogout = new Date(successLogoutData[successLogoutData.length - 1].createdDate);
        }

      },
      (err: any) => {
        this.apiService.loaderHide('loader');
      }

    );

    this.getIndividualCustomer(this.custDetails);
    this.getCustomerDetails(this.custDetails.individualId);
  }

  currentAccessTab() {
    if (this.isAccessPresent('accountPageRead')) {
      this.activateTab('tab1');
    }
    else if (!(this.isAccessPresent('accountPageRead')) && (this.isAccessPresent('applicationPage'))) {
      this.activateTab('tab2');
    }
    else if (!(this.isAccessPresent('accountPageRead')) && !(this.isAccessPresent('applicationPage')) && (this.isAccessPresent('personalInfo'))) {
      this.activateTab('tab3');
    }
    else if (!(this.isAccessPresent('accountPageRead')) && !(this.isAccessPresent('applicationPage')) && !(this.isAccessPresent('personalInfo')) && (this.isAccessPresent('terminate'))) {
      this.activateTab('tab4');
    }
  }
  activateTab(tab) {
    const dom = this.elementRef.nativeElement;
    let selectedTab = (dom.querySelectorAll('a.nav-link[href="#' + tab + '"]'))[0];
    // selectedTab.tab('show');
    selectedTab.click();
  }
  isAccessPresent(accessRef) {
    this.getSharedObjAccessSet = (this.globalDataService.shareObj && this.globalDataService.shareObj['userAccess']) ? this.globalDataService.shareObj['userAccess'] : [];
    let getFilterData = _.filter(this.getSharedObjAccessSet, (b) => [this.getAccessSet[accessRef]].map(c => c).indexOf(b.name) > -1);
    if (getFilterData && getFilterData.length > 0) {
      return true;
    }
    else {
      return false;
    }
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.getMasterData();
      this.getDepartmentDetails(this.custId);
    }, 2000);

    this.currentAccessTab();

  }

  get f() {
    return this.myForms.controls;
  }

  terminateSubmitted: boolean = false;
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


  getfaxValid(event) {
    if (event.target.value == "") {

      this.faxEmptyBoolean = true;
    }
    else {
      this.faxEmptyBoolean = false;
    }
  }
  gettelePhoneValid(event) {
    if (event.target.value == "") {

      this.telephoneEmptyBoolean = true;
    }
    else {
      this.telephoneEmptyBoolean = false;
    }
  }

  getDepartmentDetails(custId) {
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.customerService.departmentDetails(custId, individualObj).subscribe(data => {
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
        }, 500);

      }
    })
  }

  gotoManageUser() {
    sessionStorage.removeItem("individualDetail");
    this.routes.navigate(["/manage-users"]);
  }

  changeData(event) {

    // this.myForms.controls['departmentName'].setValue(event.value.id);
  }

  getMasterData() {
    let obj = { "type": "role", "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '' }
    this.customerService.getMasterData(obj).subscribe(data => {
      if (data) {
        this.getRoleDetails = data.body;

        this.getRoleDetails.forEach(role => {
          if (role.parameterName == this.primaryRole) {
            this.roleObj = role;
            setTimeout(() => {
              this.roleBoolean = true;

            }, 1000)

          }
        });
      }
    });
  }

  getRefresh() {
    this.randomOne = Math.floor(Math.random() * 8 + 10);
    this.randomTwo = Math.floor(Math.random() * 5 + 10);
    this.captchaTrue = true;
    this.captchaNumber = "";
  }
  revertCaptchaCheckbox() {
    this.captchaNumber = "";
    this.terminateSubmitted = false;
    this.checkTerminateEvent = false;
    this.captchaTrue = false;
  }

  getassignPrimary(e) {
    if (this.customerData[0].isPrimaryContact == "true") {
      this.toastr.warning('Please assign another Primary Admin as Primary contact before unchecking or changing the user role!');
      e.target.checked = true;
    }
    else {
      this.isPrimaryContact = !this.isPrimaryContact;
    }


  }

  accNo: number = 1;
  accData(id) {
    this.accNo = id;
  }

  accountActive(value) {
    if (this.customerData[0].isPrimaryContact == "true") {
      if (value == 'Suspended') {
        this.toastr.warning('You have no access to suspend this account');
      }
    }
    else {
      if (this.account !== value) {
        this.account = value;
        this.generalForm.control.markAsTouched();
        this.generalForm.control.markAsDirty();
      }
    }
    if (this.account == this.customerData[0].custRelatedParty[0].individual.status &&
      (this.generalForm.value.selectPrimaryContact == false || this.generalForm.value.selectPrimaryContact == null)) {
      this.generalForm.control.markAsPristine();
      this.generalForm.control.markAsUntouched();
    }
  }

  onTrackAssignPrimaryContact() {
    if (this.generalForm.value.selectPrimaryContact === false &&
      this.account == this.customerData[0].custRelatedParty[0].individual.status) {
      this.generalForm.control.markAsPristine();
      this.generalForm.control.markAsUntouched();
    }
  }

  loginBoolean: boolean = false;
  faxBoolean: boolean = false;
  phoneBoolean: boolean = false;
  telephoneBoolean: boolean = false;
  sameCustomer: boolean = false;

  getIndividualCustomer(custDetails) {
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.customerService.getIndividualUser(custDetails.id, custDetails.individualId, individualObj).subscribe(data => {
      if (data) {
        this.customerData = data.body;

        if (this.customerData[0].isPrimaryContact == "true") {
          this.isPrimaryContact = true;
        }
        if (this.customerData[0].isPrimaryContact == "false") {
          this.isPrimaryContact = false;
        }
        if (this.customerData[0].primaryContactAdminUserId) {
          this.oldPrimaryContactId = this.customerData[0].primaryContactAdminUserId;
        };

        if (this.custIndividualId == this.customerData[0].custRelatedParty[0].individual.id) {
          this.sameCustomer = true;
        }

        this.validDate = this.customerData[0].custRelatedParty[0].validFrom;
        this.account = this.customerData[0].custRelatedParty[0].individual.status;
        this.accountSet = this.customerData[0].custRelatedParty[0].individual.status;
        this.customerName = this.customerData[0].custRelatedParty[0].individual.firstName;
        this.customerNameInput = this.customerData[0].custRelatedParty[0].individual.firstName;
        this.customerStatus = this.customerData[0].status;
        this.primaryRole = this.customerData[0].custRelatedParty[0].role;


        this.myForms.controls['loginIdAsBusinessId'].setValue(this.customerData[0].custRelatedParty[0].individual.useLoginId && this.customerData[0].custRelatedParty[0].individual.useLoginId == 'true' ? true : false);

        this.customerData[0].custRelatedParty[0].individual.indvContactMedium.forEach((contact, index) => {
          if (contact.type == "loginid" && !this.loginBoolean) {
            this.loginBoolean = true; this.customerEmail = contact.characteristic.emailAddress;

          }

          if (contact.type == "contactEmailId") {
            this.servercontactEmailId = JSON.parse(JSON.stringify(contact.characteristic.emailAddress));
            this.myForms.controls['businessEmailId'].setValue(contact.characteristic && contact.characteristic.emailAddress ? contact.characteristic.emailAddress : '');

          }

          else {
            this.myForms.controls['loginIdAsBusinessId'].setValue('');

          }
          if (contact.type == "fax" && !this.faxBoolean) {
            this.faxBoolean = true;
            this.tempCustomerfax = contact.characteristic.faxNumber;
            this.customerfaxNumber = contact.characteristic.faxNumber;
            this.countryCodeFaxLabel = (contact.characteristic.countryCode) ? contact.characteristic.countryCode : "+91";
          }
          if (contact.type == "mobile" && !this.phoneBoolean) {
            this.phoneBoolean = true;
            this.tempCustomermobile = contact.characteristic.phoneNumber
            this.customerphoneNumber = contact.characteristic.phoneNumber;
            this.countryCodeLabel = (contact.characteristic.countryCode) ? contact.characteristic.countryCode : "+91";
          }
          if (contact.type == "telephone" && !this.telephoneBoolean) {
            this.telephoneBoolean = true;
            this.tempCustomertele = contact.characteristic.phoneNumber;
            this.customerTelephoneNumber = contact.characteristic.phoneNumber;
            this.countrycodeTelephoneLabel = (contact.characteristic.countryCode) ? contact.characteristic.countryCode : "+91";
          }
          if (index == (this.customerData[0].custRelatedParty[0].individual.indvContactMedium.length - 1)) {
            this.getContactArray();
          }
        });
        let contactmailPresent = this.customerData[0].custRelatedParty[0].individual.indvContactMedium.filter((contact) => {
          return (contact.type == 'contactEmailId');
        });
        let loginidarr = this.customerData[0].custRelatedParty[0].individual.indvContactMedium.filter((contact) => {
          return (contact.type == 'loginid');
        });
        let loginid = (loginidarr.length > 0 && loginidarr[0].characteristic && loginidarr[0].characteristic.emailAddress) ? loginidarr[0].characteristic.emailAddress : '';
        let contactmailid = (contactmailPresent.length > 0 && contactmailPresent[0].characteristic && loginidarr[0].characteristic.emailAddress) ? contactmailPresent[0].characteristic.emailAddress : '';
        if (loginid == contactmailid) {
          this.myForms.controls['loginIdAsBusinessId'].setValue(true);
          this.myForms.controls['businessEmailId'].setValue(loginid);
        }
        if (this.customerData[0].custRelatedParty[0].individual.indvCharacteristic.length == 0) {
          this.customerData[0].custRelatedParty[0].individual.indvCharacteristic.push(
            { "name": "departmentId", "value": "" },
            { "name": "accessLevel", "value": "Essentials Only" },
            { "name": "appLaunching", "value": "New Browser Window" },
            { "name": "otpNotification", "value": "Email" },
            { "name": "passwordRecoveryMode", "value": "Email" },
            { "name": "passwordRecoveryEmail", "value": this.customerEmail },
            { "name": "passwordRecoveryMobile", "value": "" }
          )
        }
        else {
          this.customerData[0].custRelatedParty[0].individual.indvCharacteristic.forEach(dept => {
            if (dept.name == "departmentId") {
              this.departmentName = dept.value;
            }
          });
        }

      }
    })
  }

  getContactArray() {
    if (!this.loginBoolean) {
      this.loginBoolean = true;
      this.customerData[0].custRelatedParty[0].individual.indvContactMedium.push({
        "type": "loginid",
        "characteristic": {
          "emailAddress": this.customerEmail
        }
      },
        {
          "type": "contactEmailId",
          "characteristic": {
            "emailAddress": this.customerEmail
          }
        }
      );
    }
    if (!this.faxBoolean) {
      this.faxBoolean = true;
      this.customerData[0].custRelatedParty[0].individual.indvContactMedium.push({
        "type": "fax",
        "characteristic": {
          "faxNumber": this.customerfaxNumber,
          "countryCode": this.countryCodeFaxLabel
        }
      });
    }
    if (!this.phoneBoolean) {
      this.phoneBoolean = true;
      this.customerData[0].custRelatedParty[0].individual.indvContactMedium.push({
        "type": "mobile",
        "characteristic": {
          "phoneNumber": this.customerTelephoneNumber,
          "countryCode": this.countryCodeLabel
        }
      });
    }
    if (!this.telephoneBoolean) {
      this.telephoneBoolean = true;
      this.customerData[0].custRelatedParty[0].individual.indvContactMedium.push({
        "type": "telephone",
        "characteristic": {
          "phoneNumber": this.customerphoneNumber,
          "countryCode": this.countrycodeTelephoneLabel
        }
      });
    }

  }

  terminateValidate() {
    this.terminateSubmitted = true;
  }

  getCustomerDetails(custid) {
    let individualObj = {"customerId": (sessionStorage && sessionStorage['customerId']) ? sessionStorage['customerId'] : ''}
    this.customerService.getIndividualCustomerDetails(custid, individualObj).subscribe((res: any) => {
        this.paginationBoolean = true;
        this.getInstanceDetails = res.body;
        this.customers = this.getInstanceDetails;
        if (this.getInstanceDetails.length == 0) {
          this.paginationBoolean = false;
        }
        this.getInstanceDetails.forEach(cust => {
          if (cust.ecdmProductSubscriptionUsers.length > 0) {
            cust.custRoles = cust.ecdmProductSubscriptionUsers[0].role
            cust.custStatus = cust.ecdmProductSubscriptionUsers[0].status;
          }
        })
      });
  }

  resetChange() {
    this.generalForm.control.markAsPristine();
    this.generalForm.control.markAsUntouched();
    if (this.generalForm.control.get("selectPrimaryContact")) {
      this.generalForm.control.get("selectPrimaryContact").setValue(null)
    }
    this.account = this.customerData[0].custRelatedParty[0].individual.status;
    this.getRoleDetails.forEach(role => {
      if (role.parameterName == this.customerData[0].custRelatedParty[0].role) {
        this.roleObj = role;
      }
    });
  }

  resetChangePersonal() {
    this.myForms.markAsPristine();
    this.myForms.markAsUntouched();
    this.customerNameInput = this.customerData[0].custRelatedParty[0].individual.firstName;
    this.customerStatus = this.customerData[0].status;
    this.myForms.controls['loginIdAsBusinessId'].setValue(this.customerData[0].custRelatedParty[0].individual.useLoginId && this.customerData[0].custRelatedParty[0].individual.useLoginId == 'true' ? true : false);
    this.customerData[0].custRelatedParty[0].individual.indvContactMedium.forEach(contact => {
      if (contact.type == "loginid") { this.customerEmail = contact.characteristic.emailAddress; }
      this.resetEmail = (contact.characteristic && contact.characteristic.emailAddress) ? contact.characteristic.emailAddress : "";
      if (contact.type == "fax") { this.customerfaxNumber = contact.characteristic.faxNumber; this.countryCodeFaxLabel = contact.characteristic.countryCode }
      if (contact.type == "mobile") { this.customerphoneNumber = contact.characteristic.phoneNumber; this.countryCodeLabel = contact.characteristic.countryCode }
      if (contact.type == "telephone") { this.customerTelephoneNumber = contact.characteristic.phoneNumber; this.countrycodeTelephoneLabel = contact.characteristic.countryCode }
      if (contact.type == "loginid") { this.customerEmail = contact.characteristic.emailAddress; }
      if (contact.type == "contactEmailId") {
        this.myForms.controls['businessEmailId'].setValue(contact.characteristic.emailAddress);
      }
    });


    // this.preferredCountries = this.customerphoneNumber.dialCode;
    this.customerData[0].custRelatedParty[0].individual.indvCharacteristic.forEach(dept => {
      if (dept.name == "departmentId") {
        this.departmentName = dept.value
        // this.myForms.controls['departmentName'].setValue(dept.value);
        this.departmentDetails.forEach(nameSet => {
          if (this.departmentName == nameSet.id) {
            this.myForms.controls['departmentName'].setValue(nameSet);
          }
        });
      }
    });
    this.account = this.customerData[0].custRelatedParty[0].individual.status;
  }







  createUser(data, generalForm) {
    if (data == "appln") {
      if (this.isPrimaryContact == true) {
        this.customerData[0].isPrimaryContact = "true";
        this.customerData[0].oldPrimaryContactId = this.customerData[0].primaryContactAdminUserId;
      }
      if (this.isPrimaryContact == false) {
        if (this.generalForm.value.selectPrimaryContact === true) {
          this.customerData[0].isPrimaryContact = "true";
          this.customerData[0].oldPrimaryContactId = this.customerData[0].primaryContactAdminUserId;
        }
        else {
          this.customerData[0].isPrimaryContact = "false";
          this.customerData[0].oldPrimaryContactId = 0;
        }
      }
      // if(this.generalForm.value.accountStatus && this.generalForm.value.accountStatus !== null) {
      //   this.customerData[0].status = this.generalForm.value.accountStatus;
      // }
      if (this.oldPrimaryContactId == this.custDetails.individualId) {
        // this.customerData[0].oldPrimaryContactId = 0;
      }
      if (this.account != this.customerData[0].custRelatedParty[0].individual.status) {
        this.customerData[0].isIndvStatusChanged = true;
      }
      else if (this.account == this.customerData[0].custRelatedParty[0].individual.status) {
        this.customerData[0].isIndvStatusChanged = false;
      }
      if (this.primaryRole == this.customerData[0].custRelatedParty[0].role) {
        this.customerData[0].isRoleChanged = false;
        this.customerData[0].oldUserRole = '';
      }
      else if (this.primaryRole != this.customerData[0].custRelatedParty[0].role) {
        this.customerData[0].isRoleChanged = true;
        this.customerData[0].oldUserRole = this.customerData[0].custRelatedParty[0].role;
        this.customerData[0].custRelatedParty[0].role = this.primaryRole;
      }

      this.customerData[0].custRelatedParty[0].individual.status = this.account;
      this.getCustomerDetailsData();
    }
    else if (data == "inputData") {

      this.submitted = true;
      if (this.myForms.invalid) {
        return;
      }
      this.customerData[0].custRelatedParty[0].individual.useLoginId = this.myForms.value.loginIdAsBusinessId == true ? 'true' : 'false';
      this.customerData[0].custRelatedParty[0].individual.firstName = this.customerNameInput;
      this.customerData[0].custRelatedParty[0].individual.indvContactMedium.forEach(contact => {

        if (contact.type == "fax") {
          if (this.customerfaxNumber == "") {
            this.customerfaxNumber = null;
          }
          contact.characteristic.faxNumber = this.customerfaxNumber; contact.characteristic.countryCode = this.countryCodeFaxLabel
        }
        if (contact.type == "mobile") { contact.characteristic.phoneNumber = this.customerphoneNumber == "" ? null : this.customerphoneNumber; contact.characteristic.countryCode = this.countryCodeLabel; }
        if (contact.type == "telephone") {
          if (this.customerTelephoneNumber == "") {
            this.customerTelephoneNumber = null;
          }
          contact.characteristic.phoneNumber = this.customerTelephoneNumber; contact.characteristic.countryCode = this.countrycodeTelephoneLabel
        }
        if (contact.type == "loginid") { contact.characteristic.emailAddress = this.customerEmail; }
        if (contact.type == "contactEmailId") {
          contact.characteristic.emailAddress = this.myForms.value.businessEmailId;
        }
      });
      // check whether the customer data haveing business email id or not 
      let businessEmailResult = this.customerData[0].custRelatedParty[0].individual.indvContactMedium.filter((contact: any) => {
        return contact.type == "contactEmailId";
      });


      if (businessEmailResult.length <= 0) {
        this.customerData[0].custRelatedParty[0].individual.indvContactMedium.push(
          {
            "type": "contactEmailId",
            "characteristic": {
              "emailAddress": this.myForms.value.businessEmailId
            }
          }
        )
      }

      if (this.customerData[0].custRelatedParty[0].individual.indvCharacteristic.length == 0) {
        this.customerData[0].custRelatedParty[0].individual.indvCharacteristic.push(
          { "name": "departmentId", "value": "" },
          { "name": "accessLevel", "value": "Essentials Only" },
          { "name": "appLaunching", "value": "New Browser Window" },
          { "name": "otpNotification", "value": "Email" },
          { "name": "passwordRecoveryMode", "value": "Email" },
          { "name": "passwordRecoveryEmail", "value": this.customerEmail },
          { "name": "passwordRecoveryMobile", "value": "" }
        )
      }
      else if (this.customerData[0].custRelatedParty[0].individual.indvCharacteristic.length > 0) {
        if (this.customerData[0].custRelatedParty[0].individual.indvCharacteristic.filter((value, index) => { return value.name === "departmentId" }).length > 0) {
          this.customerData[0].custRelatedParty[0].individual.indvCharacteristic.forEach(dept => {
            if (dept.name == "departmentId") {
              dept.value = this.myForms.value.departmentName ? this.myForms.value.departmentName.id : "";
            }
          });
        } else {
          this.customerData[0].custRelatedParty[0].individual.indvCharacteristic.push(
            { "name": "departmentId", "value": this.myForms.value.departmentName ? this.myForms.value.departmentName.id : "" }
          );
        }
      }
      else {
        this.customerData[0].custRelatedParty[0].individual.indvCharacteristic.forEach(dept => {
          if (dept.name == "departmentId") {
            dept.value = this.myForms.value.departmentName ? this.myForms.value.departmentName.id : "";
          }
        })
      }
      this.customerData[0].isPersonalInformationChanged = false;
      if (this.servercontactEmailId != this.myForms.value.businessEmailId) {
        this.customerData[0].isPersonalInformationChanged = true;
      }
      if (this.tempCustomerfax != this.myForms.value.fax) {
        this.tempCustomerfax = this.myForms.value.fax;
        this.customerData[0].isPersonalInformationChanged = true;
      }
      if (this.tempCustomermobile != this.myForms.value.mobilePhone) {
        this.tempCustomermobile = this.myForms.value.mobilePhone
        this.customerData[0].isPersonalInformationChanged = true;
      }
      if (this.tempCustomertele != this.myForms.value.telephone) {
        this.tempCustomertele = this.myForms.value.telephone
        this.customerData[0].isPersonalInformationChanged = true;
      }

      this.getCustomerDetailsData();
    }
  }
  dataArray: any = [];
  getCustomerDetailsData() {
    let url = window.location.href;
    let urlArry = url.split('pages');
    this.customerData[0].homeUrl = urlArry[0] + 'pages/home';
    this.customerData[0].individualId = (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '';
    this.customerService.editUserDetails(this.custId, this.customerData[0].custRelatedParty[0].individual.id, this.customerData[0]).subscribe(data => {
      if (data.body) {
        let emailId = sessionStorage.getItem("ep-username");
        if (emailId == this.myForms.value.loginId) {
          if (sessionStorage && sessionStorage['userAccountDetails']) {
            let userAccountDetails = JSON.parse(sessionStorage['userAccountDetails'])
            userAccountDetails.phoneno = this.myForms.value.mobilePhone ? this.myForms.value.mobilePhone : '';
             userAccountDetails.name = this.myForms.value.name ? this.myForms.value.name : '';
            sessionStorage.setItem('userAccountDetails', JSON.stringify(userAccountDetails));
          }
        }
        this.myForms.markAsPristine();
        this.myForms.markAsUntouched();
        this.generalForm.control.markAsPristine();
        this.generalForm.control.markAsUntouched();
        this.dataArray = data.body;
        this.toastr.success('Changes Saved Successfully!');
        this.oldPrimaryContactId = 0;
        this.getIndividualCustomer(this.custDetails);
        this.getCustomerDetails(this.custDetails.individualId);
        setTimeout(() => {
          this.getDepartmentDetails(this.custId);
          this.getMasterData();
        }, 3000);
      }
    });
  }

  checkTerminateEvent: boolean = false;
  captchaSum: any;
  captchaTrue: boolean = false;

  checkConfirmEvent() {
    this.checkTerminateEvent = !this.checkTerminateEvent;
  }

  getCaptchaVal(event) {

    this.captchaNumber = event.target.value;

    if ((this.randomOne + this.randomTwo) == event.target.value) {
      this.captchaTrue = true;

    }
    else {
      this.captchaTrue = false;

    }
  }



  terminateUser() {
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.customerService.terminateUser(this.custDetails.id, this.custDetails.individualId, individualObj).subscribe(data => {
      if (data) {
        this.toastr.success('Terminated successfully');
        this.routes.navigate(["/manage-users"]);
      }
      else {
        this.toastr.warning('something went wrong');
      }
    }, (err) => {

      this.toastr.error(err.error.errorMessage);
    })

  }

  disableCheckBox: boolean = false;
  changePrimary(event) {

    if (event.value.parameterName == 'Primary Admin') {
      if (this.account == 'Suspended') {
        event.value.parameterName = this.customerData[0].custRelatedParty[0].role;
        this.toastr.warning("Please active your Account");
        return false;
      }
      else {
        this.primaryRole = event.value.parameterName;
        this.disableCheckBox = false;
      }
    }
    else {
      this.disableCheckBox = true;
      this.isPrimaryContact = false;
      this.primaryRole = event.value.parameterName;
    }

  }
  triggerEmail() {
    let url = window.location.href;
    let urlArry = url.split('pages');
    let email = (this.customerEmail) ? this.customerEmail : '';
    let encryptedEmail = this.apiService.crypto.encrypt(email);
    let reDirectUrl = urlArry[0] + 'pages/auth/change-password?email=' + encryptedEmail;

    let inputObj = {
      "username": (this.customerEmail) ? this.customerEmail : '',
      "activateUrl": (reDirectUrl) ? reDirectUrl : ''
    };
    this.customerService.submitForgetPassword(inputObj).subscribe(res => {
      let passwordResetDet = res.body;
      this.toastr.success("Please check your Email");

    });
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onSetBusinessId() {
    if (this.myForms.value.loginIdAsBusinessId === true) {
      this.myForms.controls['businessEmailId'].setValue(this.myForms.value.loginId);
    }
    else {
      this.myForms.controls['businessEmailId'].setValue("");
      this.isLoginIdAsBusinessId = false;
    }

  }

  onValidateBusinessId() {
    if (this.myForms.value.loginIdAsBusinessId === false &&
      this.myForms.value.businessEmailId == this.myForms.value.loginId) {
      this.isLoginIdAsBusinessId = true;

    }
    else {
      this.isLoginIdAsBusinessId = false;
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

}