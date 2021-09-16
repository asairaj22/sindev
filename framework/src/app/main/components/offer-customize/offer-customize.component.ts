import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input';
import { CommonService } from './offer-customize.service';
import { IsLoadingService } from "@service-work/is-loading";
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ToastrService } from 'ngx-toastr';
const FileSaver = require('file-saver');
import { AppService } from "src/app/app.service";
import * as CountryCodes from "src/app/countryCode.json";
import moment from 'moment';

declare var $: any;

@Component({
  selector: 'app-offer-customize',
  templateUrl: './offer-customize.component.html',
  styleUrls: ['./offer-customize.component.css'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class OfferCustomizeComponent implements OnInit, OnDestroy {

  // firstFormGroup: FormGroup;
  // secondFormGroup: FormGroup;
  otpProcess: boolean = false;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.Singapore];
  radioSelected: boolean = true;
  public myCustomizeForms: FormGroup;
  public myBillingForms: FormGroup;
  greenOrBrownField = "";
  createForm: boolean = true;
  billingTab = "manual-tab";
  dataid;
  cartItemId: any;
  paramId;
  productLogo;
  customerAgreePdf;
  productDetailData: any = [];
  productDetailSpecData: any = [];
  prodAmount: any;
  prodOfferName: any;
  _showpromoMsg: false;

  cloudType: any;
  shoppingCart: any = [];
  firstName = "";
  lastName = "";
  email = "";
  fullName = "";
  companyDetail: any = [];
  orderId: any;
  orderDate: any;
  orderTime: any;
  orderEmail: any;
  stepperVar: any;
  isDataAvailable: boolean = false;
  _promoCode: string = '';
  // Before Sign In
  isLoggedInUser: boolean = true;
  userName: string;
  otpResponseData: any = [];
  mobileOtpResponseData: any = [];
  emailverificationDone: boolean = false;
  disableAfterOtp: boolean = false;
  disableAfterVerifyOtp: boolean = false;
  maxDate: Date;
  mobileNo: any;
  countryCodes: any = CountryCodes;
  azurePhoneDropdown: boolean = false;
  phoneDropdown: boolean = false;
  countryCodeLabel: string = "+65";
  countryMobCodeLabel: string = "+65";
  azureSearchText: any;
  searchText: any;
  validOtpPopup: any = {};
  isChecked: boolean = false;

  verifiedMobileOtp: boolean = false;
  showBillingAccountNo: boolean = true;
  reSendOtplabel: boolean = false;
  pdfLinkSpec: any = [];
  awsSendOptCount: any = 0;
  topReach: boolean = false;
  lastScrollTop = 0;
  azureSendOptCount: any = 0;
  innerWindowWidth:number = 0;
  @ViewChild('proceedPopUp', { static: false }) proceedPopUp: ElementRef<HTMLElement>;
  @ViewChild('divToScroll', { static: false }) divToScroll: ElementRef;
  @ViewChild('divProceedStatic', { static: false }) divProceedStatic: ElementRef;



  constructor(private _formBuilder: FormBuilder, private toastr: ToastrService, public activatedRoute: ActivatedRoute, private isLoadingService: IsLoadingService, private changeDetectorRef: ChangeDetectorRef, private router: Router, private _Mainservice: CommonService, private customerService: AppService) {

    this.myCustomizeForms = _formBuilder.group({
      accId: [null, Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern(/^-?([0-9]\d*)?$/),])],
      accname: [null, Validators.compose([Validators.required, Validators.pattern(/^[^&<>"\\%|]*$/),])],
      emailAdd: [null, [Validators.required, Validators.email]],
      emailVeri: [null, Validators.required],
      // agreeProd: [true, Validators.requiredTrue],
      // agreeMar: [true, Validators.requiredTrue],
      genTermCond: [true, Validators.requiredTrue],
      billTermCond: [true, Validators.requiredTrue],
      specTermCond: [true, Validators.requiredTrue],
      awsTermCond: [true, Validators.requiredTrue],
      azureTermCond: [true, Validators.requiredTrue],

      custFeatureAwsId: [null, Validators.requiredTrue],
      custFeatureSeettleAmt: [null, Validators.requiredTrue],
      custFeatureStandAlone: [null, Validators.requiredTrue],
      custFeaturePayment: [null, Validators.requiredTrue],
      custFeatureRelation: [null, Validators.requiredTrue],

      // microsoftID: [null,Validators.compose([Validators.required])],
      azureBrownEmailAdd: [null, Validators.compose([Validators.required])],
      domainName: [null],
      azureFname: [null, Validators.required],
      azureLname: [null, Validators.required],
      azurePostCode: [null, Validators.required],
      azureAdd: [null, Validators.required],
      azurephone: [null, [Validators.required,Validators.minLength(8)]],
      azureEmailAdd: [null, Validators.required],
      // azureCountry: [null, Validators.required],
      // azureCity: [null, Validators.required],
      azureEmailVerif: [null, Validators.required],
      azureDname: [null, Validators.required],
      azureMobileSearch: [null],


      gcpaccname: [null, Validators.required],
      gcpemailAdd: [null, Validators.required],
      gcpemailVerif: [null]

    });

    this.myBillingForms = _formBuilder.group({
      manBillAccNo: ["", Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^-?(0|[1-9]\d*)?$/),])],
      manBrnUenNo: ["", Validators.required],
      lastBillDate: [""],
      lastTotalCharge: ["", Validators.compose([Validators.pattern(/^[0-9]+\.?[0-9]\d*$/)])],
      mobileBillAdd: ["", [Validators.compose([Validators.required]),Validators.minLength(8)]],
      mobileBillOtp: [null, Validators.required],
      mobileBillNo: [null, Validators.required],
      mobileSearch: [null],
      mobileCustIdType: [null]
      //  mobileBrnNo: [null, Validators.required] 
    })

    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate());
  }
  headerStick: boolean = false;
  marginTopStatic: boolean = false;
  marginStaticValue: any = 0;
  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    var divToScrollOffsetTop = this.divToScroll.nativeElement.offsetTop + 36;
    var divScrollEnd = divToScrollOffsetTop + this.divToScroll.nativeElement.offsetHeight - this.divProceedStatic.nativeElement.offsetHeight;
    if (window.pageYOffset > divToScrollOffsetTop && window.pageYOffset < divScrollEnd) {
      this.headerStick = true;
    } else {
      this.headerStick = false;
    }
    var divMarginEnd = this.divProceedStatic.nativeElement.offsetHeight + divScrollEnd;
    this.marginStaticValue = this.divToScroll.nativeElement.offsetHeight - this.divProceedStatic.nativeElement.offsetHeight;
    if (window.pageYOffset > divScrollEnd && window.pageYOffset < divMarginEnd) {
      this.marginTopStatic = true;
    } else {
      this.marginTopStatic = false;
    }
    this.getScrollEvent();
  }

  @HostListener('window:resize', ['$event'])
  onResizeWindow(event) {
    this.innerWindowWidth = window.innerWidth;
  }

  sticky: boolean = false;
  stickyTop: any = '';

  savedCartcustomization: any = [];

  scroll = (event): void => {

    if (window.pageYOffset >= 420) {
      this.sticky = true;
      if (window.pageYOffset >= 1762) {
        this.stickyTop = (1781 - window.pageYOffset) + 45;
        this.stickyTop = this.stickyTop.toString() + 'px';

      }
      else {
        this.stickyTop = "27px";
      }
    }
    else {
      this.sticky = false;
      this.stickyTop = "27px";
    }
  };

  ngOnInit() {
    this.innerWindowWidth = window.innerWidth;
    this.myCustomizeForms.get("emailAdd").valueChanges.subscribe(x => {
      this.myCustomizeForms.get("emailVeri").reset();
    });
    this.myCustomizeForms.get("azureEmailAdd").valueChanges.subscribe(x => {
      this.myCustomizeForms.get("azureEmailVerif").reset();
    });
    this.myCustomizeForms.get("emailVeri").valueChanges.subscribe(x => {
      if ((this.greenOrBrownField == "greenField" && this.cloudType == "aws")) {
        this.emailverificationDone = true;
      }
    });
    this.myCustomizeForms.get("azureEmailVerif").valueChanges.subscribe(x => {
      if ((this.greenOrBrownField == "greenField" && this.cloudType == "azure")) {
        this.emailverificationDone = true;
      }
    });
    this.myBillingForms.get("mobileBillAdd").valueChanges.subscribe(x => {
      this.myBillingForms.get("mobileBillOtp").reset();
      // this.reSendOtplabel = false;
      this.disableAfterVerifyOtp = false;
    });
    this.userName = sessionStorage.getItem('ep-username')
    window.addEventListener('scroll', this.scroll, true);

    this.isLoadingService.add({ key: ["default"] });
    this.companyDetail = JSON.parse(sessionStorage.getItem('companyDetails'));

    if (this.companyDetail.billingAccountNumber) {
      this.showBillingAccountNo = false;
    }
    if (this.companyDetail) {
      this.myBillingForms.controls['manBillAccNo'].patchValue(this.companyDetail.billingAccountNumber);
      this.myBillingForms.controls['manBrnUenNo'].patchValue(this.companyDetail.companyId);
    }

    this.myBillingForms.controls['mobileBillNo'].disable();
    // this.myBillingForms.controls['mobileBrnNo'].disable();
    this.myBillingForms.controls['mobileCustIdType'].disable();


    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    this.cartItemId = parseInt(sessionStorage.getItem('cartItemId'));
    this.dataid = this.activatedRoute.params.subscribe(params => {
      this.dataid = params['id'];
      this.dataid = +this.dataid;
      this.paramId = this.dataid;
      this.getProdDetails(this.dataid);
    })
    // this.firstFormGroup = this._formBuilder.group({
    //     firstCtrl: ['', Validators.required]
    //   });
    //   this.secondFormGroup = this._formBuilder.group({
    //     secondCtrl: ['', Validators.required]
    //   });

    //  if (this.createForm) {
    //   this.myCustomizeForms.get('accname').setValidators([Validators.required]);
    //   this.myCustomizeForms.get('emailAdd').setValidators([Validators.required]);
    //   this.myCustomizeForms.get('accId').setValidators(null);
    // }

    // if (this.createForm) {
    //   this.myCustomizeForms.get('accname').setValidators(null);
    //   this.myCustomizeForms.get('emailAdd').setValidators(null);
    //   this.myCustomizeForms.get('accId').setValidators([Validators.required]);
    // }




  }

  ngOnDestroy() {
    this.customerService.anyQuestionProductName.next(null);
  }

  getScrollEvent() {
    let st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > this.lastScrollTop) {
      if (st > 60) {
        this.topReach = true;
      }
    } else {
      this.topReach = false;
    }
    this.lastScrollTop = st <= 0 ? 0 : st;
  }

  // getOrderScroll:any;
  ngAfterViewInit(): void {
    if (this.showBillingAccountNo) {
      setTimeout(() => {
        this.proceedPopUpOpen();
        // this.getOrderScroll = this.divToScroll.nativeElement.offsetTop;
      }, 2000);
    }
  }

  proceedPopUpOpen() {
    let el: HTMLElement = this.proceedPopUp.nativeElement;
    el.click();
  }

  onApplyPromoCode(value) {
    this._promoCode = value;
  }

  accChange() {
    
  }

  goBackCloud(num) {
    this.router.navigateByUrl(
      `/cloud-services/Cloud Services`
    );
  }


  getProdDetails(id) {
    var _model = {
      "id": id
    }
    this._Mainservice.getProductDetails(_model).subscribe((data: any) => {

      this.productDetailData = data.body[0];
      var productDetailDatas = data.body[0];
      if (this.productDetailData.name.toUpperCase().includes("AWS")) {
        this.cloudType = "aws";
        this.customerAgreePdf = 'https://ajithbharathi.github.io/website/img/AWSCustomer_Agreement_2018.pdf';

      } else if (this.productDetailData.name.toUpperCase().includes("GCP")) {
        this.cloudType = "gcp";
        this.customerAgreePdf = '../../../../assets/pdf/GCP_Customer_Agreement.pdf';
      } else if (this.productDetailData.name.toUpperCase().includes("AZURE")) {
        this.cloudType = "azure";
        this.customerAgreePdf = 'https://ajithbharathi.github.io/website/img/Microsoft_Customer_Agreement%20(1).pdf';
      }
      this.productDetailSpecData = data.body[0].productSpecificationRelationship.productSpecification.productSpecCharacteristic;
      this.prodAmount = productDetailDatas.products[0].productOfferingPrice[0].tax[0].taxAmount.amount;
      this.prodOfferName = productDetailDatas.products[0].productOfferingPrice[0].name;
      this.productDetailSpecData.forEach((val) => {
        if (val.name == "productLogo") {
          this.productLogo = val.type
        }
        if (val.name == "customerAgreementPdf") {
          // this.customerAgreePdf = val.productSpecCharacteristicValue[0].metadata;
        }
        if (val.type == "pdfLink") {
          this.pdfLinkSpec.push({ "name": val.name, "pdfLink": val.productSpecCharacteristicValue[0].value })
        }
      })
      this.isLoadingService.remove({ key: ["default"] });
      this.isDataAvailable = true;
      this.changeDetectorRef.detectChanges();
      this.customerService.anyQuestionProductName.next({ prodName: this.productDetailData.name });

    })
  }


  textonly(event) {
    return (
      (event.charCode > 64 && event.charCode < 91) ||
      (event.charCode > 96 && event.charCode < 123)
    );
  }


  proceedBtn() {
    this.myCustomizeForms.reset();
    this.awsSendOptCount = 0;
    this.azureSendOptCount = 0;
    this.emailverificationDone = false;
    this.disableAfterOtp = false;
    if (this.greenOrBrownField == "greenField" && this.cloudType == "aws") {
      this.emailverificationDone = true;
      this.myCustomizeForms.get('accname').setValidators(Validators.compose([Validators.required, Validators.pattern(/^[^&<>"\\%|]*$/),]));
      this.myCustomizeForms.get('emailAdd').setValidators([Validators.required, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,63}")]);
      this.myCustomizeForms.get('accId').setValidators(null);
      this.myCustomizeForms.get('custFeatureAwsId').setValidators(null);
      this.myCustomizeForms.get('custFeatureSeettleAmt').setValidators(null);
      this.myCustomizeForms.get('custFeatureStandAlone').setValidators(null);
      this.myCustomizeForms.get('custFeaturePayment').setValidators(null);
      this.myCustomizeForms.get('custFeatureRelation').setValidators(null);
      this.myCustomizeForms.get('emailVeri').setValidators([Validators.required]);
      this.myCustomizeForms.get('awsTermCond').setValidators([Validators.requiredTrue]);

      // this.myCustomizeForms.get('microsoftID').setValidators(null);
      this.myCustomizeForms.get('azureBrownEmailAdd').setValidators(null);
      this.myCustomizeForms.get('domainName').setValidators(null);
      this.myCustomizeForms.get('azureFname').setValidators(null);
      this.myCustomizeForms.get('azureLname').setValidators(null);
      this.myCustomizeForms.get('azurePostCode').setValidators(null);
      this.myCustomizeForms.get('azureAdd').setValidators(null);
      this.myCustomizeForms.get('azurephone').setValidators(null);
      this.myCustomizeForms.get('azureEmailAdd').setValidators(null);
      // this.myCustomizeForms.get('azureCity').setValidators(null);
      // this.myCustomizeForms.get('azureCountry').setValidators(null);
      this.myCustomizeForms.get('azureEmailVerif').setValidators(null);
      this.myCustomizeForms.get('azureDname').setValidators(null);
      this.myCustomizeForms.get('azureTermCond').setValidators(null);

      this.myCustomizeForms.get('gcpaccname').setValidators(null);
      this.myCustomizeForms.get('gcpemailAdd').setValidators(null);
      this.myCustomizeForms.get('gcpemailVerif').setValidators(null);

    }

    if (this.greenOrBrownField == "brownField" && this.cloudType == "aws") {
      this.myCustomizeForms.get('accname').setValidators(null);
      this.myCustomizeForms.get('emailAdd').setValidators(null);
      this.myCustomizeForms.get('emailVeri').setValidators(null);
      this.myCustomizeForms.get('accId').setValidators(Validators.compose([Validators.required, Validators.minLength(12), Validators.maxLength(12), Validators.pattern(/^-?([0-9]\d*)?$/),]));
      this.myCustomizeForms.get('custFeatureAwsId').setValidators([Validators.requiredTrue]);
      this.myCustomizeForms.get('custFeatureSeettleAmt').setValidators([Validators.requiredTrue]);
      this.myCustomizeForms.get('custFeatureStandAlone').setValidators([Validators.requiredTrue]);
      this.myCustomizeForms.get('custFeaturePayment').setValidators([Validators.requiredTrue]);
      this.myCustomizeForms.get('custFeatureRelation').setValidators([Validators.requiredTrue]);
      this.myCustomizeForms.get('awsTermCond').setValidators([Validators.requiredTrue]);

      // this.myCustomizeForms.get('microsoftID').setValidators(null);
      this.myCustomizeForms.get('azureBrownEmailAdd').setValidators(null);
      this.myCustomizeForms.get('domainName').setValidators(null);
      this.myCustomizeForms.get('azureFname').setValidators(null);
      this.myCustomizeForms.get('azureLname').setValidators(null);
      this.myCustomizeForms.get('azurePostCode').setValidators(null);
      this.myCustomizeForms.get('azureAdd').setValidators(null);
      this.myCustomizeForms.get('azurephone').setValidators(null);
      this.myCustomizeForms.get('azureEmailAdd').setValidators(null);
      // this.myCustomizeForms.get('azureCity').setValidators(null);
      // this.myCustomizeForms.get('azureCountry').setValidators(null);
      this.myCustomizeForms.get('azureEmailVerif').setValidators(null);
      this.myCustomizeForms.get('azureDname').setValidators(null);
      this.myCustomizeForms.get('azureTermCond').setValidators(null);

      this.myCustomizeForms.get('gcpaccname').setValidators(null);
      this.myCustomizeForms.get('gcpemailAdd').setValidators(null);
      this.myCustomizeForms.get('gcpemailVerif').setValidators(null);
    }


    if (this.greenOrBrownField == "greenField" && this.cloudType == "azure") {
      this.emailverificationDone = true;
      this.myCustomizeForms.get('accname').setValidators(null);
      this.myCustomizeForms.get('emailVeri').setValidators(null);
      this.myCustomizeForms.get('emailAdd').setValidators(null);

      this.myCustomizeForms.get('accId').setValidators(null);
      this.myCustomizeForms.get('custFeatureAwsId').setValidators(null);
      this.myCustomizeForms.get('custFeatureSeettleAmt').setValidators(null);
      this.myCustomizeForms.get('custFeatureStandAlone').setValidators(null);
      this.myCustomizeForms.get('custFeaturePayment').setValidators(null);
      this.myCustomizeForms.get('custFeatureRelation').setValidators(null);
      this.myCustomizeForms.get('awsTermCond').setValidators(null);

      // this.myCustomizeForms.get('microsoftID').setValidators(null);
      this.myCustomizeForms.get('azureBrownEmailAdd').setValidators(null);
      this.myCustomizeForms.get('domainName').setValidators(null);
      this.myCustomizeForms.get('azureFname').setValidators([Validators.required]);
      this.myCustomizeForms.get('azureLname').setValidators([Validators.required]);
      this.myCustomizeForms.get('azurePostCode').setValidators([Validators.required]);
      this.myCustomizeForms.get('azureAdd').setValidators([Validators.required]);
      this.myCustomizeForms.get('azurephone').setValidators([Validators.required,Validators.minLength(8)]);
      this.myCustomizeForms.get('azureEmailAdd').setValidators([Validators.required, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,63}")]);
      // this.myCustomizeForms.get('azureCity').setValidators([Validators.required]);
      // this.myCustomizeForms.get('azureCountry').setValidators([Validators.required]);
      this.myCustomizeForms.get('azureEmailVerif').setValidators([Validators.required]);
      this.myCustomizeForms.get('azureDname').setValidators([Validators.required]);
      this.myCustomizeForms.get('azureTermCond').setValidators([Validators.requiredTrue]);

      this.myCustomizeForms.get('gcpaccname').setValidators(null);
      this.myCustomizeForms.get('gcpemailAdd').setValidators(null);
      this.myCustomizeForms.get('gcpemailVerif').setValidators(null);
    }

    if (this.greenOrBrownField == "brownField" && this.cloudType == "azure") {
      this.myCustomizeForms.get('accname').setValidators(null);
      this.myCustomizeForms.get('emailAdd').setValidators(null);
      this.myCustomizeForms.get('emailVeri').setValidators(null);
      this.myCustomizeForms.get('accId').setValidators(null);
      this.myCustomizeForms.get('custFeatureAwsId').setValidators(null);
      this.myCustomizeForms.get('custFeatureSeettleAmt').setValidators(null);
      this.myCustomizeForms.get('custFeatureStandAlone').setValidators(null);
      this.myCustomizeForms.get('custFeaturePayment').setValidators(null);
      this.myCustomizeForms.get('custFeatureRelation').setValidators(null);
      this.myCustomizeForms.get('awsTermCond').setValidators(null);

      // this.myCustomizeForms.get('microsoftID').setValidators([Validators.required]);
      this.myCustomizeForms.get('azureBrownEmailAdd').setValidators([Validators.required, Validators.pattern("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,63}")]);
      this.myCustomizeForms.get('domainName').setValidators(null);
      this.myCustomizeForms.get('azureFname').setValidators(null);
      this.myCustomizeForms.get('azureLname').setValidators(null);
      this.myCustomizeForms.get('azurePostCode').setValidators(null);
      this.myCustomizeForms.get('azureAdd').setValidators(null);
      this.myCustomizeForms.get('azurephone').setValidators(null);
      this.myCustomizeForms.get('azureEmailAdd').setValidators(null);
      // this.myCustomizeForms.get('azureCity').setValidators(null);
      // this.myCustomizeForms.get('azureCountry').setValidators(null);
      this.myCustomizeForms.get('azureEmailVerif').setValidators(null);
      this.myCustomizeForms.get('azureDname').setValidators(null);
      this.myCustomizeForms.get('azureTermCond').setValidators([Validators.requiredTrue]);

      this.myCustomizeForms.get('gcpaccname').setValidators(null);
      this.myCustomizeForms.get('gcpemailAdd').setValidators(null);
      this.myCustomizeForms.get('gcpemailVerif').setValidators(null);
    }

    if (this.greenOrBrownField == "greenField" && this.cloudType == "gcp") {
      this.myCustomizeForms.get('accname').setValidators(null);
      this.myCustomizeForms.get('emailVeri').setValidators(null);
      this.myCustomizeForms.get('emailAdd').setValidators(null);
      this.myCustomizeForms.get('accId').setValidators(null);
      this.myCustomizeForms.get('custFeatureAwsId').setValidators(null);
      this.myCustomizeForms.get('custFeatureSeettleAmt').setValidators(null);
      this.myCustomizeForms.get('custFeatureStandAlone').setValidators(null);
      this.myCustomizeForms.get('custFeaturePayment').setValidators(null);
      this.myCustomizeForms.get('custFeatureRelation').setValidators(null);
      this.myCustomizeForms.get('awsTermCond').setValidators(null);

      // this.myCustomizeForms.get('microsoftID').setValidators(null);
      this.myCustomizeForms.get('azureBrownEmailAdd').setValidators(null);
      this.myCustomizeForms.get('domainName').setValidators(null);
      this.myCustomizeForms.get('azureFname').setValidators(null);
      this.myCustomizeForms.get('azureLname').setValidators(null);
      this.myCustomizeForms.get('azurePostCode').setValidators(null);
      this.myCustomizeForms.get('azureAdd').setValidators(null);
      this.myCustomizeForms.get('azurephone').setValidators(null);
      this.myCustomizeForms.get('azureEmailAdd').setValidators(null);
      // this.myCustomizeForms.get('azureCity').setValidators(null);
      // this.myCustomizeForms.get('azureCountry').setValidators(null);
      this.myCustomizeForms.get('azureEmailVerif').setValidators(null);
      this.myCustomizeForms.get('azureDname').setValidators(null);
      this.myCustomizeForms.get('azureTermCond').setValidators(null);

      this.myCustomizeForms.get('gcpaccname').setValidators([Validators.required]);
      this.myCustomizeForms.get('gcpemailAdd').setValidators([Validators.required]);
      this.myCustomizeForms.get('gcpemailVerif').setValidators(null);
    }

    this.myCustomizeForms.get('accname').updateValueAndValidity();
    this.myCustomizeForms.get('emailVeri').updateValueAndValidity();
    this.myCustomizeForms.get('emailAdd').updateValueAndValidity();
    this.myCustomizeForms.get('accId').updateValueAndValidity();
    this.myCustomizeForms.get('custFeatureAwsId').updateValueAndValidity();
    this.myCustomizeForms.get('custFeatureSeettleAmt').updateValueAndValidity();
    this.myCustomizeForms.get('custFeatureStandAlone').updateValueAndValidity();
    this.myCustomizeForms.get('custFeaturePayment').updateValueAndValidity();
    this.myCustomizeForms.get('custFeatureRelation').updateValueAndValidity();
    this.myCustomizeForms.get('awsTermCond').updateValueAndValidity();
    // this.myCustomizeForms.get('microsoftID').updateValueAndValidity();
    this.myCustomizeForms.get('azureBrownEmailAdd').updateValueAndValidity();
    this.myCustomizeForms.get('domainName').updateValueAndValidity();
    this.myCustomizeForms.get('azureFname').updateValueAndValidity();
    this.myCustomizeForms.get('azureLname').updateValueAndValidity();
    this.myCustomizeForms.get('azurePostCode').updateValueAndValidity();
    this.myCustomizeForms.get('azureAdd').updateValueAndValidity();
    this.myCustomizeForms.get('azurephone').updateValueAndValidity();
    this.myCustomizeForms.get('azureEmailAdd').updateValueAndValidity();
    // this.myCustomizeForms.get('azureCity').updateValueAndValidity();
    // this.myCustomizeForms.get('azureCountry').updateValueAndValidity();
    this.myCustomizeForms.get('azureEmailVerif').updateValueAndValidity();
    this.myCustomizeForms.get('azureDname').updateValueAndValidity();
    this.myCustomizeForms.get('azureTermCond').updateValueAndValidity();
    this.myCustomizeForms.get('gcpaccname').updateValueAndValidity();
    this.myCustomizeForms.get('gcpemailAdd').updateValueAndValidity();
    this.myCustomizeForms.get('gcpemailVerif').updateValueAndValidity();
  }

  subscriTypeChange(event) {
    this.greenOrBrownField = event.target.value;

    this.radioSelected = false;
    // this.myCustomizeForms.reset();
    this.myCustomizeForms.enable()
    this.savedCartcustomization = [];
  }

  subscriTypeOutput(event) {

  }

  get myCustomizeFormsControl() {
    return this.myCustomizeForms.controls;
  }
  get myBillingFormsControl() {
    return this.myBillingForms.controls;
  }

  onSubmit() {

  }

  onBillSubmit() {

  }

  goBack(stepper: MatStepper) {
    stepper.previous();
    this.reSendOtplabel = false;
  }

  goForward(stepper: MatStepper) {
    stepper.next();
    this.billing(this.billingTab);
  }

  billing(activeTab) {
    if (activeTab == "manual-tab") {
      this.verifiedMobileOtp = false;

      this.myBillingForms.get('manBillAccNo').setValidators([Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^-?(0|[1-9]\d*)?$/),])]);
      this.myBillingForms.get('manBrnUenNo').setValidators([Validators.required]);
      this.myBillingForms.get('lastBillDate').setValidators(null);
      this.myBillingForms.get('lastTotalCharge').setValidators([Validators.compose([Validators.pattern(/^[0-9]+\.?[0-9]\d*$/)])]);
      this.myBillingForms.get('mobileBillAdd').setValidators(null);
      this.myBillingForms.get('mobileBillOtp').setValidators(null);
      this.myBillingForms.get('mobileBillNo').setValidators(null);
      this.myBillingForms.get('mobileCustIdType').setValidators(null);
      // this.myBillingForms.get('mobileBrnNo').setValidators(null);


      // this.myCustomizeForms.get('azureFname').setValidators(null);
      // this.myCustomizeForms.get('azureLname').setValidators(null);
      // this.myCustomizeForms.get('azurePostCode').setValidators(null);
      // this.myCustomizeForms.get('azureAdd').setValidators(null);
      // this.myCustomizeForms.get('azurephone').setValidators(null);
      // this.myCustomizeForms.get('azureEmailAdd').setValidators(null);


      //  manBillAccNo: ["", Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(8),Validators.pattern(/^-?(0|[1-9]\d*)?$/),])],
      //  manBrnUenNo: ["", Validators.required],
      //  lastBillDate: [""],
      //  lastTotalCharge: ["",Validators.compose([Validators.pattern(/^[0-9]+\.?[0-9]\d*$/)])]
      //  mobileBillAdd: [null, Validators.required],
    } else if (activeTab == "mobile-tab") {
      this.verifiedMobileOtp = true;
      this.myBillingForms.get('manBillAccNo').setValidators(null);
      this.myBillingForms.get('manBrnUenNo').setValidators(null);
      this.myBillingForms.get('lastBillDate').setValidators(null);
      this.myBillingForms.get('lastTotalCharge').setValidators(null);
      this.myBillingForms.get('mobileBillAdd').setValidators([Validators.required, Validators.minLength(8)]);
      this.myBillingForms.get('mobileBillOtp').setValidators([Validators.required]);
      this.myBillingForms.get('mobileBillNo').setValidators([Validators.required]);
      this.myBillingForms.get('mobileCustIdType').setValidators(null);
      // this.myBillingForms.get('mobileBrnNo').setValidators([Validators.required]);
    }

    this.myBillingForms.get('manBillAccNo').updateValueAndValidity();
    this.myBillingForms.get('manBrnUenNo').updateValueAndValidity();
    this.myBillingForms.get('lastBillDate').updateValueAndValidity();
    this.myBillingForms.get('lastTotalCharge').updateValueAndValidity();
    this.myBillingForms.get('mobileBillAdd').updateValueAndValidity();
    this.myBillingForms.get('mobileBillOtp').updateValueAndValidity();
    this.myBillingForms.get('mobileBillNo').updateValueAndValidity();
    this.myBillingForms.get('mobileCustIdType').updateValueAndValidity();
    // this.myBillingForms.get('mobileBrnNo').updateValueAndValidity();
  }

  billingDetails(val) {

    this.billingTab = val;
    this.billing(val);
  }

  proceedToCustomize() {
    var obj = [];


    if (this.greenOrBrownField == "greenField" && this.cloudType == "aws") {
      obj = [
        {
          "cust_value": "green",
          "cust_key": "account_route",
          "CartItem_id": this.cartItemId
        },

        {
          "cust_value": this.myCustomizeFormsControl.emailAdd.value,
          "cust_key": "newacc_email",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": this.myCustomizeFormsControl.accname.value,
          "cust_key": "account_name",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": sessionStorage.getItem('customerId'),
          "cust_key": "customerid",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": "accepted",
          "cust_key": "SingtelProductTerms",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": "accepted",
          "cust_key": "SingtelMPTerms",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": "valid",
          "cust_key": "OTP Status",
          "CartItem_id": this.cartItemId
        }
      ]
    }

    if (this.greenOrBrownField == "brownField" && this.cloudType == "aws") {
      obj = [{
        "cust_value": "brown",
        "cust_key": "account_route",
        "CartItem_id": this.cartItemId
      },

      {
        "cust_value": this.myCustomizeFormsControl.accId.value,
        "cust_key": "account_number",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": sessionStorage.getItem('customerId'),
        "cust_key": "customerid",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": "accepted",
        "cust_key": "awsBrownTerm1",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": "accepted",
        "cust_key": "awsBrownTerm2",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": "accepted",
        "cust_key": "awsBrownTerm3",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": "accepted",
        "cust_key": "awsBrownTerm4",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": "accepted",
        "cust_key": "awsBrownTerm5",
        "CartItem_id": this.cartItemId
      }]
    }
    if (this.greenOrBrownField == "greenField" && this.cloudType == "azure") {
      obj = [
        {
          "cust_value": "green",
          "cust_key": "account_route",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": "TRUE",
          "cust_key": "contractSigned",
          "CartItem_id": this.cartItemId
        },

        {
          "cust_value": this.myCustomizeFormsControl.azureDname.value + ".onmicrosoft.com",
          "cust_key": "domain",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": this.myCustomizeFormsControl.azureFname.value,
          "cust_key": "firstName",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": this.myCustomizeFormsControl.azureLname.value,
          "cust_key": "lastName",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": this.myCustomizeFormsControl.azurePostCode.value,
          "cust_key": "postalCode",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": this.myCustomizeFormsControl.azureAdd.value,
          "cust_key": "addressLine1",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": this.myCustomizeFormsControl.azurephone.value.internationalNumber,
          "cust_key": "phoneNumber",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": this.myCustomizeFormsControl.azureEmailAdd.value,
          "cust_key": "email",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": "1",
          "cust_key": "quantity",
          "CartItem_id": this.cartItemId
        },
        // {
        //   "cust_value": this.myCustomizeFormsControl.azureCountry.value,
        //   "cust_key": "country",
        //   "CartItem_id": this.cartItemId
        // },
        // {
        //   "cust_value": this.myCustomizeFormsControl.azureCity.value,
        //   "cust_key": "city",
        //   "CartItem_id": this.cartItemId
        // },
        {
          "cust_value": sessionStorage.getItem('customerId'),
          "cust_key": "customerid",
          "CartItem_id": this.cartItemId
        },
        {
          "cust_value": "valid",
          "cust_key": "OTP Status",
          "CartItem_id": this.cartItemId
        }
      ]
      if (this.companyDetail.companyId) {
        obj.push({
          "cust_value": JSON.parse(sessionStorage.getItem('companyDetails')).companyId,
          "cust_key": "companyName",
          "CartItem_id": this.cartItemId
        })
      }
    }

    if (this.greenOrBrownField == "brownField" && this.cloudType == "azure") {
      obj = [{
        "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
      },
      {
        "cust_value": "brown",
        "cust_key": "account_route",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": this.myCustomizeFormsControl.domainName.value ? this.myCustomizeFormsControl.domainName.value + ".onmicrosoft.com" : "",
        "cust_key": "domain",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": this.myCustomizeFormsControl.azureBrownEmailAdd.value,
        "cust_key": "email",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": sessionStorage.getItem('customerId'),
        "cust_key": "customerid",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": "accepted",
        "cust_key": "azureBrownTerm1",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": "accepted",
        "cust_key": "azureBrownTerm2",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": "accepted",
        "cust_key": "azureBrownTerm3",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": "accepted",
        "cust_key": "azureBrownTerm4",
        "CartItem_id": this.cartItemId
      },
      {
        "cust_value": "accepted",
        "cust_key": "azureBrownTerm5",
        "CartItem_id": this.cartItemId
      }]
    }

    if (this.savedCartcustomization.length > 0) {

      obj.forEach((objVal) => {
        let index = this.savedCartcustomization.findIndex(x => x.cust_key === objVal.cust_key);
        if (index > -1) {
          objVal.id = this.savedCartcustomization[index].id;
        }
      });
    }

    this._Mainservice.getCartcustomization(obj).subscribe((data: any) => {

      this.savedCartcustomization = data.body;
    })

  }

  submitOrder(stepper) {

    var userAccDetail = JSON.parse(sessionStorage.getItem('userAccountDetails'));

    if (this.billingTab == "manual-tab") {

      var obj = {
        "type": "ManualEntry",
        "userBillingAccountNumber": this.myBillingForms.controls['manBillAccNo'].value,
        "userLastBillDate": this.myBillingForms.controls['lastBillDate'].value ? moment(this.myBillingForms.controls['lastBillDate'].value).format('MM/DD/YYYY') : '',
        "userBillAmount": this.myBillingForms.controls['lastTotalCharge'].value,
        "userCompanyIdValue": this.myBillingForms.controls['manBrnUenNo'].value,
        "customerId": userAccDetail.customerid,
        "channel": "MP",
        "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
      }
      this._Mainservice.billingOrder(obj).subscribe((data: any) => {
        if (data.body.pegasusStatus == "Valid") {
          this.confirmOrder(stepper)
        } else {
          // this.toastr.error(data.body.pegasusStatus);

          this.toastr.error(
            data.body.pegasusStatus, '',
            {
              enableHtml: true,
              closeButton: false,
              tapToDismiss: true
            }
          );
        }

      })

    } else if (this.billingTab == "mobile-tab") {
      this.confirmOrder(stepper);
    }
    // this.confirmOrder(stepper);
  }

  goForward_reviewOrder(stepper: MatStepper) {
    stepper.next();
  }


  confirmOrder(stepper) {
    this.stepperVar = stepper;
    var shoppingSessionId = parseInt(sessionStorage.getItem('cartSessionID'));
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this._Mainservice.getShoppingCartDetails(shoppingSessionId, individualObj).subscribe((data: any) => {
      this.shoppingCart = data.body[0].shoppingCart;
      var userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
      var userAccDetail = JSON.parse(sessionStorage.getItem('userAccountDetails'));
      this.firstName = userDetails.firstName == null ? '' : userDetails.firstName;
      this.lastName = userDetails.lastName == null ? '' : userDetails.lastName;
      this.email = sessionStorage.getItem('ep-username');
      this.shoppingCart['customerEmail'] = this.email;
      this.shoppingCart['customerName'] = this.firstName;
      this.shoppingCart['customerId'] = sessionStorage.getItem('customerId');
      this.shoppingCart.Channel = "MP";
      this.shoppingCart.purchaseCompletedBy = this.firstName;
      this.shoppingCart['accountName'] = this.companyDetail.billingAccountNumber;
      this.shoppingCart['individualId'] = (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '';
      this.shoppingCart['contactMedium'] = [
        {
          characteristic: {
            //firstname and lastname added in orderContactDetails
            firstName: this.firstName,
            lastName: this.lastName,
            phoneNumber: userAccDetail.phoneno
          }
        }
      ];



      this._Mainservice.createOrder(this.shoppingCart).subscribe((res: any) => {
        var data = res.body;

        // var offset = +8;
        // var orderdateTime = new Date(data.orderDate);
        // var utc = orderdateTime.getTime() + (orderdateTime.getTimezoneOffset() * 60000);
        // var nd = new Date(utc + (3600000 * offset));

        // var orderDateTimeSplit = orderdateTime.toString().split(" ");
        // var orderDateTimeSplit = nd.toString().split(" ");
        this.orderId = data.externalId ? data.externalId : "";
        // this.orderDate = orderDateTimeSplit[1] + " " + orderDateTimeSplit[2] + " " + orderDateTimeSplit[3];
        // this.orderTime = orderDateTimeSplit[4];
        this.orderDate = data.orderDate;
        this.orderEmail = data.notificationContact;
        this.stepperVar.next();
        this.getCompanyDetail()
      })

    })
  }

  promoType(event) {
    if (event.target.value == "") {
      this._showpromoMsg = false;
    }
  }

  showSignInSignUpPage() {
    this.isLoggedInUser = false
  }

  sendOtp(val) {

    if (this.cloudType == "aws") {
      this.myCustomizeForms.get("emailVeri").reset();
      this.awsSendOptCount = this.awsSendOptCount + 1;
    }
    if (this.cloudType == "azure") {
      this.myCustomizeForms.get("azureEmailVerif").reset();
      this.azureSendOptCount = this.azureSendOptCount + 1;
    }
    var userAccDetail = JSON.parse(sessionStorage.getItem('userAccountDetails'));

    var obj = {
      "id": userAccDetail.id,
      "firstName": userAccDetail.name,
      "customerEmail": val,
      "type": "Email",
      "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
    }

    this._Mainservice.sendOtp(obj).subscribe((res: any) => {
      this.otpResponseData = res.body;
      var returnObj = {
        "cust_key": "OTPRequestID",
        "cust_value": this.otpResponseData.otpRequestId,
        "CartItem_id": this.cartItemId,
        "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
      }

      if (res.body.errorMessage) {
        this.toastr.error(res.body.errorMessage);
      } else {
        this.toastr.success('OTP sent');
        this.otpCartCustom(returnObj);
      }
    })

  }

  otpCartCustom(obj) {
    this._Mainservice.getCartcustomization(obj).subscribe((data: any) => {
      this.savedCartcustomization = data.body;
    })
  }

  verifyOtp(val) {
    var date = new Date();
    var newFormatDate = date.toISOString();
    var obj = {
      "awsgroupId":this.myCustomizeFormsControl.emailAdd.value,
      "otpRequestId": this.otpResponseData.otpRequestId,
      "otpReceived": val,
      "otpReceivedDateTime": newFormatDate,
      "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
    }
    this._Mainservice.verifyOtp(obj).subscribe((res: any) => {
      if (res.body.status == "Valid") {
        this.toastr.success("OTP verified");
        this.emailverificationDone = false;
        this.disableAfterOtp = true;
        // this.myCustomizeForms.controls['emailAdd'].disable();
        // this.myCustomizeForms.controls['emailVeri'].disable();
      }
      if (res.body.status == "Invalid") {
        this.toastr.error(res.body.message ? res.body.message : "You have entered an incorrect verification code, please try again");
      }
    })
  }

  dateChange() {

    var ss = this.myBillingForms.controls.lastBillDate.value;

  }

  otpchange() {

    if (this.myBillingForms.controls['mobileBillAdd'].value) {

    }
  }

  sendMobileOtp(val) {
    var userAccDetail = JSON.parse(sessionStorage.getItem('userAccountDetails'));
    var dialCode;
    if (this.countryMobCodeLabel.indexOf("+") != -1) {
      dialCode = this.countryMobCodeLabel.slice(1);
    } else {
      dialCode = this.countryMobCodeLabel;
    }
    this.mobileNo = dialCode + "" + val;
    this.myBillingForms.controls['mobileBillOtp'].patchValue(null);
    // this.mobileNo = this.countryMobCodeLabel + "" + val;

    var obj = {
      "firstName": userAccDetail.name,
      "type": "Mobilebased",
      "userMobileNumber": val,
      "countryCode": dialCode,
      "customerId": userAccDetail.customerid,
      "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
    }

    this._Mainservice.sendBillMobileOtp(obj).subscribe((res: any) => {
      this.toastr.success("This is valid for 5 mins", "OTP sent", {
        enableHtml: true,
        closeButton: true,
        timeOut: 10000
      });
      this.myBillingForms.get("mobileBillOtp").reset();
      this.mobileOtpResponseData = res.body;
      this.reSendOtplabel = true;
    })
  }

  verifyMobileOtp(val) {
    var userAccDetail = JSON.parse(sessionStorage.getItem('userAccountDetails'));
    var date = new Date();
    var newFormatDate = date.toISOString();
    this.verifiedMobileOtp = true;
    this.isChecked = false;
    var obj = {
      "id": userAccDetail.id,
      "type": "Mobilebased",
      "userMobileNumber": this.mobileNo,
      "otpRequestId": this.mobileOtpResponseData.otpRequestId,
      "customerId": userAccDetail.customerid,
      "otpReceivedDateTime": newFormatDate,
      "otpReceived": val,
      "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '',
    }

    this._Mainservice.verifyBillMobileOtp(obj).subscribe((res: any) => {
      if(res.body.pegasusStatus == "The phone number doesn't match with any Singtel Billing account") {
        this.toastr.error(res.body.pegasusStatus);
      } else if (res.body.pegasusStatus == "Invalid") {
        if (res.body.state == "Active") {
          this.validOtpPopup = {
            userMobileNumber: res.body.userMobileNumber,
            pegasusBillingAccountNumber: undefined
          }
          $("#OTPSucessResultModal").modal();
        } else {
          this.toastr.error("You have entered an incorrect verification code, please try again");
        }
      }
      else if (res.body.pegasusStatus == "Valid") {
        this.toastr.success("OTP verified");
        this.disableAfterVerifyOtp = true;
        this.reSendOtplabel = false;
        $("#OTPSucessResultModal").modal();
        this.validOtpPopup = {
          userMobileNumber: res.body.userMobileNumber,
          pegasusBillingAccountNumber: res.body.pegasusBillingAccountNumber
        }
        this.myBillingForms.controls['mobileBillNo'].patchValue(res.body.pegasusBillingAccountNumber);
        this.myBillingForms.controls['mobileCustIdType'].patchValue(res.body.pegasusCustomerId);

        if (!this.companyDetail.companyId) {
          var obj = [{
            "cust_value": res.body.pegasusCustomerId,
            "cust_key": "companyName",
            "CartItem_id": this.cartItemId,
            "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
          }]
          this._Mainservice.getCartcustomization(obj).subscribe((data: any) => {

          })
        }
      }
      // this.myBillingForms.controls['mobileBrnNo'].patchValue(res.body.pegasusCustomerId);
    })
  }

  eventCheck(val) {
    this.verifiedMobileOtp = val ? false : true;
  }

  downloadPdf() {
    const pdfUrl = this.customerAgreePdf;
    var pdfName = '';
    if (this.cloudType == "aws") {
      pdfName = 'AWS Customer Agreement.pdf';
    } else if (this.cloudType == "gcp") {
      pdfName = 'GCP Customer Agreement.pdf';
    } if (this.cloudType == "azure") {
      pdfName = 'Azure Customer Agreement.pdf';
    }
    FileSaver.saveAs(pdfUrl, pdfName);
  }

  typeRestrict() {
    return false
  }
  teleChange(formName, formControlName) {
    if (formName == "myBillingForms") {
      var y = this.myBillingForms.controls[formControlName];
      this.myBillingForms.controls[formControlName].patchValue(y.value.number.replace(/[^0-9.-]/g, ''));
    } else if (formName == "myCustomizeForms") {
      var y = this.myCustomizeForms.controls[formControlName];
      this.myCustomizeForms.controls[formControlName].patchValue(y.value.number.replace(/[^0-9.-]/g, ''));
    }
  }

  teleChangePaste(eve, formName, formControlName) {
    var clipboardData = eve.clipboardData;
    var pastedText = clipboardData.getData('text');
    if (!Number(pastedText)) {
      return false
    }
    if (formName == "myBillingForms") {
      var y = this.myBillingForms.controls[formControlName];
      this.myBillingForms.controls[formControlName].patchValue(y.value.number.replace(/[^0-9.-]/g, ''));
    } else if (formName == "myCustomizeForms") {
      var y = this.myCustomizeForms.controls[formControlName];
      this.myCustomizeForms.controls[formControlName].patchValue(y.value.number.replace(/[^0-9.-]/g, ''));
    }
  }

  getCompanyDetail() {
    var userAccDetail = JSON.parse(sessionStorage.getItem('userAccountDetails'));
    var customerid = {
      "id": userAccDetail.customerid
    }
    if (userAccDetail.customerid) {
      this.customerService.getCompanyDetails(customerid).subscribe(res => {
        sessionStorage.setItem('companyDetails', JSON.stringify(res.body));
      });
    }


  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  getazureparticularCountry(dialcode) {
    this.countryCodeLabel = dialcode;
    this.getAzureCountryList();
    this.azureSearchText = "";
  }

  getAzureCountryList() {
    this.azurePhoneDropdown = !this.azurePhoneDropdown;
  }

  getparticularCountry(dialcode) {
    this.countryMobCodeLabel = dialcode;
    this.getCountryList();
    this.searchText = "";
  }

  getCountryList() {
    this.phoneDropdown = !this.phoneDropdown;
  }

  getDomainAlreadyExist: boolean = false;

  getDomainExist(event) {
   
    if (event.target.value != '') {
      let obj = {
        "customerName": this.userName,
        "domainName": event.target.value + ".onmicrosoft.com"
      }

      this._Mainservice.verifyDomainAvailability(obj).subscribe((res: any) => {
        if (res) {
          
          if (res.body == false) {
            this.getDomainAlreadyExist = true;
           
            setTimeout(() => {
              this.myCustomizeForms.controls["azureDname"].setValue("");
              this.getDomainAlreadyExist = false;
            }, 1200);
          }
          else {
            this.getDomainAlreadyExist = false;
           
          }
        }
      });
    }
  }


}