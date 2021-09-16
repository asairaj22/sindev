import { Component, OnInit, ElementRef, SimpleChanges, ViewChild } from '@angular/core';
import { MyAccountService } from './my-account.service';
import { Table } from "primeng/table";
import { SelectItem } from 'primeng/api';
import { PasswordStrengthValidator } from "../login/change-password/password-strength.validators";
import { ValidatorFn } from "@angular/forms";
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input';
import { ToastrService } from 'ngx-toastr';
import * as CountryCodes from "src/app/countryCode.json";
import { AppService } from "src/app/app.service";
import { Customer } from "src/app/main/components/users/manage-users/manage-users";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ApiService } from "src/app/platform/util/api.service";
import moment from 'moment';
import { JsonPipe } from '@angular/common';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ExcelService } from './export-to-excel.service';
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css'],
  providers: [DatePipe]
})

export class MyAccountComponent implements OnInit {
  @ViewChild("dt", { static: false }) table: Table;
  @ViewChild("reportData", { static: false }) reportData: Table;
  @ViewChild('reportContent', { static: false }) reportContent: ElementRef;

  countryCodes: any = CountryCodes;
  accountDetails: any;
  SearchCountryField = SearchCountryField;
  paginationBoolean: boolean = true;
  customers: Customer[];
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  customerEmail: any;
  myUserName: any;
  getReportDetails: boolean = false;
  preferredCountries: CountryISO[] = [CountryISO.Qatar];
  selectedCustomers: any = [];
  dateReport: any = [];
  public myForms: FormGroup;
  public changePasswordForm: FormGroup;
  departmentArray: any;
  essential: string = "active";
  submitted = false;
  passwordModel = '';
  searchText: any;
  passwordStrength;
  updateSuccess: boolean = false;
  getMyaccountDetails: any = {};
  fName: string = "";
  countryCodeLabel: string = "+65";
  countryCodeFaxLabel: string = "+65";
  countrycodeTelephoneLabel: string = "+65";
  departmentDetails: any = [];
  departmentName: any;
  loginAudit: number = 0;
  passFieldTextType: boolean = false;
  newPassFieldTextType: boolean = false;
  portalName: any;
  custId: any;
  showToolTip: boolean = false;
  isMyAccountGenTabOpen: boolean = true;

  userDetails: any;
  getInstanceDetails: any = [];
  loginBoolean: boolean = false;
  faxBoolean: boolean = false;
  phoneBoolean: boolean = false;
  telephoneBoolean: boolean = false;
  inputObj = {};
  start: any;
  end: any;
  date_range: string = 'Today';
  userNamesList_resp: object[] = [];
  actionFlowList_resp: object[] = [];
  objects_resp: object[] = [];
  connector_operations_resp: object[] = [];
  dateFormat: any = { "moment": { "EEE": "ddd", "EEEE": "dddd", "d": "D", "dd": "DD", "M": "M", "MM": "MM", "MMM": "MMM", "MMMM": "MMMM", "yy": "YY", "yyyy": "YYYY", "h": "h", "hh": "hh", "H": "H", "HH": "HH", "a": "A", "mm": "mm", "ss": "ss", "S": "ms" } };
  defaultDateTimeFormat: string = '';
  searchParamObject: any = {};
  filterObjectList: any = [];
  auditLog: any;
  filterCriteria: object = {};
  customRange: boolean = false;
  auditLogScreen: string = '';
  applicationObject: any = {};
  objectMetadata: any;
  isAPI: boolean = true;
  isSoap: boolean = false;
  connector_configured_id: any = '1';
  isConnectorOpertationAvail: boolean = false;
  isConnectorOperationAvail: boolean = false;
  configuredConnectorList: object[] = [];
  auditReportTableData: any;
  auditReportDetailsData: any;
  compareAuditLogData: any;
  isComparedAuditClicked: boolean = false;
  customRangeSettings: object = {};
  customRangeFrom: Date = new Date();
  customRangeTo: Date = new Date();
  dateRangeErrorMessage: string = '';
  logService: string;
  auditPaginatorBoolean: boolean = true;
  tableAccountBoolean: boolean = true;
  isLoginIdAsBusinessId: boolean = false;

  phoneDropdown: boolean = false;
  faxDropdown: boolean = false;
  telePhoneDown: boolean = false;
  phoneDummy: boolean = false;
  faxDummy: boolean = false;
  telephoneDummy: boolean = false;

  validDate: any;
  account: any;
  userRole: any;
  customerTelephoneNumber: any;
  customerphoneNumber: any;
  customerfaxNumber: any;
  auditstring: string = 'login';

  getStartDate: any;
  getEndDate: any;
  monthInput: any;

  keyObj: any = {};
  tableAccount: any = [];

  constructor(private cdRef: ChangeDetectorRef, fb: FormBuilder, private datePipe: DatePipe, private excelService: ExcelService, private myAccountService: MyAccountService, private toastr: ToastrService, private customerService: AppService, private apiService: ApiService) {
    this.custId = sessionStorage.getItem("customerId");
    this.portalName = sessionStorage.getItem("ep-accountname");
    this.myUserName = sessionStorage.getItem("ep-username");
    this.myForms = fb.group({
      loginId: ["", [Validators.required, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,63}")]],
      businessEmailId: ["", [Validators.required, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,63}")]],
      loginIdAsBusinessId: [false],
      name: ["", Validators.required],
      mobilePhone: ["", Validators.minLength(8)],
      fax: ["", Validators.minLength(8)],
      telephone: ["", Validators.minLength(8)],
      departmentName: [""],
      telePhoneSearch: [""],
      faxSearch: [""],
      mobileSearch: [""],
    });
    this.changePasswordForm = fb.group({
      password: [null, Validators.compose([Validators.required])],
      oldPassword: [null, Validators.compose([Validators.required])]
    });
  }

  get f() {
    return this.myForms.controls;
  }
  
  ngAfterViewChecked() {
    if (this.reportData) {
      if (this.reportData._totalRecords === 0)
        this.reportData.currentPageReportTemplate = this.reportData.currentPageReportTemplate.replace("{first}", "0");
      else
        this.reportData.currentPageReportTemplate = this.reportData.currentPageReportTemplate.replace("0", "{first}");
    }

    if (this.table) {
      if (this.table._totalRecords === 0)
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace("{first}", "0");
      else
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace("0", "{first}");
    }
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.userDetails = JSON.parse(sessionStorage.getItem("userAccountDetails"));
    if (this.userDetails) {
      this.getMyAccDetails(this.userDetails.id);
      this.getmyAccAppsDetails(this.userDetails.id);
    }
    let sessionid = sessionStorage.getItem('ep-username');;
    this.inputObj = { "loginid": sessionid };
    this.onInitFun(this.inputObj);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getDepartmentDetails(this.custId);
      this.getCurrentMonthData('Current month');
    }, 2000);
  }

  onInitFun(obj) {
    this.myAccountService.getAccountDetails(obj).subscribe(res => {
      this.accountDetails = res.body;
    });
    let individualObj = { "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '' }
    this.myAccountService.getIndustryDetails(individualObj).subscribe(res => {
      setTimeout(() => {
        this.departmentArray = res.body.sort((t1, t2) => {
          let name1 = t1.name.toLowerCase();
          let name2 = t2.name.toLowerCase();
          if (name1 > name2) { return 1; }
          if (name1 < name2) { return -1; }
          return 0;
        });
      }, 5000);
    });
  }

  getmyAccAppsDetails(custId) {
    let individualObj = { "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '' }
    this.customerService.getmyAccAppsDetails(custId, individualObj).subscribe(data => {
      if (data) {
        if (data.body.message != "no apps available") {
          this.getInstanceDetails = data.body;
          if (this.getInstanceDetails.length == 0) {
          }
          this.customers = this.getInstanceDetails;
          this.getInstanceDetails.forEach(cust => {
            if (cust.ecdmProductSubscriptionUsers.length > 0) {
              cust.custRoles = cust.ecdmProductSubscriptionUsers[0].role
              cust.custStatus = cust.ecdmProductSubscriptionUsers[0].status;
            }
          })
        }
        else {
          this.getInstanceDetails = [];
        }
      }
    });
  }

  getDepartmentDetails(custId) {
    let individualObj = { "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '' }
    this.customerService.departmentDetails(custId, individualObj).subscribe(data => {
      if (data) {
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
  
  getMyAccDetails(id) {
    let individualObj = { "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '' }
    this.myAccountService.myAccDetails(id, individualObj).subscribe(data => {
      if (data) {
        this.getMyaccountDetails = data.body[0];
        this.fName = this.getMyaccountDetails.custRelatedParty[0].individual.firstName;
        this.validDate = this.getMyaccountDetails.custRelatedParty[0].validFrom;
        this.account = this.getMyaccountDetails.custRelatedParty[0].individual.status;
        this.userRole = this.getMyaccountDetails.custRelatedParty[0].role;

        this.myForms.controls['loginIdAsBusinessId'].setValue(this.getMyaccountDetails.custRelatedParty[0].individual.useLoginId && this.getMyaccountDetails.custRelatedParty[0].individual.useLoginId == 'true' ? true : false);
        this.getMyaccountDetails.custRelatedParty[0].individual.indvContactMedium.forEach((contact, index) => {
          if (contact.type == "loginid" && !this.loginBoolean) { this.loginBoolean = true; this.customerEmail = contact.characteristic.emailAddress; }
          if (contact.type == "contactEmailId") {
            this.myForms.controls['businessEmailId'].setValue(contact.characteristic.emailAddress);
          }

          if (contact.type == "fax" && !this.faxBoolean) {
            this.faxBoolean = true;
            this.customerfaxNumber = contact.characteristic.faxNumber;
            this.countryCodeFaxLabel = (contact.characteristic.countryCode) ? contact.characteristic.countryCode : "+65";
          }
          if (contact.type == "mobile" && !this.phoneBoolean) {
            this.phoneBoolean = true;
            this.customerphoneNumber = contact.characteristic.phoneNumber;
            this.countryCodeLabel = (contact.characteristic.countryCode) ? contact.characteristic.countryCode : "+65";
          }
          if (contact.type == "telephone" && !this.telephoneBoolean) {
            this.telephoneBoolean = true;
            this.customerTelephoneNumber = contact.characteristic.phoneNumber;
            this.countrycodeTelephoneLabel = (contact.characteristic.countryCode) ? contact.characteristic.countryCode : "+65";
          }
          if (index == (this.getMyaccountDetails.custRelatedParty[0].individual.indvContactMedium.length - 1)) {
            this.getContactArray();
          }
        });

        this.getMyaccountDetails.custRelatedParty[0].individual.indvCharacteristic.forEach(dept => {
          if (dept.name == "departmentId") {
            this.departmentName = dept.value;
            this.myForms.controls['departmentName'].setValue(dept.value);
          }
        });
      }
    });
  }

  getContactArray() {
    if (!this.loginBoolean) {
      this.loginBoolean = true;
      this.getMyaccountDetails.custRelatedParty[0].individual.indvContactMedium.push({
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
      this.getMyaccountDetails.custRelatedParty[0].individual.indvContactMedium.push({
        "type": "fax",
        "characteristic": {
          "faxNumber": this.customerfaxNumber,
          "countryCode": this.countryCodeFaxLabel
        }
      });
    }
    if (!this.phoneBoolean) {
      this.phoneBoolean = true;
      this.getMyaccountDetails.custRelatedParty[0].individual.indvContactMedium.push({
        "type": "mobile",
        "characteristic": {
          "phoneNumber": this.customerphoneNumber,
          "countryCode": this.countryCodeLabel
        }
      });
    }
    if (!this.telephoneBoolean) {
      this.telephoneBoolean = true;
      this.getMyaccountDetails.custRelatedParty[0].individual.indvContactMedium.push({
        "type": "telephone",
        "characteristic": {
          "phoneNumber": this.customerTelephoneNumber,
          "countryCode": this.countrycodeTelephoneLabel
        }
      });
    }
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

  clearForm() {
    this.myForms.reset();
  }

  editProfile() {
    this.submitted = true;
    if (this.myForms.invalid) {
      return;
    }
    this.getMyaccountDetails.custRelatedParty[0].individual.firstName = this.fName;
    this.getMyaccountDetails.custRelatedParty[0].individual.useLoginId = this.myForms.value.loginIdAsBusinessId == true ? 'true' : 'false';
    this.getMyaccountDetails.custRelatedParty[0].individual.indvContactMedium.forEach(contact => {
      if (contact.type == "contactEmailId") { contact.characteristic.emailAddress = this.customerEmail; }
      if (contact.type == "fax") { contact.characteristic.faxNumber = this.customerfaxNumber ? this.customerfaxNumber : null; contact.characteristic.countryCode = this.countryCodeFaxLabel }
      if (contact.type == "mobile") { contact.characteristic.phoneNumber = this.customerphoneNumber ? this.customerphoneNumber : null; contact.characteristic.countryCode = this.countryCodeLabel; }
      if (contact.type == "telephone") { contact.characteristic.phoneNumber = this.customerTelephoneNumber ? this.customerTelephoneNumber : null; contact.characteristic.countryCode = this.countrycodeTelephoneLabel }
      if (contact.type == "contactEmailId") {
        contact.characteristic.emailAddress = this.myForms.value.businessEmailId;
      }
    });

    // check whether the customer data haveing business email id or not 
    let businessEmailResult = this.getMyaccountDetails.custRelatedParty[0].individual.indvContactMedium.filter((contact: any) => {
      return contact.type == "contactEmailId";
    });

    if (businessEmailResult.length <= 0) {
      this.getMyaccountDetails.custRelatedParty[0].individual.indvContactMedium.push({
        "type": "contactEmailId",
        "characteristic": {
          "emailAddress": this.myForms.value.businessEmailId
        }
      })
    }

    if (this.getMyaccountDetails.custRelatedParty[0].individual.indvCharacteristic.length == 0) {
      this.getMyaccountDetails.custRelatedParty[0].individual.indvCharacteristic.push(
        { "name": "departmentId", "value": this.departmentName },
        { "name": "accessLevel", "value": "Essentials Only" },
        { "name": "appLaunching", "value": "New Browser Window" },
        { "name": "otpNotification", "value": "Email" },
        { "name": "passwordRecoveryMode", "value": "Email" },
        { "name": "passwordRecoveryEmail", "value": this.customerEmail },
        { "name": "passwordRecoveryMobile", "value": "" }
      )
    }
    else if (this.getMyaccountDetails.custRelatedParty[0].individual.indvCharacteristic.length > 0) {
      if (this.getMyaccountDetails.custRelatedParty[0].individual.indvCharacteristic.filter((value, index) => { return value.name === "departmentId" }).length > 0) {
        this.getMyaccountDetails.custRelatedParty[0].individual.indvCharacteristic.forEach(dept => {
          if (dept.name == "departmentId") {
            dept.value = this.myForms.value.departmentName ? this.myForms.value.departmentName.id : "";
          }
        });
      } else {
        this.getMyaccountDetails.custRelatedParty[0].individual.indvCharacteristic.push(
          { "name": "departmentId", "value": this.myForms.value.departmentName ? this.myForms.value.departmentName.id : "" }
        );
      }
    }
    else {
      this.getMyaccountDetails.custRelatedParty[0].individual.indvCharacteristic.forEach(dept => {
        if (dept.name == "departmentId") {
          dept.value = this.myForms.value.departmentName ? this.myForms.value.departmentName.id : "";
        }
      })
    }
    this.getCustomerDetailsData(this.getMyaccountDetails);
  }

  dataArray: any = [];
  getCustomerDetailsData(acDetails) {
    acDetails.individualId = (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '';
    this.customerService.updatenewmyAccAppsDetails(this.userDetails.id, acDetails).subscribe(data => {
      if (data.body) {
        this.myForms.markAsPristine();
        this.myForms.markAsUntouched();
        this.dataArray = data.body;
        this.toastr.success('Account Updated Successfully!');
        if (this.myUserName == this.myForms.value.loginId) {
          if (sessionStorage && sessionStorage['userAccountDetails']) {
            let userAccountDetails = JSON.parse(sessionStorage['userAccountDetails'])
            userAccountDetails.phoneno = this.myForms.value.mobilePhone ? this.myForms.value.mobilePhone : '';
            userAccountDetails.name = this.myForms.value.name ? this.myForms.value.name : '';
            sessionStorage.setItem('userAccountDetails', JSON.stringify(userAccountDetails));
          }
        }
      }
    });
  }

  changeData(event) {
  }

  resetChangePersonal() {
    this.myForms.markAsPristine();
    this.myForms.markAsUntouched();
    this.fName = this.getMyaccountDetails.custRelatedParty[0].individual.firstName;
    this.myForms.controls['loginIdAsBusinessId'].setValue(this.getMyaccountDetails.custRelatedParty[0].individual.useLoginId && this.getMyaccountDetails.custRelatedParty[0].individual.useLoginId == 'true' ? true : false);
    this.getMyaccountDetails.custRelatedParty[0].individual.indvContactMedium.forEach(contact => {
      if (contact.type == "loginid") { this.customerEmail = contact.characteristic.emailAddress; }
      if (contact.type == "fax") { this.customerfaxNumber = contact.characteristic.faxNumber; this.countryCodeFaxLabel = contact.characteristic.countryCode ? contact.characteristic.countryCode : '+65' }
      if (contact.type == "mobile") { this.customerphoneNumber = contact.characteristic.phoneNumber; this.countryCodeLabel = contact.characteristic.countryCode ? contact.characteristic.countryCode : '+65' }
      if (contact.type == "telephone") { this.customerTelephoneNumber = contact.characteristic.phoneNumber; this.countrycodeTelephoneLabel = contact.characteristic.countryCode ? contact.characteristic.countryCode : '+65' }
      if (contact.type == "loginid") { this.customerEmail = contact.characteristic.emailAddress; }
      if (contact.type == "contactEmailId") {
        this.myForms.controls['businessEmailId'].setValue(contact.characteristic.emailAddress);
      }
    });

    this.getMyaccountDetails.custRelatedParty[0].individual.indvCharacteristic.forEach(dept => {
      if (dept.name == "departmentId") {
        this.departmentName = dept.value
        this.departmentDetails.forEach(nameSet => {
          if (this.departmentName == nameSet.id) {
            this.myForms.controls['departmentName'].setValue(nameSet);
          }
        });
      }
    });
  }

  onSavePassword() {
    if (this.changePasswordForm.invalid) {
      return;
    }
    this.updateSuccess = false;
    let newPassword = (this.changePasswordForm.controls.password.value) ? this.changePasswordForm.controls.password.value : "";
    let encryptNewPswd = this.apiService.crypto.encrypt(newPassword);
    let oldPassword = (this.changePasswordForm.controls.oldPassword.value) ? this.changePasswordForm.controls.oldPassword.value : "";
    let encryptOldPswd = this.apiService.crypto.encrypt(oldPassword);
    let inputObj = {
      "newPassword": (encryptNewPswd) ? encryptNewPswd : "",
      "oldPassword": (encryptOldPswd) ? encryptOldPswd : "",
      "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
    };

    this.myAccountService.changePassword(inputObj).subscribe(res => {
      this.changePasswordForm.reset();
      let passwordResetDet = res.body;
      if (passwordResetDet.errorMessage) {
        this.toastr.error(passwordResetDet.errorMessage);
      } else {
        this.updateSuccess = true;
        setTimeout(() => {
          this.updateSuccess = false;
        }, 5000)
        this.toastr.success("Password is changed successfully");
      }
    });
  }

  discardPasswordChanges() {
    this.changePasswordForm.reset();
  }

  getLastThreeMonth(data) {
    this.monthInput = data;
    if (this.auditstring == 'login') {
      let d = new Date();
      let lastDay = new Date(d.getFullYear(), d.getMonth(), 0);
      let date = new Date();
      let firstDay = new Date(date.getFullYear(), date.getMonth() - 3, 1);

      this.getStartDate = firstDay;
      this.getEndDate = lastDay;
      this.getEndDate.setHours(23);
      this.getEndDate.setMinutes(59);

    }
  }

  getCurrentMonthData(data) {
    this.monthInput = data;
    if (this.auditstring == 'login') {
      let d = new Date();
      let sDate = "01";
      let sYear = new Date().getFullYear();
      let smonth = d.getMonth() + 1;
      let today = new Date();

      let firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      let startDate = sYear + "/" + sDate + "/" + smonth;
      let getEndDate = sYear + "/" + today + "/" + smonth;
      this.getStartDate = firstDay;
      this.getEndDate = today;
      this.getEndDate.setHours(23);
      this.getEndDate.setMinutes(59);
    }
  }

  getCustomMonth(data) {
    let today = new Date();
    this.monthInput = data;
    this.getStartDate = new Date();
    this.getEndDate = new Date();
    this.start = new Date(today.getFullYear(), today.getMonth(), 1);
    this.end = new Date();
  }

  getDater(data) {
    let sDate = data.startDate;
    this.getStartDate = sDate;
    let eDate = data.endDate;
    this.getEndDate = eDate;
    this.getEndDate.setHours(23);
    this.getEndDate.setMinutes(59);
  }


  getAccessDetails() {
    this.getAuditLogReport();
  }

  getAuditLogReport() {
    this.getReportDetails = false;
    this.auditReportTableData = [];
    let startData = this.getStartDate.getTime();
    let endData = this.getEndDate.getTime();

    this.apiService.loaderShow('loader', ' Generating audit log report...');
    let reqObj: any = { appList: [] };
    let obj = {
      "userList": [this.myUserName],
      "isPlatformAudit": false,
      "apiList": [],
      "appList": [],
      "appLevelPlatformModuleList": ["Platform Login"],
      "changedObjectNameList": [],
      "fromDate": startData,
      "toDate": endData,
      "eventType": "All",
      "customFilter": true,
      "accountName": this.portalName
    }
    this.apiService.invokePlatformServiceApi('/auditLog/getAudit', 'POST', obj).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        this.getReportDetails = true;
        this.auditReportTableData = res.body;
        this.auditLogScreen = "audit-log-table";
        this.logService = "Login Audit Report";
        this.tableAccount = [];
        this.loginAudit = 1;
        if (this.auditReportTableData.length > 0) {
          this.auditReportTableData.forEach(log => {
            log.changeSummary = log.changeSummary.replace("Login", "");
            log.formattedCreatedDate = this.datePipe.transform(new Date(log.createdDate), 'd MMM yyyy  HH:mm') + ' (GMT +8:00)';
          })
        }
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        console.error(err);
      }
    );
  }

  downloadPDF() {
    let doc = new jsPDF();
    let col = ["Date & Time", "Login ID", "Status"];
    let rows = [];
    this.auditReportTableData.forEach(audit => {
      rows.push([this.datePipe.transform(new Date(audit.createdDate), 'd MMM yyyy  HH:mm') + ' GMT + 8', audit.userName, audit.changeSummary]);
    });
    doc.autoTable(col, rows);
    doc.save(this.logService + '.pdf');
  }

  exportAsXLSXService(): void {
    this.excelService.exportAsExcelFile(this.tableAccount, this.logService);
  }

  exportAsXLSXLogin(): void {
    let xlObj = [];
    this.auditReportTableData.forEach((audit, index) => {
      xlObj.push({ "Date and Time": this.datePipe.transform(new Date(audit.createdDate), 'd MMM yyyy  HH:mm') + ' (GMT +8:00)', "Login ID": audit.userName, "Status": audit.changeSummary });
      if (index == (this.auditReportTableData.length - 1)) {
        this.excelService.exportAsExcelFile(xlObj, this.logService);
      }
    });
  }

  getAuditorService(audit) {
    // *** this function is not used for phase 1 so use return to blocking the function execution ****
    return;
    this.auditstring = audit;
    this.loginAudit = 0;
  }

  togglePassFieldType() {
    this.passFieldTextType = !this.passFieldTextType;
  }

  toggleNewPassFieldType() {
    this.newPassFieldTextType = !this.newPassFieldTextType;
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  createUser(key) {

  }
  resetChange() {

  }

  onSetBusinessId() {
    if (this.myForms.value.loginIdAsBusinessId == true) {
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