import { Component, OnInit } from '@angular/core';
import { AppService } from "src/app/app.service";
import { Router } from "@angular/router";
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input';
import {ContactUsComponent} from '../contact-us/contact-us.component'
import { MatDialog } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import * as CountryCodes from "src/app/countryCode.json";
import { ApiService } from "../../../platform/util/api.service";
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  public enquiryform: FormGroup;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  showHead: any;
  category = [];
  intervalTimer: any;
  preferredCountries: CountryISO[] = [CountryISO.Qatar];

  isUserloggedIn: boolean = false;
  isPlanNameAvail: boolean = false;
  enquiryAboutValue: string = '';
  userDetails: any;
  countryCodes: any = CountryCodes;
  countryCodeLabel: string = "+65";
  searchText: string;
  phoneDropdown: boolean = false;
  formSubmitted = false;
  messagePlaceholder: string = "";
  termsurl: string;

  readOnlyInput = {
    name: false,
    companyName: false,
    email: false,
    mobile: false,
    enquiryAbout: false
  };

  constructor(private router: Router, 
  private footerservice: AppService, 
  private _formBuilder: FormBuilder,
  public dialog: MatDialog,
  private toastr:ToastrService,
  private apiService: ApiService) {
    this.enquiryform = _formBuilder.group({
      name: ["", [Validators.required]],
      companyName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.pattern(this.footerservice.emailIdValidatePattern)]],
      mobile: ["", [Validators.required,Validators.minLength(8)]],
      mobileSearch: ["+65"],
      preferredcontactmode: ["", [Validators.required]],
      helpyoutoday: ["", [Validators.required]],
      about: ["", [Validators.required]],
      message: ["", [Validators.required]],
      termscondition: ["", Validators.requiredTrue]
    });

    this.footerservice.anyQuestionProductName.subscribe((res: any) => {
      if (res !== null) {
        if (res.prodName != '') {
          this.isPlanNameAvail = true;
          this.enquiryAboutValue = res.prodName;
        }
        else {
          this.isPlanNameAvail = false;
          this.enquiryAboutValue = "";
        }
      }
      else {
        this.isPlanNameAvail = false;
        this.enquiryAboutValue = "";
      }
    });

  }

  ngOnInit(): void {
    this.termsurl = '';
    this.footerservice.getTermsConditonPdf().subscribe(resp => {
      if(resp && resp.body && resp.body.pdf) {
        this.termsurl = resp.body.pdf;
      }
      sessionStorage.setItem('TermsCondition', this.apiService.crypto.encrypt(this.termsurl));
    });

    this.getQuestionCategory();
    // this.intervalTimer = setInterval(() => { 
    //   if(this.apiService.isTaskConfiguredUpdated){
    //     this.getQuestionCategory(); 
    //   }
    // },2000);
  }

  getQuestionCategory() {
    this.footerservice.getquestioncategory().subscribe(resp => {
      this.category = resp.body;
    });
    // if(this.intervalTimer) clearInterval(this.intervalTimer);
  }

  get eqForm() {
    return this.enquiryform.controls;
  }

  getCountryList() {
    if (this.isUserloggedIn && this.readOnlyInput.mobile) {
      return;
    }
    this.phoneDropdown = !this.phoneDropdown;
  }

  getparticularCountry(dialcode) {
    this.countryCodeLabel = dialcode;
    this.enquiryform.controls['mobileSearch'].setValue(dialcode);
    this.getCountryList();
    this.searchText = "";
  }

  

  onActiveQuestionsCheck() {
    this.enquiryform.reset();
    this.messagePlaceholder = "";
    if (sessionStorage.getItem('ep-username')) {
      this.isUserloggedIn = true;
      if (sessionStorage.getItem('userAccountDetails')) {
        this.userDetails = JSON.parse(sessionStorage.getItem('userAccountDetails'));
      }

      // this.readOnlyInput.name = this.userDetails.name && this.userDetails.name != '' ? false : false;
      // this.readOnlyInput.companyName = this.userDetails.companyName && this.userDetails.companyName != '' ? false : false;
      // this.readOnlyInput.email = this.userDetails.loginid && this.userDetails.loginid != '' ? false : false;
      // this.readOnlyInput.mobile = this.userDetails.phoneno && this.userDetails.phoneno != '' ? false : false;
      this.readOnlyInput.enquiryAbout = this.enquiryAboutValue != '' ? true : false;
      
      this.enquiryform.setValue({
        name: this.userDetails.name ? this.userDetails.name : '',
        companyName: this.userDetails.companyName ? this.userDetails.companyName : '',
        email: '',//this.userDetails.loginid ? this.userDetails.loginid : '',
        mobile: this.userDetails.phoneno ? this.userDetails.phoneno : '',
        mobileSearch: "",
        preferredcontactmode: "",
        helpyoutoday: "",
        about: this.isPlanNameAvail === true ? this.enquiryAboutValue : "",
        message: "",
        termscondition: false
      });
       this.getIndividualCustomer(this.userDetails.id);
    }
    else {
      this.isUserloggedIn = false;
      // this.isPlanNameAvail = false;
      this.readOnlyInput.enquiryAbout = this.enquiryAboutValue != '' ? true : false;
      this.enquiryform.controls['about'].setValue(this.isPlanNameAvail === true ? this.enquiryAboutValue : "");
    }
  }

  onHelpQuestionPicked(event) {
    for (let i = 0; i < this.category.length; i++) {
      if (this.category[i].enquiryAbout === event.target.value) {
        this.messagePlaceholder = this.category[i].message;
      }
    }
  }
  openContactusPopup(){
    let dialogRef = this.dialog.open(ContactUsComponent, {
            width: '77vw',
            panelClass:'custom-contactModal'
          });

  }

  onSubmit() {
    this.formSubmitted = true;
    let obj = {
      id: "",
      name: this.enquiryform.value.name,
      companyName: this.enquiryform.value.companyName,
      emailid: this.enquiryform.value.email,
      mobile: this.countryCodeLabel+"-"+this.enquiryform.value.mobile,
      contactMode: this.enquiryform.value.preferredcontactmode,
      category: this.enquiryform.value.helpyoutoday,
      enquiryAbout: this.enquiryform.value.about,
      question: this.enquiryform.value.message,
      consent: this.enquiryform.value.termscondition,
      // customerIP: this.enquiryform.value.,
      //status: 
    }
    this.footerservice.submitquestion(obj).subscribe(resp => {
      this.enquiryform.reset();
      this.messagePlaceholder = "";
      this.toastr.success("Your request has been submitted successfully!");
      // this.router.navigate(['/home']);
    });
  }
getIndividualCustomer(indi) {
    let individualObj = { "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '' }
    this.footerservice.updatemyAccAppsDetails(indi, individualObj).subscribe(data => {
        if(data && data.body && data.body.length > 0) {
            let myacc = data.body;
            if (myacc && myacc.length > 0 && myacc[0].custRelatedParty && myacc[0].custRelatedParty.length > 0 && myacc[0].custRelatedParty[0].individual && myacc[0].custRelatedParty[0].individual.indvContactMedium && myacc[0].custRelatedParty[0].individual.indvContactMedium.length > 0) {
                var indvContactMedium = myacc[0].custRelatedParty[0].individual.indvContactMedium;
                var contactEmailIdObj = indvContactMedium.find(element => element.type == "contactEmailId");
                if (contactEmailIdObj && contactEmailIdObj.characteristic) {
                    var emailAddress = contactEmailIdObj.characteristic.emailAddress;
                    this.enquiryform.controls.email.setValue(emailAddress);
                }
            }
        }
    })
 }

}
