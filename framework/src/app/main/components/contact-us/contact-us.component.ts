import { Component, OnInit, ElementRef,Inject } from '@angular/core';
import { AppService } from "src/app/app.service";
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import * as CountryCodes from "src/app/countryCode.json";
import { Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from "../../../platform/util/api.service";

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})

export class ContactUsComponent implements OnInit {
  public enquiryform: FormGroup;
  countryCodes: any = CountryCodes;
  messagePlaceholder: any;
  contactName: string;
  contactEmail: string;
  contactMobile: any;
  searchText: any;
  submitted: boolean = false;
  countryCodeLabel: string = "+65";
  customerphoneNumber: any;
  showErrorMessage: any;
  accountDetails: any;
  phoneDropdown: boolean = false;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  category = [];
  preferredCountries: CountryISO[] = [CountryISO.Qatar];
  termsurl: string;

  constructor(private router: Router, private elemRef: ElementRef, private apiService: ApiService,
  public dialogRef: MatDialogRef<ContactUsComponent>,
  public dialog: MatDialog,
  private eRef: ElementRef,
  @Inject(MAT_DIALOG_DATA) public data: any,
  private contactservice: AppService,private toastr:ToastrService,
  private _formBuilder: FormBuilder) {
    this.enquiryform = _formBuilder.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      mobile: ["",Validators.minLength(8)],
      preferredcontactmode: ["",Validators.required],
      message: ["", Validators.required],
      termscondition: ["", Validators.required],
      mobileSearch: [""],
      recaptcha: ['', Validators.required]
    })
  }

  get f() {
    return this.enquiryform.controls;
  }

  ngOnInit() {
     if (sessionStorage && sessionStorage.getItem("userAccountDetails") && JSON.parse(sessionStorage.getItem("userAccountDetails")) && JSON.parse(sessionStorage.getItem("userAccountDetails")).id) {
      this.getIndividualCustomer(JSON.parse(sessionStorage.getItem("userAccountDetails")).id);
    }
    if(sessionStorage.getItem('TermsCondition')) {
      this.termsurl = this.apiService.crypto.decrypt(sessionStorage.getItem("TermsCondition"));
    }
    // this.contactservice.getTermsConditonPdf().subscribe(resp => {
    //   if(resp && resp.body && resp.body.pdf) {
    //     this.termsurl = resp.body.pdf;
    //   } else {
    //     this.termsurl = '';
    //   }
    // });

    this.router.events.pipe(filter((e: any) => e instanceof RoutesRecognized), pairwise()).subscribe((e: any) => {
      sessionStorage.setItem('gotoHistory', e[0].urlAfterRedirects);    
    });

    this.contactservice.getcontactcategory().subscribe(resp => {
      this.category = resp.body;
    });
    this.accountDetails = JSON.parse(sessionStorage.getItem('userAccountDetails'));
    this.enquiryform.controls.name.setValue(this.accountDetails.name);
    // this.enquiryform.controls.email.setValue(this.accountDetails.loginid);
    this.enquiryform.controls.mobile.setValue(this.accountDetails.phoneno);

  }
  // get enquiryformControl() {
  //   return this.enquiryform.controls;
  // }
  handleSuccess(e) {

  }

  onSubmit() {
    this.submitted = true;
    let contactMob = "+"+""+this.countryCodeLabel +"-"+ this.enquiryform.controls.mobile.value;
    let concatMob = contactMob.slice(-(contactMob.length - 1));
    let obj = {
      id: "",
      name: this.enquiryform.controls.name.value,
      emailid: this.enquiryform.controls.email.value,
      mobile: concatMob,
      category: this.enquiryform.controls.preferredcontactmode.value,
      question: this.enquiryform.controls.message.value,
      consent: this.enquiryform.controls.termscondition.value
    }
    this.contactservice.submitcontact(obj).subscribe(resp => {
      // this.enquiryform.setValue({
      //   name: "",
      //  email: "",
      //  mobile: "",
      //  preferredcontactmode: "",
      //  message: "",
      //  termscondition: ""
      // });
      this.toastr.success("Your request has been submitted successfully!");
      this.dialogRef.close();
      // this.router.navigate(['/home']);
    });
    
  }
  getCountryList() {
    this.phoneDropdown = !this.phoneDropdown;
  }
  getparticularCountry(dialcode) {
    this.countryCodeLabel = dialcode;
    this.getCountryList();
    this.searchText = "";
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  enquiryChanged(event) {
   
    if (event.target.selectedIndex && event.target.selectedIndex > 0) {
      if (this.category[(event.target.selectedIndex - 1)].enquiryAbout == "General Feedback") {
        this.messagePlaceholder = "Hi, where can I find the user guides for the products listed in your marketplace?";
      }
      else if (this.category[(event.target.selectedIndex - 1)].enquiryAbout == "Sales Enquiry") {
        this.messagePlaceholder = "Hi, I need multiple instances of AWS cloud product listed in your marketplace."
      }
      else if (this.category[(event.target.selectedIndex - 1)].enquiryAbout == "Technical Enquiry") {
        this.messagePlaceholder = "How do I migrate my existing AWS instance to your marketplace?"
      }
      else if (this.category[(event.target.selectedIndex - 1)].enquiryAbout == "App Suggestion -Tell us what other apps do you want?") {
        this.messagePlaceholder = "Hi, I would like to purchase microsoft 365 from your marketplace."
      }
      else if (this.category[(event.target.selectedIndex - 1)].enquiryAbout == "Trial Enquiry") {
        this.messagePlaceholder = "How can I avail trial for Microsoft 365?"
      }
      else {
        this.messagePlaceholder = "How do I migrate my existing AWS instance to your marketplace?"
      }
    }
  }

  onGoback() {
    if (sessionStorage && sessionStorage.getItem('gotoHistory')) {
      this.router.navigate([sessionStorage.getItem('gotoHistory')]);
      sessionStorage.removeItem('gotoHistory');
    } else {
      this.router.navigate(['/home']);
    }
  }

  gotoTerms() {
    this.router.navigate(['/terms']);
    sessionStorage.setItem('gotoBack', '/contact-us')
  }
  getIndividualCustomer(indi) {
    let individualObj = { "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : '' }
    this.contactservice.updatemyAccAppsDetails(indi, individualObj).subscribe(data => {
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