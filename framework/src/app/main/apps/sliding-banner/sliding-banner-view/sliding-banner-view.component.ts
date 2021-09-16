import { Component, OnInit, ElementRef, Input, HostListener } from '@angular/core';
import { SlidingBannerService } from '../sliding-banner.service'
import { AppService } from "src/app/app.service";

@Component({
  selector: 'app-sliding-banner-view',
  templateUrl: './sliding-banner-view.component.html',
  styleUrls: ['./sliding-banner-view.component.css']
})

export class SlidingBannerViewComponent implements OnInit {
  @Input() uiFramework: string;
  loginOrlogout = "";

  title1: string = "Great minds think like us.";
  title2: string = "Secure your cloud from evolving threats";
  title3: string = "Unleash the full potential of your SAP Systems on AWS";
  title4: string = "How ready are you to migrate workloads to the cloud?";
  title5: string = "Work remotely, work securely with a cloud desktop solution";
  desc1: string = "On your transformation journey, having an ally makes all the difference. You can now leverage Amazon Web Services (AWS) with the help of AWS-certified cloud experts from Singtel.";
  timeInterval: number = 5000;
  dragBoolean: boolean = false;

  constructor(private slidingBannerService: SlidingBannerService, private customerService: AppService) { }
  bannerConfigurations: any = [];
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.getBannerDrag();
  }

  ngOnInit() {
    this.customerService.loginOrLogout.subscribe(data => { this.loginOrlogout = data; });
    this.getBannerDrag();
    this.slidingBannerService.getAllBannersConfiguration().subscribe(res => {
      if (res && res.body) {
        let data = res.body;
      }
    })
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.customerService.loginOrLogout.subscribe(data => { this.loginOrlogout = data; });
    }, 1000);
  }

  getBannerDrag() {
    if (window.innerWidth > 1024) {
      this.dragBoolean = false;
      this.bannerConfigurations = [
        { "img": "./assets/banner/Cloud_ImagesBanner_Desktop_AWS_W1440xH480px.png", "title": this.title1, "desc": this.desc1 },
        { "img": "./assets/banner/security-adjustment-desktop.jpg", "title": this.title2, "desc": "" },
        { "img": "./assets/banner/wood-blocks-desktop.jpg", "title": this.title3, "desc": "" },
        { "img": "./assets/banner/rating-desktop.jpg", "title": this.title4, "desc": "" },
        { "img": "./assets/banner/cloud-shield-desktop.jpg", "title": this.title5, "desc": "" }
      ];
    }
    else if ((window.innerWidth <= 1024) && (window.innerWidth > 769)) {
      this.bannerConfigurations = [
        { "img": "./assets/banner/tabmobile/Cloud_ImagesBanner_Desktop_AWS_W1024X450.png", "title": this.title1, "desc": this.desc1 },
        { "img": "./assets/banner/tabmobile/security-adjustment-desktop1024X450.png", "title": this.title2, "desc": "" },
        { "img": "./assets/banner/tabmobile/wood-blocks-desktop1024X450.png", "title": this.title3, "desc": "" },
        { "img": "./assets/banner/tabmobile/rating-desktop1024X450.png", "title": this.title4, "desc": "" },
        { "img": "./assets/banner/tabmobile/cloud-shield-desktop1024X450.png", "title": this.title5, "desc": "" }
      ];
      this.dragBoolean = false;
    }
    else if (window.innerWidth <= 768) {
      this.bannerConfigurations = [
        { "img": "./assets/banner/tabmobile/Cloud_ImagesBanner_Desktop_AWS_W700X450.png", "title": this.title1, "desc": this.desc1 },
        { "img": "./assets/banner/tabmobile/security-adjustment-desktop700X450.png", "title": this.title2, "desc": "" },
        { "img": "./assets/banner/tabmobile/wood-blocks-desktop700X450.png", "title": this.title3, "desc": "" },
        { "img": "./assets/banner/tabmobile/rating-desktop700X450.png", "title": this.title4, "desc": "" },
        { "img": "./assets/banner/tabmobile/cloud-shield-desktop700X450.png", "title": this.title5, "desc": "" }
      ];
      this.dragBoolean = false;
    }
  }

}