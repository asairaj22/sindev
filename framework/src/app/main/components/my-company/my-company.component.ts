import { Component, OnInit, ElementRef, Input, ViewChild, HostListener } from '@angular/core';
import { Table } from "primeng/table";
import { ApiService } from "src/app/platform/util/api.service";
// import { AppModelService } from './../platform/util/app-model.service';
import { MyCompanyService } from './my-company.service';
import { AppService } from "src/app/app.service";
import { Customer } from "src/app/main/components/users/manage-users/manage-users";
import { ToastrService } from 'ngx-toastr';
import { ValidatorFn } from "@angular/forms";
import { ExcelService } from 'src/app/main/components/my-account/export-to-excel.service';
import { DomSanitizer } from "@angular/platform-browser";
import moment from 'moment';
import { JsonPipe } from '@angular/common';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DatePipe } from '@angular/common';
import { GlobalDataService } from 'src/app/main/services/global.service';
import { UtilService } from 'src/app/shared/util-service.service';
import { ChangeDetectorRef } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";

@Component({
  selector: 'app-my-company',
  templateUrl: './my-company.component.html',
  styleUrls: ['./my-company.component.css'],
  providers: [DatePipe]
})
export class MyCompanyComponent implements OnInit {
  mediaCurrentId: any;
  uploadImageName: any;
  companyDetails: any;
  departmentDetails: any;
  deptToDelete: any;
  communicationsConfig: any;
  communicationsList: any;
  paginationBoolean: boolean = false;
  newsLetterList: any;
  getReportDetails: boolean = false;
  newsLettrSwitch: boolean = false;
  newsLettrSwitchBackup: boolean = false;
  @ViewChild('reportContent', { static: false }) reportContent: ElementRef;
  // @Input() accessSetCurrent : string;
  primAdmin: any = [];
  currentMonthBoolean: boolean = true;
  primAdminBackup: any = [];
  licenseAdmin: any = [];
  filterNewsLetterList: any;
  licenseAdminBackup: any = [];
  userAdmin: any = [];
  userAdminBackup: any = [];
  endUser: any = [];
  endUserBackup: any = [];
  administratorDetails: any;
  enablePrimeTable: boolean = false;
  public myCompanyForms: FormGroup;
  public addDepartmentForm: FormGroup;
  public communicationsForm: FormGroup;
  selected: any;
  customers: Customer[];
  selectedCustomers: Customer[];
  loading: boolean = true;
  companyFormSubmitted = false;
  addDepartmentFormSubmitted = false;
  departmentArray: [];
  masterdataArray: any = [];
  companyTypeValue: string;
  orders: [];
  customerid: any;
  imgURL: any;
  getAccessSet = this.globalDataService.accessSet['subheader'];
  tempImgUrl: any;
  getCompanyLogo: any;
  imageChanged: boolean = false;
  notificationSwichChange: boolean = false;
  newsletterSwichChange: boolean = false;
  departmentName: string;
  departmentHeadname: string;
  isUpdateDepartment: boolean = false;
  departmentId: string;
  start: any;
  end: any;
  activeTab: string = '';
  isOpen: boolean = false;
  isOpenIndex: number;
  dummyID: boolean;

  @ViewChild("dt", { static: false }) table: Table;
  @ViewChild("deptTable", { static: false }) deptTable: Table;
  @ViewChild("adminTable", { static: false }) adminTable: Table;
  @ViewChild('closeAddDept', { static: false }) public closeAddDept: ElementRef;
  @ViewChild('adminTabButton', { static: false }) adminTabButton: ElementRef;
  @ViewChild('imageInput', { static: false }) imageInput: ElementRef;
  @ViewChild('reportData', { static: false }) reportData: Table;
  @ViewChild('dabledata', { static: false }) dabledata: Table;

  custId: any;
  portalName: any;
  constructor(private cdRef: ChangeDetectorRef,fb: FormBuilder, private excelService: ExcelService, private datePipe: DatePipe, private myCompanyService: MyCompanyService, private customerService: AppService, private toastr: ToastrService, private sanitizer: DomSanitizer, private apiService: ApiService, private globalDataService: GlobalDataService, private utilService: UtilService) {
    this.monthInput = 'Current month';
    this.custId = sessionStorage.getItem("customerId");
    this.portalName = sessionStorage.getItem("ep-accountname");

    this.myCompanyForms = fb.group({
      cname: ["", Validators.required],
      selectedIndValue: [""],
    });

    this.addDepartmentForm = fb.group({
      dname: ["", Validators.required],
      headname: [""]
    });
    // this.communicationsForm = fb.group({
    //   primAdmin1: ["", Validators.required],
    //   primAdmin2:["", Validators.required],
    //   primAdmin3:["", Validators.required],
    //   licenseAdmin1: ["", Validators.required],
    //   licenseAdmin2:["", Validators.required],
    //   licenseAdmin3:["", Validators.required],
    //   userAdmin1: ["", Validators.required],
    //   userAdmin2:["", Validators.required],
    //   userAdmin3:["", Validators.required],
    //   endUser1: ["", Validators.required],
    //   endUser2:["", Validators.required],
    //   endUser3:["", Validators.required],
    //   allowUsers:["", Validators.required],

    // });

  }

  ngOnInit() {
    this.onFetchCompanyDetails();
  }
  ngAfterViewChecked() {
  if(this.reportData){
   if (this.reportData._totalRecords === 0) 
     this.reportData.currentPageReportTemplate = this.reportData.currentPageReportTemplate.replace("{first}", "0"); 
   else 
        this.reportData.currentPageReportTemplate = this.reportData.currentPageReportTemplate.replace("0", "{first}"); 
  }

   if(this.deptTable){
   if (this.deptTable._totalRecords === 0) 
     this.deptTable.currentPageReportTemplate = this.deptTable.currentPageReportTemplate.replace("{first}", "0"); 
   else 
      this.deptTable.currentPageReportTemplate = this.deptTable.currentPageReportTemplate.replace("0", "{first}"); 
  }

   if(this.adminTable){
   if (this.adminTable._totalRecords === 0) 
     this.adminTable.currentPageReportTemplate = this.adminTable.currentPageReportTemplate.replace("{first}", "0"); 
      else 
        this.adminTable.currentPageReportTemplate = this.adminTable.currentPageReportTemplate.replace("0", "{first}"); 
       
  }
   if(this.dabledata){
   if (this.dabledata._totalRecords === 0)  
     this.dabledata.currentPageReportTemplate = this.dabledata.currentPageReportTemplate.replace("{first}", "0"); 
      else 
        this.dabledata.currentPageReportTemplate = this.dabledata.currentPageReportTemplate.replace("0", "{first}"); 
       
  } 
  this.cdRef.detectChanges();
    }

  onFetchCompanyDetails() {
    // Get Industry
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.myCompanyService.getIndustryDetails(individualObj).subscribe(res => {
      let industries = res.body;
      this.departmentArray = industries;
    });

    // Get Master Data
    this.myCompanyService.getMasterDetails(individualObj).subscribe(res => {
      let masterdata = res.body;
      this.masterdataArray = masterdata;
    });

    this.customerid = sessionStorage.getItem('customerId');
    let inputObj = { "id": this.customerid };
    this.myCompanyService.getCompanyDetails(inputObj).subscribe(res => {
      this.companyDetails = res.body;
      var fileFormat = 'png';
      if(this.companyDetails.dmsDocumentName) {
        fileFormat = this.companyDetails.dmsDocumentName.split(".")[1].toLowerCase();
        fileFormat = fileFormat == 'svg' ? 'svg+xml' : fileFormat;
      }
      this.tempImgUrl = this.sanitizer.bypassSecurityTrustUrl(`data:image/`+ fileFormat + `;base64, ${this.companyDetails.companyLogo}`);
      if (this.companyDetails.companyLogo) {
        this.imgURL = this.sanitizer.bypassSecurityTrustUrl(`data:image/`+ fileFormat + `;base64, ${this.companyDetails.companyLogo}`);
      }
      this.companyTypeValue = '';
      if (this.companyDetails.companyIdType && this.masterdataArray && this.masterdataArray.length > 0) {
        var compTypeId = this.companyDetails.companyIdType;
        var getCompanyDetail = this.masterdataArray.find(function (val) { return val.parameterValue_id == compTypeId; });
        if (getCompanyDetail && getCompanyDetail.parameterName) {
          this.companyTypeValue = getCompanyDetail.parameterName;
        }
      }
      if (this.companyDetails.documentName) {
        this.uploadImageName = this.companyDetails.documentName;
      }

      this.setData();

    });
    this.getCustomerEmailList(this.customerid);

    this.customerService.getCustomersLarge().then((customers) => {
      this.customers = customers;
      this.loading = false;
    });

    /*/Intialising first report selection//*/
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getCurrentMonthData('Current month');
    }, 2000);

  }

  setData() {
    this.myCompanyForms.controls['cname'].setValue(this.companyDetails.name);
    this.companyDetails.selectedReport = "Order Summary";

    // Find Industry
    var getIndustryData = {};
    var getIndustryValue = this.companyDetails.industry ? this.companyDetails.industry.valuetype : '';
    getIndustryData = this.departmentArray.find(function (val: any) { return val.id == getIndustryValue; });
    this.myCompanyForms.controls['selectedIndValue'].setValue(getIndustryData);
  }

  public setIndustry($event) {
    let selectedInd = $event.value;
    this.myCompanyForms.controls['selectedIndValue'].setValue(selectedInd);

  }

  public imagePicked(event, field) {    
    if (event.target.files && event.target.files.length > 0 && event.target.files[0].name) {
      // File Validation
      var fileType = event.target.files[0].type;
      if (fileType && (fileType != "image/png" && fileType != "image/jpg" && fileType != "image/jpeg" && fileType != "image/svg+xml")) {
        // checking file format
        this.toastr.error("File format is not supported");
        return true;
      } 

      // File Name validation
      let isFileNameInvalid = this.utilService.fileNameValidation(event.target.files[0].name);
      if (isFileNameInvalid) {
        this.toastr.error("The file name cannot contain special characters [:\/*?|<>()$#@!~%+=;{}^|], also .");
        this.imageInput.nativeElement.value = '';
        return true;
      }
    }

    this.mediaCurrentId = field;
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      if (file.size > (1 * 1024 * 1024)) {
        // checking for greater than 1 MB
        this.toastr.error("File exceeds 1MB. Please upload a file less than 1MB");
      }
      else {
        this.uploadImageName = file.name;
        var reader = new FileReader();
        // this.imagePath = files;
        reader.readAsDataURL(file);
        reader.onloadend = this._handleMediaReaderLoaded.bind(this);
        reader.onload = (_event) => {
          this.imgURL = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
          this.imageChanged = true;
        }
      }

    } else {
      this.uploadImageName = "No file selected";
    }
    this.imageInput.nativeElement.value = '';    
  }

  _handleMediaReaderLoaded(e) {
    let reader = e.target;
    var base64result = reader.result.substr(reader.result.indexOf(",") + 1);
    // this.companyDetails.companyLogo = base64result;  
    this.getCompanyLogo = base64result;

  }
  public getDepartments() {
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.myCompanyService.getDepartments(this.customerid, individualObj).subscribe(res => {
      this.paginationBoolean = true;
      this.departmentDetails = res.body;
      if (this.departmentDetails.length == 0) {
        this.paginationBoolean = false;
      }
    });

  }
  adminPageBoolean: boolean = false;
  public getAdministrators() {
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.myCompanyService.getAdministrators(this.customerid, individualObj).subscribe(res => {
      this.adminPageBoolean = true;
      this.administratorDetails = res.body;
      if (this.administratorDetails.length == 0) {
        this.adminPageBoolean = false;
      }
    });

  }
  public getCommunications() {
    this.notificationSwichChange = false;
    this.newsletterSwichChange = false;
    this.getNotificationsConfig();
    this.getNewsLetterList();

  }
  public getNewsLetterList() {
    let newsLettrInput = {
      "Customer_id": this.customerid,
      "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
    };
    this.myCompanyService.getNewsLetter(newsLettrInput, this.customerid).subscribe(res => {
      this.newsletterSwichChange = false;
      this.newsLetterList = res.body;
      this.filterNewsLetterList = this.newsLetterList.filter((item) => {
        return (item.name && item.name == "Allow users to opt-in to marketing newsletters");
      });
      if (this.filterNewsLetterList.length > 0) {
        this.newsLettrSwitch = JSON.parse(this.filterNewsLetterList[0].value);
        this.newsLettrSwitchBackup = JSON.parse(JSON.stringify(this.newsLettrSwitch));
      }
      else {
        this.newsLettrSwitch = false;
      }

    });
  }
  public getNotificationsConfig() {
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.myCompanyService.getNotificationsList(individualObj).subscribe(res => {
      this.notificationSwichChange = false;
      this.communicationsList = res.body;
      let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
      this.myCompanyService.getNotificationsConfig(this.customerid, individualObj).subscribe(res => {
        this.communicationsConfig = res.body;
        this.communicationsList.forEach((notficationType) => {
          let primAdminArr = this.communicationsConfig.filter((primItem) => {
            return (primItem.role && primItem.role == "Primary Administrator" && notficationType.id == primItem.customerNotificationId);
          });
          let licenseAdminArr = this.communicationsConfig.filter((licenseItem) => {
            return (licenseItem.role && licenseItem.role == "License Administrator" && notficationType.id == licenseItem.customerNotificationId);
          });
          let userAdminArr = this.communicationsConfig.filter((userAdminItem) => {
            return (userAdminItem.role && userAdminItem.role == "User Administrator" && notficationType.id == userAdminItem.customerNotificationId);
          });
          let endUserArr = this.communicationsConfig.filter((endUserItem) => {
            return (endUserItem.role && endUserItem.role == "End User" && notficationType.id == endUserItem.customerNotificationId);
          });
          if (primAdminArr.length == 0) {
            this.primAdmin[notficationType.id] = false;
          }
          if (licenseAdminArr.length == 0) {
            this.licenseAdmin[notficationType.id] = false;
          }
          if (userAdminArr.length == 0) {
            this.userAdmin[notficationType.id] = false;
          }
          if (endUserArr.length == 0) {
            this.endUser[notficationType.id] = false;
          }
          ///looping through config array
          this.communicationsConfig.forEach((configType) => {
            if (configType.role) {
              if (configType.role == "Primary Administrator") {
                if (configType.status) {
                  this.primAdmin[configType.customerNotificationId] = true;
                }
                else {
                  this.primAdmin[configType.customerNotificationId] = false;
                }
              }
              else if (configType.role == "End User") {
                if (configType.status) {
                  this.endUser[configType.customerNotificationId] = true;
                }
                else {
                  this.endUser[configType.customerNotificationId] = false;
                }
              }
              else if (configType.role == "User Administrator") {
                if (configType.status) {
                  this.userAdmin[configType.customerNotificationId] = true;
                }
                else {
                  this.userAdmin[configType.customerNotificationId] = false;
                }
              }
              else if (configType.role == "License Administrator") {
                if (configType.status) {
                  this.licenseAdmin[configType.customerNotificationId] = true;
                }
                else {
                  this.licenseAdmin[configType.customerNotificationId] = false;
                }
              }
            }
          });
        });

        ///backup for discarding changes
        this.primAdminBackup = JSON.parse(JSON.stringify(this.primAdmin));
        this.licenseAdminBackup = JSON.parse(JSON.stringify(this.licenseAdmin));
        this.userAdminBackup = JSON.parse(JSON.stringify(this.userAdmin));
        this.endUserBackup = JSON.parse(JSON.stringify(this.endUser));

      });
    });
  }
  public saveNewsLetterList() {
    let saveinputObj = {
      "id": (this.filterNewsLetterList.length > 0 && this.filterNewsLetterList[0].id) ? this.filterNewsLetterList[0].id : '',
      "name": "Allow users to opt-in to marketing newsletters",
      "value": this.newsLettrSwitch.toString(),
      "Customer_id": this.customerid,
      "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
    };
    this.myCompanyService.saveNewsLetterList(saveinputObj).subscribe(res => {
      this.toastr.success("News Letter Notifications saved succesfully");
      this.getNewsLetterList();

    });

  }
  public discardNewsLetterList() {
    this.newsLettrSwitch = JSON.parse(JSON.stringify(this.newsLettrSwitchBackup));
  }
  public saveNotificationsConfig() {
    let saveObjArr = [];
    let communicationsConfigArr = new Array;
    communicationsConfigArr = JSON.parse(JSON.stringify(this.communicationsConfig));
    this.communicationsList.forEach((notficationType) => {
      let primAdminArr = this.communicationsConfig.filter((configType) => {
        return (configType.role && configType.role == "Primary Administrator" && notficationType.id == configType.customerNotificationId);
      });
      let licenseAdminArr = this.communicationsConfig.filter((configType) => {
        return (configType.role && configType.role == "License Administrator" && notficationType.id == configType.customerNotificationId);
      });
      let userAdminArr = this.communicationsConfig.filter((configType) => {
        return (configType.role && configType.role == "User Administrator" && notficationType.id == configType.customerNotificationId);
      });
      let endUserArr = this.communicationsConfig.filter((configType) => {
        return (configType.role && configType.role == "End User" && notficationType.id == configType.customerNotificationId);
      });
      //looping through config array
      communicationsConfigArr.forEach((configType) => {
        if (configType.role == "Primary Administrator") {
          if (this.primAdmin[configType.customerNotificationId]) {
            configType.status = true;
          }
          else {
            configType.status = false;
          }
        }
        else if (configType.role == "License Administrator") {
          if (this.licenseAdmin[configType.customerNotificationId]) {
            configType.status = true;
          }
          else {
            configType.status = false;
          }
        }
        else if (configType.role == "User Administrator") {
          if (this.userAdmin[configType.customerNotificationId]) {
            configType.status = true;
          }
          else {
            configType.status = false;
          }
        }
        else if (configType.role == "End User") {
          if (this.endUser[configType.customerNotificationId]) {
            configType.status = true;
          }
          else {
            configType.status = false;
          }
        }
      });
      if (primAdminArr.length == 0) {
        if (this.primAdmin[notficationType.id]) {
          communicationsConfigArr.push({
            "id": "",
            "customerNotificationId": notficationType.id,
            "Customer_id": this.customerid,
            "role": "Primary Administrator",
            "status": true,
            "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
          });
        }
        else {
          communicationsConfigArr.push({
            "id": "",
            "customerNotificationId": notficationType.id,
            "Customer_id": this.customerid,
            "role": "Primary Administrator",
            "status": false,
            "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
          });
        }
      }
      if (licenseAdminArr.length == 0) {
        if (this.licenseAdmin[notficationType.id]) {
          communicationsConfigArr.push({
            "id": "",
            "customerNotificationId": notficationType.id,
            "Customer_id": this.customerid,
            "role": "License Administrator",
            "status": true,
            "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
          });
        }
        else {
          communicationsConfigArr.push({
            "id": "",
            "customerNotificationId": notficationType.id,
            "Customer_id": this.customerid,
            "role": "License Administrator",
            "status": false,
            "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
          });
        }
      }
      if (userAdminArr.length == 0) {
        if (this.userAdmin[notficationType.id]) {
          communicationsConfigArr.push({
            "id": "",
            "customerNotificationId": notficationType.id,
            "Customer_id": this.customerid,
            "role": "User Administrator",
            "status": true,
            "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
          });
        }
        else {
          communicationsConfigArr.push({
            "id": "",
            "customerNotificationId": notficationType.id,
            "Customer_id": this.customerid,
            "role": "User Administrator",
            "status": false,
            "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
          });
        }
      }
      if (endUserArr.length == 0) {
        if (this.endUser[notficationType.id]) {
          communicationsConfigArr.push({
            "id": "",
            "customerNotificationId": notficationType.id,
            "Customer_id": this.customerid,
            "role": "End User",
            "status": true,
            "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
          });
        }
        else {
          communicationsConfigArr.push({
            "id": "",
            "customerNotificationId": notficationType.id,
            "Customer_id": this.customerid,
            "role": "End User",
            "status": false,
            "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
          });
        }
      }
    });
    ////save notifications config API
    
    this.myCompanyService.saveCustomerNotifications(communicationsConfigArr).subscribe(res => {

      this.toastr.success("Notifications saved successfully");
      this.getNotificationsConfig();

    });
  }

  public discardNotificationConfig() {
    this.primAdmin = JSON.parse(JSON.stringify(this.primAdminBackup));
    this.licenseAdmin = JSON.parse(JSON.stringify(this.licenseAdminBackup));
    this.userAdmin = JSON.parse(JSON.stringify(this.userAdminBackup));
    this.endUser = JSON.parse(JSON.stringify(this.endUserBackup));
  }
  public deleteDepartmentEntry(index) {
    // delete(this.departmentDetails[index]);
    let id = this.departmentDetails[index].id;
    this.deptToDelete = this.departmentDetails[index].name;
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.myCompanyService.deleteDepartments(this.customerid, id, individualObj).subscribe(res => {
      this.toastr.success("Department " + this.deptToDelete + " deleted successfully");
      this.getDepartments();

    });


  }

  @HostListener('document:click')
  clickout() {
    if (this.dummyID != this.isOpen) {
      this.dummyID = this.isOpen;
    } else {
      this.dummyID = false;
      this.isOpen = false;
    }
  }

  public toogleOverlay(index) {
    this.isOpenIndex = index;
    return this.isOpen = !this.isOpen;
  }

  dateRangeCreated($event) {
  }

  switchChange($event) {
    this.notificationSwichChange = true;
  }

  switchNewsLetterChange($event) {
    this.newsletterSwichChange = true;
  }

  public reportTypeChange($event) {
    this.companyDetails.selectedReport = $event.target.getAttribute('reportname');
  }


  onCompanyFormSubmit() {
    this.companyFormSubmitted = true;
    // stop here if form is invalid
    if (this.myCompanyForms.invalid) {
    }

    // display form values on success
    else {
      // If industry is not selected, created empty obj to avoid errors
      if (!this.myCompanyForms.controls.selectedIndValue.value) {
        this.myCompanyForms.controls['selectedIndValue'].setValue({});
      }
      let saveinputObj = {
        "id": this.companyDetails.id,
        "name": this.myCompanyForms.controls.cname.value,
        "companyIdType": this.companyDetails.companyIdType,
        // "companyLogo": this.companyDetails.companyLogo,
        "companyLogo": this.getCompanyLogo,
        "documentName": this.uploadImageName,
        "companyId": this.companyDetails.companyId,
        "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '',
        //"industry": this.myCompanyForms.controls.selectedIndValue.value,
        "industry": {
          "valuetype": this.myCompanyForms.controls.selectedIndValue.value.id,
          "Customer_id": this.companyDetails.industry ? this.companyDetails.industry.Customer_id : undefined,
          "name": "Industry",
          "id": this.companyDetails.industry ? this.companyDetails.industry.id : undefined,
          "value": this.myCompanyForms.controls.selectedIndValue.value.name
        },
        "paymentMethod": this.companyDetails.paymentMethod,
        "billingAccountNumber": this.companyDetails.billingAccountNumber,
        "department": [
          {
            "id": "",
            "name": this.myCompanyForms.controls.selectedIndValue.value,
            "DtoCustomer_id": ""
          }
        ]
      }
      this.myCompanyService.saveCompanyDetails(saveinputObj).subscribe(res => {
        this.myCompanyForms.markAsPristine();
        this.myCompanyForms.markAsUntouched();
        this.imageChanged = false;
        sessionStorage.removeItem("compLogo");
        this.customerService.passHeaderLogogChange("true");
        sessionStorage.setItem("compLogo", this.imgURL);
        this.customerService.popupComponent.next(this.custId);
        this.onFetchCompanyDetails();
        this.toastr.success("Company Information is saved successfully");
        if (sessionStorage && sessionStorage['userAccountDetails']) {
            let userAccountDetails = JSON.parse(sessionStorage['userAccountDetails'])
            userAccountDetails.companyName = this.myCompanyForms.value.cname ? this.myCompanyForms.value.cname : '';
            sessionStorage.setItem('userAccountDetails', JSON.stringify(userAccountDetails));
          }
      }, err => {
        this.toastr.error("Failed");
        this.resetCompanyChange();
      });


    }

  }

  resetCompanyChange() {
    this.companyFormSubmitted = false;
    this.myCompanyForms.markAsPristine();
    this.myCompanyForms.markAsUntouched();
    this.imageChanged = false;
    this.imgURL = this.tempImgUrl;
    this.getCompanyLogo = this.companyDetails.companyLogo;
    this.uploadImageName = "";
    this.setData();
  }

  onAddDepartment() {
    this.addDepartmentFormSubmitted = true;


    // stop here if form is invalid
    if (this.addDepartmentForm.invalid) {

    }
    else {
      let saveinputObj = {
        "id": this.departmentId ? this.departmentId : "",
        "name": this.addDepartmentForm.controls.dname.value,
        "departmentHead": this.addDepartmentForm.controls.headname.value ? this.addDepartmentForm.controls.headname.value : null,
        "usercount": "",
        "Customer_id": this.customerid,
        "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
      }
      this.myCompanyService.createDepartments(this.customerid, saveinputObj).subscribe(res => {
        if (res && res.body) {

          if (res.body.errormsg == 'Duplicate') {
            this.toastr.error("Department name already exists");
          } else {
            if (this.isUpdateDepartment) {
              this.toastr.success("Department " + this.addDepartmentForm.controls.dname.value + " is updated successfully");
              // formDirective.resetForm();
              this.addDepartmentForm.reset();
            } else {
              this.toastr.success("Department " + this.addDepartmentForm.controls.dname.value + " is added successfully");
              // formDirective.resetForm();
              this.addDepartmentForm.reset();
            }
            this.getDepartments();
            this.closeAddDept.nativeElement.click();
          }

        }
        //       alert(
        //   "SUCCESS!! :-)\n\n" + JSON.stringify(this.myCompanyForms.value, null, 4)
        // );


      });


    }

  }
  onAddNewDepartment() {
    this.departmentName = "";
    this.departmentHeadname = "";
    this.departmentId = "";
    this.isUpdateDepartment = false;
    this.addDepartmentFormSubmitted = false;

  }
  onDepartmentNameClicked(data: any) {

    this.isUpdateDepartment = true;
    this.departmentId = data.id;
    this.departmentName = data.name;
    this.departmentHeadname = data.departmentHead;

  }
  onModelClose() {
    this.departmentName = "";
    this.departmentHeadname = "";
    this.departmentId = "";
    this.isUpdateDepartment = false;
    this.addDepartmentFormSubmitted = false;
    this.addDepartmentForm.reset();
  }


  onChangeActiveTab(tabName) {
    if (tabName == 'tab3') {
      let el: any = this.adminTabButton.nativeElement;
      el.click();
      this.getAdministrators();
    }
    else {
      this.activeTab = '';
    }
  }




  // code for reports tab 
  auditstring: string = 'service';
  auditReportTableData: any;
  auditReportDetailsData: any;
  getStartDate: any;
  getEndDate: any;
  monthInput: any;
  loginAudit: number = 0;
  chooseLoginId: string;
  logService: string;
  auditLogScreen: string = '';
  emailList: any = [];
  auditPaginatorBoolean: boolean = true;
  tableAccountBoolean: boolean = true;

  getLastThreeMonth(data) {
    this.monthInput = data;
    this.currentMonthBoolean = false;
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
    this.currentMonthBoolean = true;
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
    this.currentMonthBoolean = false;
    this.monthInput = data;
    this.getStartDate = new Date();
    this.getEndDate = new Date();
    let today = new Date();
    this.start = new Date(today.getFullYear(), today.getMonth(), 1);
    this.end = new Date();
  }


  emailIdArray: any = [];
  OnChange(ev) {
    this.emailIdArray = [];

    this.chooseLoginId = ev.value.emailAddress;
    if (ev.value.name != 'All Users') {
      this.emailIdArray.push(this.chooseLoginId);
    }
    else if (ev.value.name == 'All Users') {
      this.emailList.forEach(list => {
        this.emailIdArray.push(list.emailAddress);
      });
    }
 

  }



  getDater(data) {
    let sDate = data.startDate;
    this.getStartDate = sDate;

    let eDate = data.endDate;
    this.getEndDate = eDate;
   
    this.getEndDate.setHours(23);
    this.getEndDate.setMinutes(59);
  }


  keyObj: any = {};
  tableAccount: any = [];
  getAccessDetails() {

    if (this.auditstring == "service") {
      if (this.monthInput != '') {
        if (this.monthInput != 'custom') {
          this.keyObj = {
            "key": this.monthInput,
            "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
          }
        }
        else {
          this.keyObj = {
            "startDate": moment(this.getStartDate).format('YYYY-MM-DD'),
            "EndDate": moment(this.getEndDate).format('YYYY-MM-DD'),
            "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
          }
        }

        this.customerService.getAccessDetails(this.custId, this.keyObj).subscribe(data => {
          if (data) {
            this.tableAccountBoolean = true;
            this.tableAccount = data.body;
            this.loginAudit = 2;
            if (this.tableAccount.length == 0) {
              this.tableAccountBoolean = true;
            }
            if (this.tableAccount.length > 0) {
              this.tableAccount.forEach(log => {
                if (log.orderdate) {
                  log.orderdate = this.datePipe.transform(log.orderdate, 'd MMM yyyy HH:mm') + ' (GMT +8:00)';
                }
                log.quantity = 1;
              })
            }
            this.logService = "Order Summary";

          }
        })
      }
      else {
        this.toastr.warning("Please select Timeline");
        return false;
      }
    }
    else if (this.auditstring == "login") {
      this.getAuditLogReport(true);
    }
  }


  getAuditLogReport(isCustomFilter) {
    let startData = this.getStartDate.getTime();
    let endData = this.getEndDate.getTime();
    this.getReportDetails = false;
   
    this.apiService.loaderShow('loader', ' Generating audit log report...');
    let reqObj: any = { appList: [] };
    let obj = {
      "userList": this.emailIdArray,
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
        this.auditPaginatorBoolean = true;
        this.apiService.loaderHide('loader');
       
        res.body = res.body.sort(this.customeSort);
     
        this.auditReportTableData = res.body;
        this.auditLogScreen = "audit-log-table";
        this.logService = "Login Audit Report";
        this.getReportDetails = true;
        this.tableAccount = [];
        this.loginAudit = 1;
        if (this.auditReportTableData.length > 0) {
          this.auditReportTableData.forEach(log => {
            log.changeSummary = log.changeSummary.replace("Login", "");
            log.formattedCreatedDate = this.datePipe.transform(log.createdDate, 'd MMM yyyy HH:mm') + ' (GMT +8:00)'; 
          });
        }
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        console.error(err);
      }

    );
  }
  customeSort(a, b) {
    if (a.createdDate === b.createdDate)
      return a;
    else
      return a.createdDate > b.createdDate ? -1 : 1;//descending sort based on createdDate
  }
  downloadOrderPDF() {
    let doc = new jsPDF('l', 'mm', [1300, 400]);
    let col = ["Order Date & Time", "Order No", "Order Type", "Offer Name", "Subscription ID", "Quantity", "Order By"];

    let rows = [];

    this.tableAccount.forEach(order => {
      rows.push([this.datePipe.transform(new Date(order.orderdate), 'd MMM yyyy  HH:mm') + ' (GMT +8:00)', order.orderno, order.orderType, order.offername, order.saasId, order.quantity, order.orderby]);
    });

    doc.autoTable(col, rows);
    doc.save(this.logService + '.pdf');

  }

  downloadPDF() {
    //  this.auditPaginatorBoolean = false;
    //  this.tableAccountBoolean = false;
    //  setTimeout(() =>{
    //   const doc = new jsPDF();
    //   const specialElementHandlers = {
    //     '#editor': function (element, renderer) {
    //       return true;
    //     }
    //   };

    //   const content = this.reportContent.nativeElement;

    //   doc.fromHTML(content.innerHTML, 15, 15, {
    //     'width': 190,
    //     'elementHandlers': specialElementHandlers
    //   });

    //   doc.save(this.logService + '.pdf');
    //   },2000);

    //   setTimeout(() => {
    //     this.auditPaginatorBoolean = true;
    //     this.tableAccountBoolean = true;
    //   },3000);

    let doc = new jsPDF();
    let col = ["Date & Time", "Login ID", "Status"];

    let rows = [];

    this.auditReportTableData.forEach(audit => {
      rows.push([this.datePipe.transform(new Date(audit.createdDate), 'd MMM yyyy  HH:mm') + ' (GMT +8:00)', audit.userName, audit.changeSummary]);
    });

    doc.autoTable(col, rows);
    doc.save(this.logService + '.pdf');


  }

  exportAsXLSXService(): void {
    // this.excelService.exportAsExcelFile(this.tableAccount, this.logService);
    let xls = [];
    this.tableAccount.forEach(xl => {
      xls.push({ "Order Date & Time": this.datePipe.transform(new Date(xl.orderdate), 'd MMM yyyy  HH:mm') + ' (GMT +8:00)', "Order No": xl.orderno, "Order Type": xl.orderType, "Offer Name": xl.offername, "Subscription ID": xl.saasId, "Quantity": 1, "Order By": xl.orderby })

    });
  
    setTimeout(() => {
      this.excelService.exportAsExcelFile(xls, this.logService);
    });
  }

  exportAsXLSXLogin(): void {
    let xlObj = [];
    this.auditReportTableData.forEach((audit, index) => {
      xlObj.push({ "Date and Time": this.datePipe.transform(new Date(audit.createdDate), 'd MMM yyyy  HH:mm') + ' (GMT +8:00)', "Login ID": audit.userName, "Status": audit.changeSummary });
      if (index == (this.auditReportTableData.length - 1)) {
        this.excelService.exportAsExcelFile(xlObj, this.logService);
      }
    });
   

    // this.excelService.exportAsExcelFile(this.auditReportTableData, this.logService);
  }

  getAuditorService(audit) {

    this.auditstring = audit;
    this.loginAudit = 0;
    this.currentMonthBoolean = true;
    this.getCurrentMonthData('Current month');
  }

  getCustomerEmailList(custId) {
    let obj = {
      "id": custId,
      "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
    }
    this.customerService.getCustomerEmailList(obj).subscribe(data => {
      if (data) {

        this.emailList = data.body;
        this.emailList.unshift({ "name": "All Users" });
        this.emailList.forEach(list => {
          if (list.emailAddress) {
            this.emailIdArray.push(list.emailAddress);
          }
        });
      }
    });
  }

}