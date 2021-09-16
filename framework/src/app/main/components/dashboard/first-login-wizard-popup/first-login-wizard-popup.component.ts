import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { NgbModalConfig, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { FirstLoginWizardService } from './first-login-wizard.service';
import { ToastrService } from 'ngx-toastr';
import { AppService } from "src/app/app.service";
import { UtilService } from 'src/app/shared/util-service.service';
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from '@angular/router';
import _ from 'lodash';

@Component({
  selector: 'app-first-login-wizard-popup',
  templateUrl: './first-login-wizard-popup.component.html',
  styleUrls: ['./first-login-wizard-popup.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FirstLoginWizardPopupComponent implements OnInit {

  title = 'appBootstrap';
  completeStep1: boolean = false;
  completeStep2: boolean = false;
  completeStep3: boolean = false;
  completeStep4: boolean = false;
  custId: any;
  @Output() messageEvent = new EventEmitter<string>();
  //  department = [
  //     {"id": 1,"type":"department1"},
  //     {"id": 2,"type":"department2"},
  //     {"id": 3,"type":"department3"},
  //     {"id": 4,"type":"department4"}
  //   ]
  department: any = [];
  industryType: any = [];
  newsletter: any = [];
  // newsletter = [
  //   {

  //     "id": 1,
  //     "newsLetterType": "Communication & Collabaration"
  //   },
  //   {

  //     "id": 2,
  //     "newsLetterType": "Sales & Marketing"
  //   },
  //   {

  //     "id": 3,
  //     "newsLetterType": "Security & Protection"
  //   },
  //   {

  //     "id": 4,
  //     "newsLetterType": "Digitalisation"
  //   }
  // ]
  closeResult: string;
  @ViewChild('myDiv', { static: false }) myDiv: ElementRef<HTMLElement>;
  @ViewChild('myDivFinal', { static: false }) myDivFinal: ElementRef<HTMLElement>;
  public personalForms: FormGroup;
  public companyForms: FormGroup;
  companyLogoName: any;
  mediaSellersPermitFile: any;
  mediaSellersPermitString: any;
  companyDetail: any = [];
  customerDetail: any = [];
  tempPersonalInfo: any = [];
  tempCompanyInfo: any = [];
  selectedDepartmentname = "";
  selectedDepartmentId: any;
  selectedIndustryname = "";
  selectedIndustryId: any;
  imgURL: any = "";
  userAccountDetails: any = [];
  getCustomerDetails: any = {};

  constructor(private routes: Router, private elemRef: ElementRef, config: NgbModalConfig, private customerService: AppService,
    private modalService: NgbModal, private modalServiceNew: NgbModal, private _formBuilder: FormBuilder,
    private firstLoginWizardService: FirstLoginWizardService, private sanitizer: DomSanitizer, private toastr: ToastrService, private utilService: UtilService) {
    this.custId = sessionStorage.getItem('customerId');



    config.backdrop = 'static';
    config.keyboard = false;
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.firstLoginWizardService.getNewsLetter(individualObj).subscribe(res => {

      this.newsletter = res.body;
      this.addCheckboxes();
      this.personalForms.controls['newsletter'].disable();
    })

    // const controls = this.newsletter.map(c => new FormControl(false));

    this.personalForms = this._formBuilder.group({
      newsletter: new FormArray([]),
      contactEmail: [{ value: '', disabled: true }],
      department: [null, Validators.required],
      receiveInfo: [null]
    });
    this.companyForms = this._formBuilder.group({
      companyName: [null, Validators.required],
      industry: [null],
      companyId: [null, Validators.compose([Validators.pattern(/^[a-zA-Z0-9]+$/)])]
    })
  }

  private addCheckboxes() {
    this.newsletter.forEach(() => this.ordersFormArray.push(new FormControl(false)));
  }

  get ordersFormArray() {
    return this.personalForms.controls.newsletter as FormArray;
  }


  ngOnInit() {
    this.personalForms.controls['newsletter'].disable();
    this.companyDetail = JSON.parse(sessionStorage.getItem('companyDetails'));
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.firstLoginWizardService.getIndustryDetails(individualObj).subscribe(res => {

      this.industryType = res.body;
    });
    this.customerService.loginWizardDatapass.subscribe(
      data => {
        if (data == "true") {
          this.companyDetail = JSON.parse(sessionStorage.getItem('companyDetails'));
          let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
          this.firstLoginWizardService.getCustDetails(this.companyDetail.id, individualObj).subscribe(res => {
            this.customerDetail = res.body;
            this.department = this.customerDetail[0].departments;
          });
        }
      }
    );
    // this.firstLoginWizardService.getNewsLetter().subscribe(res => {

    //   this.newsletter = res.body;
    // })
    // this.triggerFalseClick();
    // this.onChanges();




  }


  ngAfterViewInit(): void {
    // if(sessionStorage.getItem('firstLoginWizard') == "true"){
    this.triggerFalseClick();
    //   sessionStorage.setItem('firstLoginWizard', 'false');
    // }
  }

  getCustomerDetail() {
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.firstLoginWizardService.getCustDetails(this.companyDetail.id, individualObj).subscribe(res => {
      this.customerDetail = res.body;
    });
  }

  triggerFalseClick() {
    let el: HTMLElement = this.myDiv.nativeElement;
    el.click();
  }
  open(content) {
    this.selectedIndex = 0;
    this.completeStep1 = false;
    this.completeStep2 = false;
    this.completeStep3 = false;
    this.completeStep4 = false;
    this.modalService.open(content, { windowClass: 'modal-wrapper' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.messageEvent.emit("popup-closed");
      this.changeHeaderLogo();
      this.isFirstLogin();
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  isFirstLogin() {
    this.userAccountDetails = JSON.parse(sessionStorage.getItem('userAccountDetails'));
    var obj = {
      "id": this.userAccountDetails.customerid,
      "isFirstLogin": 0
    }
    this.firstLoginWizardService.isFirstLogin(obj).subscribe(res => {
      this.userAccountDetails.isFirstLogin = false;
      sessionStorage.setItem('userAccountDetails', JSON.stringify(this.userAccountDetails));
    })
  }

  finalOpen(content) {
    this.modalServiceNew.open(content, { windowClass: 'final-modal-wrapper' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.messageEvent.emit("popup-closed");
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  changeHeaderLogo() {
    this.customerService.passHeaderLogogChange("true");
  }

  changeDepartment(e) {

    this.selectedDepartmentId = this.personalForms.controls.department.value;
    this.selectedDepartmentname = this.personalForms.controls.department.value.name;
    // this.department.forEach((val,i)=>{
    //   if(val.id == this.selectedDepartmentId){
    //     this.selectedDepartmentname = val.name;
    //   }
    // })


    if (this.personalForms.value.newsletter) {
      const selectedOrderIds = this.personalForms.value.newsletter
        .map((v, i) => v ? this.newsletter[i].id : null)
        .filter(v => v !== null);

      var tempCat = [];

      selectedOrderIds.forEach((val, i) => {
        this.newsletter.forEach((value, ind) => {
          if (val == value.id) {
            // tempCat.push(value);
            tempCat.push({ "newsLetterid": value.id, "value": value.newsLetterType })
          }
        })
      })

    }


  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  selectedIndex: number = 0;
  maxNumberOfTabs: number = 1;

  nextStep() {
    var maxNumberOfTabs = 3;
    if (this.selectedIndex == 0) {
      this.completeStep1 = true;
    } else if (this.selectedIndex == 1) {
      this.completeStep2 = true;
    } else if (this.selectedIndex == 2) {
      this.completeStep3 = true;
    } else if (this.selectedIndex == 3) {
      this.completeStep4 = true;
    }
    if (this.selectedIndex != maxNumberOfTabs) {
      this.selectedIndex = this.selectedIndex + 1;
    }

  }

  personalInforSave() {
    // this.tempPersonalInfo = _.cloneDeep(this.customerDetail);
    this.getCompanyName();
    var tempPersonalInfo = _.cloneDeep(this.customerDetail);
    var tempCat = [];
    if (this.personalForms.value.newsletter) {
      const selectedOrderIds = this.personalForms.value.newsletter
        .map((v, i) => v ? this.newsletter[i].id : null)
        .filter(v => v !== null);

      selectedOrderIds.forEach((val, i) => {
        this.newsletter.forEach((value, ind) => {
          if (val == value.id) {
            // tempCat.push(value);
            tempCat.push({ "newsLetterid": value.id, "value": value.newsLetterType })
          }
        })
      })

    }

    this.tempPersonalInfo = [
      {
        "id": tempPersonalInfo[0].id,
        "custRelatedParty": [{
          "id": tempPersonalInfo[0].custRelatedParty[0].id,
          "individual": {
            "id": tempPersonalInfo[0].custRelatedParty[0].individual.id
          }
        }]
      }
    ];

    // this.tempPersonalInfo[0].custRelatedParty[0].individual["indvCharacteristic"] = {"name":"department","value": this.selectedDepartmentname};
    if (this.personalForms.controls.receiveInfo.value) {
      if (this.personalForms.controls.contactEmail.value) {
        this.tempPersonalInfo[0].custRelatedParty[0].individual["indvContactMedium"] = [{ "type": "contactEmailid", "characteristic": { "emailAddress": this.personalForms.controls.contactEmail.value } }];
        // this.tempPersonalInfo[0].custRelatedParty[0].individual["indvContactMedium"]["characteristic"]["emailAddress"] = this.personalForms.controls.contactEmail.value;
        // this.tempPersonalInfo[0].custRelatedParty[0].individual["indvContactMedium"].push({ "characteristic" : {"emailAddress": this.personalForms.controls.contactEmail.value}});
      }
      if (tempCat.length > 0) {
        this.tempPersonalInfo[0].custRelatedParty[0].individual["individualNewsLetterConfig"] = tempCat;
      }
    }

    // this.tempPersonalInfo[0].custRelatedParty[0].individual.indvCharacteristic.push({"name":"department","value":"Finance"})
    let obj =
    {
      "id": "",
      "name": this.selectedDepartmentname,
      "Customer_id": this.custId,
      "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
    }

    this.firstLoginWizardService.saveDept(obj, this.custId).subscribe(res => {
      if (res) {
      
        this.tempPersonalInfo[0].custRelatedParty[0].individual["indvCharacteristic"] = [{ "name": "departmentId", "value": res.body.id }];
        this.firstLoginWizardService.saveCustDetail(this.tempPersonalInfo).subscribe(res => {
          if (this.selectedIndex == 1) {
            this.completeStep2 = true;
          }
          this.selectedIndex = this.selectedIndex + 1;
        });
      }
    })


    // this.firstLoginWizardService.saveCustDetail(this.tempPersonalInfo).subscribe(res => {


    //   if(this.selectedIndex == 1){
    //     this.completeStep2 = true;
    //   }
    //   this.selectedIndex = this.selectedIndex + 1;
    // })
  }


  getCustomerCompanyDetails: any = {};
  getCompanyNameStr: string = "";
  getCompanyName() {
    let obj = {
      id: this.custId
    }
    this.firstLoginWizardService.getCompanyId(obj).subscribe(res => {
      if (res) {
        this.getCustomerCompanyDetails = res.body;
      
        if (this.getCustomerCompanyDetails.name) {
          this.getCompanyNameStr = this.getCustomerCompanyDetails.name;
          this.companyForms.controls['companyName'].setValue(this.getCustomerCompanyDetails.name);
        }
       
      }
    });
  }

  companyStep() {
    var companyVal = this.companyForms.controls.companyName.value;
    var tempCompanyInfo = _.cloneDeep(this.customerDetail);

    this.tempCompanyInfo = [];
    this.tempCompanyInfo = [
      {
        "id": tempCompanyInfo[0].id,
        "companyid": this.companyForms.controls.companyId.value,
        "custCharacteristic": []
      }
    ];


    this.tempCompanyInfo[0].custCharacteristic.push({ "name": "CompanyName", "value": companyVal })

    if (this.companyForms.controls.industry.value) {
      this.tempCompanyInfo[0].custCharacteristic.push({ "name": "Industry", "value": this.selectedIndustryname, "valuetype": this.selectedIndustryId.id })
    }

    if (this.mediaSellersPermitString) {
      this.tempCompanyInfo[0]["document"] = { "documentContent": this.mediaSellersPermitString, "documentName": this.companyLogoName }
    }

    this.firstLoginWizardService.saveCustDetail(this.tempCompanyInfo).subscribe(res => {

      /* commenting for not in phase 1A Starts*/

      /* if(this.selectedIndex == 2){
          this.completeStep3 = true;
          }
         this.selectedIndex = this.selectedIndex + 1; 
      */

      /* commenting for not in phase 1A Ends*/

      /* code to match since security policy is not in phase 1A changes starts . kindly undo when security policy tab implemented*/
      this.modalService.dismissAll();
      let el: HTMLElement = this.myDivFinal.nativeElement;
      el.click();
      this.messageEvent.emit("popup-closed");

      /* code to match since security policy is not in phase 1A changes End */
    })
  }

  finalStep(event) {
    this.modalService.dismissAll();
    let el: HTMLElement = this.myDivFinal.nativeElement;
    el.click();
    this.messageEvent.emit("popup-closed");
  }

  launchDashboard() {
    this.modalServiceNew.dismissAll();
  }

  pageNavigateTo(page) {    
    let el: HTMLElement = this.myDivFinal.nativeElement;
    el.click();
    this.messageEvent.emit("popup-closed");
    this.modalService.dismissAll();
    if (page == 'my-account') {
      this.routes.navigate(["my-account"]);
    } 
    if (page == 'my-company') {
      this.routes.navigate(["my-company"]);
    }
  }


  skipStep(ind) {
    // to call personal detail api if we click the skio button 
    if(ind == 1) {
      this.getCompanyName();
      this.completeStep2 = true;
    }
    /* code to match since security policy is not in phase 1A changes starts. kindly undo when security policy tab implemented */
    if (ind == 2) {
      this.completeStep3 = true;
      this.modalService.dismissAll();
      let el: HTMLElement = this.myDivFinal.nativeElement;
      el.click();
      this.messageEvent.emit("popup-closed");
    }


    /* code to match since security policy is not in phase 1A changes Ends */
    var maxNumberOfTabs = 3;
    if (this.selectedIndex != maxNumberOfTabs) {
      this.selectedIndex = this.selectedIndex + 1;
    }
  }

  previousStep() {
    if (this.selectedIndex != 0) {
      this.selectedIndex = this.selectedIndex - 1;
    }
    if(this.selectedIndex == 1) {
      this.completeStep2 = false;
    }
    if(this.selectedIndex == 0) {
      this.completeStep1 = false;
      this.completeStep2 = false;
    }

  }

  onPersonalSubmit() {

  }

  emailVal(event) {
    if (event.target.value != "") {
      // this.personalForms.get('contactEmail').setValidators([Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]);
      //  this.personalForms.get('contactEmail').setValidators([Validators.pattern("^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$")]);
      this.personalForms.get('contactEmail').setValidators([Validators.pattern(this.customerService.emailIdValidatePattern)]);
    } else {
      this.personalForms.get('contactEmail').setValidators(null);
    }
    this.personalForms.get('contactEmail').updateValueAndValidity();
  }

  onChanges(): void {
    this.personalForms.get('contactEmail').valueChanges.subscribe(val => {
      if (val != "") {
        this.personalForms.get('contactEmail').setValidators([Validators.pattern(this.customerService.emailIdValidatePattern)]);
      } else {
        this.personalForms.get('contactEmail').setValidators(null);
      }
      this.personalForms.get('contactEmail').updateValueAndValidity();
    });
  }

  receiveInfo(event) {
    var inputChecked = this.personalForms.controls.receiveInfo.value;
    if (inputChecked == false) {
      this.personalForms.controls['contactEmail'].patchValue('');
      this.personalForms.controls['contactEmail'].disable();
      this.personalForms.controls['newsletter'].disable();
      this.personalForms.controls['newsletter'].setValue(
        this.personalForms.controls['newsletter'].value
          .map(value => false)
      );
    } else {
      this.personalForms.controls['contactEmail'].enable();
      this.personalForms.controls['newsletter'].enable();
    }
  }

  conpanyNameChange() {

  }

  changeIndustry(event) {

    this.selectedIndustryId = this.companyForms.controls.industry.value;
    this.selectedIndustryname = this.companyForms.controls.industry.value.name;
    // this.industryType.forEach((val,i)=>{
    //   if(val.id == this.selectedIndustryId){
    //     this.selectedIndustryname = val.name;
    //   }
    // })

  }


  public imagePicked(event, field) {
    if (event.target.files && event.target.files.length > 0 && event.target.files[0].name) {
      // File Type Validation
      var fileType = event.target.files[0].type;
      if (fileType && (fileType != "image/png" && fileType != "image/jpg" && fileType != "image/jpeg" && fileType != "image/svg+xml")) {
        this.toastr.error("File format is not supported");
        return true;
      }

      // File Name validation
      let isFileNameInvalid = this.utilService.fileNameValidation(event.target.files[0].name);
      if (isFileNameInvalid) {
        this.toastr.error("The file name cannot contain special characters [:\/*?|<>()$#@!~%+=;{}^|], also .");
        return true;
      }
    }

    // this.mediaCurrentId = field;
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      this.companyLogoName = file.name;
      // if (field == 1) {
      this.mediaSellersPermitFile = file;
      this.handleMediaInputChange(file);
      // }
    } else {
      this.toastr.error("No file selected");
    }
  }

  handleMediaInputChange(files) {
    var file = files;
    var pattern = /image-*/;
    var reader = new FileReader();
    if (!file.type.match(pattern)) {
      this.toastr.error("invalid format");
      return;
    }
    if (file.size > 1048576) {
      this.toastr.error("Please upload file less than 1MB");
      this.companyLogoName = "";
      return;
    }
    reader.onloadend = this._handleMediaReaderLoaded.bind(this);
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.imgURL = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
    }
  }

  _handleMediaReaderLoaded(e) {
    // this.imageSourceAddMedia = "";
    let reader = e.target;
    var base64result = reader.result.substr(reader.result.indexOf(",") + 1);
    // let id = this.mediaCurrentId;
    // switch (id) {
    //   case 1:
    this.mediaSellersPermitString = base64result;
    //     break;
    // }

    // let data = {
    //   documentName: this.prodMediaImageName,
    //   folderId: 34,
    //   folderName: "Documents/Axiata-Base/Catalog/IMAGE",
    //   documentContent: this.mediaSellersPermitString,
    // };


  }

}