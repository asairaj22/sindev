import { Component, OnInit, ElementRef } from '@angular/core';
import { AppService } from "src/app/app.service";
import {Location} from '@angular/common';
import { Router } from '@angular/router';

declare var require: any
const FileSaver = require('file-saver');
@Component({
  selector: 'app-termsandcondition',
  templateUrl: './termsandcondition.component.html',
  styleUrls: ['./termsandcondition.component.css']
})
export class TermsandconditionComponent implements OnInit {

  constructor(private  elemRef: ElementRef,private termsandconditionservice: AppService, private _location: Location, private router: Router) { }
  termscontent;
  termsurl;
  blob
  ngOnInit() { 
    this.termsandconditionservice.getAllFeaProductsTestimonials().subscribe(resp => {
      var  content = resp.body.find(x => x["SingtelTerms"]);
      this.termscontent = content.SingtelTerms[0].metadata;
      this.termsurl = "../../../.."+content.SingtelTerms[0].value;
    });
  }
  downloadPdf( ) {
    const pdfUrl = this.termsurl;
    const pdfName = 'Singtel_myBusiness_TnCV1_7.pdf';
    FileSaver.saveAs(pdfUrl, pdfName);
  }

  onGoback() {
    if(sessionStorage && sessionStorage.getItem('gotoBack')) {
      this.router.navigate([sessionStorage.getItem('gotoBack')]);
    } else {
      this.router.navigate(['/home']);
    }
    // this._location.back();
  }

}