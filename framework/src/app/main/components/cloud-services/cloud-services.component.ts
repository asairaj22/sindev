import { Component, OnInit, HostListener, ViewChild, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "./common.service";
import { AppService } from "src/app/app.service";



@Component({
  selector: 'app-cloud-services',
  templateUrl: './cloud-services.component.html',
  styleUrls: ['./cloud-services.component.css']
})
export class CloudServicesComponent implements OnInit {

  isSticky: boolean = false;
  scrollHeightAWS: any = 0;
  scrollHeightAzure: any = 0;
  scrollHeightgcp: any = 0;
  aws = "aws";
  gcp = "gcp";
  tempCount: number = 0;
  azure = "azure";
  highLightWhyChooseSingtel: boolean = false;
  @ViewChildren('items') items: QueryList<ElementRef>;
  @ViewChild('fixedBox', { static: false }) fixedBox: ElementRef;
  wrapperheight = 0;
  headerHeight = 0;
  subHeaderHeight = 0;
  fixedBoxOffsetTop: number = 0;
  fixedBoxOffsetTopOtherMethod: number = 0;
  exceedScrollLimit: boolean = false;
  cloudExist: boolean = false;
  stickyDivOffset: any;
  loginOrlogout = "";
  lastScrollTop = 0;
  topReach: boolean = false;
  @HostListener('window:scroll', ['$event'])
  checkScroll() {

    if (window.pageYOffset >= 344 && window.pageYOffset <= 700) {
      this.highLightWhyChooseSingtel = true;
      for (let i = 0; i < this.subName.length; i++) {
        this.subName[i].highLighted = false;
      }
    }
    else {
      this.highLightWhyChooseSingtel = false;
      for (let i = 0; i < this.subName.length; i++) {
        if (window.pageYOffset >= this.subName[i].offset &&
          window.pageYOffset <= this.subName[i].offset + this.subName[i].offsetHgt) {
          this.subName[i].highLighted = true;

        }
        else {
          this.subName[i].highLighted = false;

        }
      }
    }

    this.isSticky = window.pageYOffset >= 620;

    if (window.pageYOffset >= (this.stickyDivOffset + 60)) {
      this.cloudExist = true;
    }
    else if (window.pageYOffset >= (this.stickyDivOffset - (window.innerHeight - 130))) {

      this.cloudExist = false;
    }


    this.getScrollEvent();
    // var windowScroll = this.fixedBoxOffsetTop - this.wrapperheight;
    // var scrollHeight = window.pageYOffset + this.wrapperheight;

    // if (scrollHeight >= windowScroll && window.pageYOffset != 0) {
    //   this.exceedScrollLimit = true;
    // } else if (window.pageYOffset < windowScroll) {
    //   this.exceedScrollLimit = false;
    // }
  }

  scrollAWS(el: HTMLElement) {
    el.scrollIntoView();
    this.scrollHeightAWS = 64;
    this.scrollHeightAzure = 0;
    this.scrollHeightgcp = 0;

  }
  scrollAzure(el: HTMLElement) {
    el.scrollIntoView();
    this.scrollHeightAzure = 64;
    this.scrollHeightAWS = 0;
    this.scrollHeightgcp = 0;

  }
  scrollGcp(el: HTMLElement) {
    el.scrollIntoView();
    this.scrollHeightgcp = 64;
    this.scrollHeightAzure = 0;
    this.scrollHeightAWS = 0;

  }


  getScrollEvent() {
    let st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > this.lastScrollTop) {
      //  this.customerService.scrollUp = true;
      //   this.customerService.pageNameFind = st;
      if (st > 60) {
        this.topReach = true;
      }
    } else {
      this.topReach = false;
      // this.customerService.pageNameFind = st;
      // this.customerService.scrollUp = false;
    }
    this.lastScrollTop = st <= 0 ? 0 : st;
  }

  scrollApp(el, index) {
  
    // document.documentElement.scrollTop = el.offset - this.wrapperheight;
    if (index === 0) {
      document.documentElement.scrollTop = el.offset;
      // document.documentElement.scrollTop = el.offset - 96;
    }
    else {
      document.documentElement.scrollTop = el.offset + 10;
    }
    // document.body.scrollTop = el.offset + 100 - this.wrapperheight;
   
    this.scrollHeightgcp = 64;
    this.scrollHeightAzure = 0;
    this.scrollHeightAWS = 0;
    // Scroll Issue
    if(index == 0) {
      this.scrollHeightAWS = 100;
    }
    this.showToggle = false;
    this.getClickScroll();
  }

  filterProps: any = {
    "isBundle": "true",
    "category": [
      "Cloud Services"
    ],
    "status": [
      "Launched",
      "Active"
    ]
  };

  products: any;
  routeType: string;
  subName: any = [];


  constructor(
    private router: Router,
    private commonService: CommonService,
    private customerService: AppService,
    private activatedRoute: ActivatedRoute

  ) { }

  ngOnInit(): void {
    this.customerService.cloudPageBoolean = true;
    this.activatedRoute.params
      .subscribe((params) => {
        this.routeType = params.type;
        this.filterProps.category = [this.routeType];
        this.fetchProductCategory();
      });

    this.customerService.headerheight.subscribe(
      data => {
        this.headerHeight = data;

      }
    );
    this.customerService.subHeaderheight.subscribe(
      data => {
        this.subHeaderHeight = data;
      }
    );
    this.customerService.loginOrLogout.subscribe(
      data => {
        this.loginOrlogout = data;
      }
    );

  }

  getClickScroll() {
    let st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > this.lastScrollTop) {
      this.customerService.scrollUp = true;
      this.customerService.pageNameFind = st;
      if (st > 60) {
        this.topReach = true;
      }  
      return false;
    } else {
      this.topReach = false;
      this.customerService.pageNameFind = st;
      this.customerService.scrollUp = false;
     
      return false;
    }
    this.lastScrollTop = st <= 0 ? 0 : st;

  }

  ngAfterViewInit(): void {
    this.stickyDivOffset = this.fixedBox.nativeElement.offsetTop;
    this.wrapperheight = this.headerHeight + this.subHeaderHeight;
    setTimeout(() => {
      this.customerService.loginOrLogout.subscribe(
        data => {
       
          this.loginOrlogout = data;
        }
      );
    }, 1000);

  }

  afterViewInit() {
    const rect = this.fixedBox.nativeElement.getBoundingClientRect();
    this.fixedBoxOffsetTop = rect.top + window.pageYOffset - document.documentElement.clientTop;
  }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.wrapperheight = this.headerHeight + this.subHeaderHeight;
  }
  showToggle: boolean = false;
  toggleMobile() {
    this.showToggle = !this.showToggle;
  }



  routeProdDetail(num) {
    if (this.routeType == 'Cloud Services') {
      this.router.navigateByUrl(
        `/cloud-services/${this.routeType}/product-details/` + num
      );
    }
  }

  fetchProductCategory() {

    this.commonService.getProductCategory(this.filterProps).subscribe((res: any) => {
      this.products = res.body;
      this.products.sort(function (a, b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
      });

      this.subName = [];
      for (let i = 0; i < this.products.length; i++) {
        // for testimonial 
        if (this.products[i].testimonials != undefined && this.products[i].testimonials.length > 0) {
          this.products[i].testimonialShortMsg = this.products[i].testimonials[0].shortMsg;
          this.products[i].testimonialAvatar = this.products[i].testimonials[0].avatar;
          this.products[i].testimonialUserName = this.products[i].testimonials[0].userName;
          this.products[i].testimonialUserDesignation = this.products[i].testimonials[0].userDesignation;
          this.products[i].testimonialUserCompany = this.products[i].testimonials[0].userCompany;
        }


        for (let j = 0; j < this.products[i].catagory_name.length; j++) {
          // for short name 
          if (this.products[i].catagory_name[j] == 'Cloud Services' &&
            (this.products[i].name == 'Singtel Cloud Service (AWS)' ||
              this.products[i].name == 'Singtel Cloud Service (Azure)' ||
              this.products[i].name == 'Essential Cloud Resell (GCP)')) {
            let splitName = this.products[i].name.split("Singtel Cloud Service (")[1] || this.products[i].name.split("Essential Cloud Resell (")[1];
            let splitName2 = splitName.split(")")[0];
            this.subName.push({ "name": splitName2, highLighted: false });
          }
          else if (this.products[i].catagory_name[j] == 'Office 365') {
            this.subName.push({ "name": this.products[i].name, highLighted: false });
          }
        }

      }
      this.subName.sort(function (a, b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
      });

      this.afterViewInit();

    },
      (err) => {

      })
  }

  scrollfunction(item, i, offsetHeight, whyChoose) {
    if (this.subName.length > 0) {
      if (i == 0) {
        this.subName[i].offset = whyChoose.offsetTop + whyChoose.offsetHeight;
        this.subName[i].offsetHgt = offsetHeight;
      } else {

        this.subName[i].offset = this.subName[i - 1].offset + this.subName[i - 1].offsetHgt;
        this.subName[i].offsetHgt = offsetHeight;
      }
    }
  }
  scrollToDiv(el: HTMLElement) {
    // document.documentElement.scrollTop = el.offsetTop  - 300 - this.wrapperheight; 
    document.documentElement.scrollTop = 480;
    document.body.scrollTop = 480;
    // document.documentElement.scrollTop = el.offsetTop + 50 - this.wrapperheight;
    // document.body.scrollTop = el.offsetTop + 50 - this.wrapperheight;
    // this.exceedScrollLimit = true;
    // document.documentElement.scrollTop = el.offsetTop - 100;
    this.showToggle = false;
    this.getClickScroll();

    this.highLightWhyChooseSingtel = true;
    for (let i = 0; i < this.subName.length; i++) {
      this.subName[i].highLighted = false;
    }
  }

}



