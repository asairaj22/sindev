import { Component, OnInit, ElementRef } from '@angular/core';
import { AppService } from "src/app/app.service";
import { Location } from '@angular/common';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit {
  aboutuscontent = "";
  constructor(private elemRef: ElementRef, private aboutusservice: AppService, private _location: Location, private router: Router) { }

  ngOnInit() {
    this.router.events.pipe(filter((e: any) => e instanceof RoutesRecognized), pairwise()).subscribe((e: any) => {
      sessionStorage.setItem('gotoHistory', e[0].urlAfterRedirects);
    });
    
    this.aboutusservice.getAllFeaProductsTestimonials().subscribe(resp => {
      var content = resp.body.find(x => x["SingTelAboutUs"]);
      this.aboutuscontent = content.SingTelAboutUs[0].value
    });
    // this.aboutuscontent = '<section class=""><div class="container"><div class="row justify-content-center"><div class="col-lg-9"><div class="wysiwyg-content my-0"><h1 class="my-3 text-center">About Us</h1><p class="text-justify">Brought to you by Singtel, Matrix is the largest one-stop <a href="javascript:void(0)">Software-as-a-Service (SaaS)</a> marketplace for Small and Medium Enterprises in Singapore. The portal focuses on simplifying SMEs ICT adoption journey, facilitating online collaboration and helps to deliver business advantages through SaaS productivity solutions. </p><strong>One login - One monthly bill - One helpdesk for support</strong><p class="text-justify">Simplifying IT with easy-to-use business productivity apps, Matrix <a href="javascript:void(0)">Catalogue</a> of SaaS apps contains a variety of online productivity tools to ensure all the necessities of your business are covered by these 6 categories: Office &amp; Email, Backup &amp; Security, Website &amp; Hosting, Accounting &amp; HR and Marketing &amp; eCommerce.</p><p class="text-justify">The platform provides enterprise grade capabilities as IT-as-a-Service to SMEs to centrally self serve (register, buy, trial, pay, recontract), manage (user, license); with immediate service provisioning and single-sign-on to multiple apps. </p><p class="text-justify">Start your digital journey with Singtel Matrix today.</p></div></div></div></div></section>';
  }

  onGoback() {
    if (sessionStorage && sessionStorage.getItem('gotoHistory')) {
      this.router.navigate([sessionStorage.getItem('gotoHistory')]);
      sessionStorage.removeItem('gotoHistory');
    } else {
      this.router.navigate(['/home']);
    }
  }

}