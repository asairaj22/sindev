import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from "src/app/app.service";
import jsPDF from 'jspdf';
import html2canvas from "html2canvas";
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-billing-details',
  templateUrl: './billing-details.component.html',
  styleUrls: ['./billing-details.component.css'],
  providers:[DatePipe]
})
export class BillingDetailsComponent implements OnInit {
  selecteBillingDetails: any;
  selectedSubscriptionDetails: any;
  convertedBase64PdtImage: any;
  convertedBase64CmnyImage: any;

  @ViewChild('invoiceContent', { static: false }) invoiceContent: ElementRef;

  constructor(private elemRef: ElementRef, private router: Router, private route: ActivatedRoute, private marketProductservice: AppService, private http: HttpClient,private datepipe:DatePipe) { }

  ngOnInit() {
    this.marketProductservice.selectedBillingInvoiceCurrent.subscribe((value: any) => {
      this.selecteBillingDetails = value;

      let billingDate = this.selecteBillingDetails.billingYearMonth;
      if(this.selecteBillingDetails && this.selecteBillingDetails.usageAmount){
      if(this.selecteBillingDetails.usageAmount.startsWith('$')){
        this.selecteBillingDetails.usageAmount = this.selecteBillingDetails.usageAmount.substring(1);
      }
      this.selecteBillingDetails.usageAmount = this.selecteBillingDetails.usageAmount;
      }
      let billingDateArr = billingDate.split(" ");
      let monthname = billingDateArr[0];
      // let billingYearMonth = billingDateArr[1] + "" + (new Date(Date.parse(monthname + " 1, 2012")).getMonth() + 1);
     // let billingYearMonth = this.datepipe.transform(this.selecteBillingDetails.billingYearMonth,"yyyyMM");
      let inputObj = {
        "billingYearMonth": this.selecteBillingDetails.billingYearMonth,
        "orbCloudBillAccId": (this.selecteBillingDetails && this.selecteBillingDetails.cloudAccountNumber) ? this.selecteBillingDetails.cloudAccountNumber : '',
        "saasId": (this.selecteBillingDetails && this.selecteBillingDetails.saasID) ? this.selecteBillingDetails.saasID : '',
        "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
      };
      this.marketProductservice.getOrbiteraBillingSubscriptionDetails(inputObj).subscribe((res: any) => {
        this.selectedSubscriptionDetails = res.body;
      });
      this.onConvertPdtImageBase64();
      this.onConvertCmnyImageBase64();
    });


  }
  navToReports() {
    this.router.navigate([
      'appdashboard'
    ]);
  }

  onConvertPdtImageBase64() {
    this.http.get(this.selecteBillingDetails.productLogo, { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.convertedBase64PdtImage = reader.result;
        }
        reader.readAsDataURL(res);
      });
     
  }
  onConvertCmnyImageBase64() {
    this.http.get('./assets/images/logo/Singtel_billing_footer_logo.png', { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.convertedBase64CmnyImage = reader.result;
        }
        reader.readAsDataURL(res);
      });
     
  }

  /*  Download invoice*/
  public downloadPDF() {
    // var inputData = document.getElementById('invoiceContent');
    let inputData = this.invoiceContent.nativeElement;
    html2canvas(inputData, { allowTaint: true, useCORS: true }).then((canvas:any) => {
      // document.body.appendChild(canvas);
      const contentDataURL = canvas.toDataURL('image/png');
      let pdf = new jsPDF('p', 'mm', 'a4');
      let imgWidth = 208;
      let imgHeight = canvas.height * imgWidth / canvas.width;
      let position = 2;
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)
      pdf.save('billing_invoice.pdf');
    });

  }

}