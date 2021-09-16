import { Component, OnInit, OnChanges, Input, Output, ElementRef, HostListener, ViewChild, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from "src/app/app.service";
import { DomSanitizer } from "@angular/platform-browser";
import { UserAccountDetails } from "../../../app";
import { GlobalDataService } from 'src/app/main/services/global.service';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.css']
})

export class HeaderMenuComponent implements OnInit, OnChanges {
  // @ViewChild('headerBox', { static: false }) headerBox: ElementRef;
  @Input() userAccountDetails: UserAccountDetails;
  @Input() companyLogoInput: any;
  @Input() logoNameInput: any;
  @Input() showHeader: boolean;
  @Input() headType: string;
  @Output() logoutEvent: EventEmitter<any> = new EventEmitter();

  userName: string = "";
  headerTop: boolean = false;
  firstName: string;
  companyDetails;
  getAccessSet = this.globalDataService.accessSet['home'];
  showHead: boolean;
  customerid: string = "";
  status: boolean = false;
  fixedBoxOffsetTop: number = 0;
  fixedBoxOffsetTopOtherMethod: number = 0;
  exceedScrollLimit: boolean = false;
  headerLogoDet: any;
componentName: string = "";	
behaviourImg:any;	
custId:any;

  constructor(private routes: Router, private sanitizer: DomSanitizer, private customerService: AppService,private globalDataService: GlobalDataService) { }

  ngOnInit(): void {

 this.customerService.popupComponent.subscribe(message => {	
       this.componentName = message;	
        if(this.componentName != ""){	
          this.behaviourBoolean = false;	
          this.getImageFromCompany(this.componentName);	
          // this.headerLogoDet = this.componentName;	
        }	
        });




  }

  	behaviourBoolean:boolean = false;	
  getImageFromCompany(custId){ 	
    let imgurl = sessionStorage.getItem("compLogo");	
    setTimeout(() =>{	
    this.behaviourImg = this.sanitizer.bypassSecurityTrustResourceUrl(imgurl.replace('SafeValue must use [property]=binding: ', '').replace(' (see http://g.co/ng/security#xss)', ''));	
    this.behaviourBoolean = true;	
   
          },5000);	
}

  ngOnChanges() {
    this.userName = this.userAccountDetails.name;
    this.customerid = this.userAccountDetails.customerid;
    this.showHead = this.showHeader;
    var fileFormat = 'png';
    if(this.logoNameInput) {
      fileFormat = this.logoNameInput.split(".")[1].toLowerCase();
      fileFormat = fileFormat == 'svg' ? 'svg+xml' : fileFormat;
    }
    this.headerLogoDet = this.sanitizer.bypassSecurityTrustResourceUrl(
      `data:image/` + fileFormat + `;base64, ${this.companyLogoInput}`
    );
  }

  cloudTopscroll: boolean = false;
  cloudPage: boolean = true;
  lastScrollTop = 0;

  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    this.getScrollEvent();
    // if(this.customerService.cloudPageBoolean){
    //   this.cloudPage = true;
    //   if(this.customerService.scrollUp){ 
    //       this.cloudTopscroll = false
    //   }
    //   else{
    //     this.cloudTopscroll = true;
    //   }
    // }
    // else{
   
    //   this.cloudPage = false;
    //   this.cloudTopscroll = false;
    // }

    if (window.pageYOffset > 80) {
      this.headerTop = true;
      // this.fixedBoxOffsetTop = this.headerBox.nativeElement.offsetHeight;
      // this.customerService.passHeaderheight(this.fixedBoxOffsetTop);
    }
    else {
      this.headerTop = false;
      // this.fixedBoxOffsetTop = this.headerBox.nativeElement.offsetHeight;
      // this.customerService.passHeaderheight(this.fixedBoxOffsetTop);
    }
  }

  getScrollEvent() {
    let st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > this.lastScrollTop) {
      this.customerService.scrollUp = true;
      this.customerService.pageNameFind = st;
      if (this.customerService.scrollUp) {
        this.cloudTopscroll = false
      }

    } else {
      this.customerService.pageNameFind = st;
      this.customerService.scrollUp = false;
      this.cloudTopscroll = true;
    }
    this.lastScrollTop = st <= 0 ? 0 : st;
  }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // this.fixedBoxOffsetTop = this.headerBox.nativeElement.offsetHeight;
    this.customerService.passHeaderheight(this.fixedBoxOffsetTop);
  }

  ngAfterViewInit(): void {
    setTimeout(()=>{
      // this.fixedBoxOffsetTop = this.headerBox.nativeElement.offsetHeight;
      // this.customerService.passHeaderheight(this.fixedBoxOffsetTop);
    },2000)


  }

  // @HostListener("window:scroll", [])

  // onWindowScroll() {
  //     if (window.pageYOffset > 0  && window.pageYOffset != 0) {
  //         this.exceedScrollLimit = true;
  //     } else if (window.pageYOffset == 0) {
  //         this.exceedScrollLimit = false;
  //     }
  // }

  // get headerStyles(): any {
  //     return {
  //         'font-size' : this.big ? '26px' : '14px',
  //         'color' : this.back ? 'Blue' : 'Black',
  //         'background-color' : this.back ? 'Pink' : 'White',
  //         'border' : this.bord ? '1px solid Red' : ''
  //     };
  // }

  // logout(){

  //   this.routes.navigate(["/login"]);

  // }
  clickEvent() {
    this.status = !this.status;
  }

  hidePopupMenu() {
    this.status = false;
  }

  onLogout() {
    if (sessionStorage.getItem('ep-username') && document.cookie.match('(^|;)\\s*X-XSRF-TOKEN\\s*=\\s*([^;]+)')) {
      sessionStorage.clear();
      this.customerService.setUserLoginStatus(false);
      window.location.href = "/logout";
    }

    // let url = window.location.href;
    // let urlArry = url.split('pages');
    // let reDirectUrl = urlArry[0] + 'pages/home';
    // sessionStorage.clear();
    // this.logoutEvent.emit();
    // // window.location.reload();
    // window.location.href = reDirectUrl;

    // this.showHead = false;
    // this.customerService.loginOrlogout("logout");
    // this.routes.navigate(["home"]);
    //  window.location.reload();
    // window.location.href = reDirectUrl;
  }
  getUserDetails() {
    let data = JSON.parse(sessionStorage.getItem('userDetails'));
    this.firstName = data.firstName;
  }

  onMenuChange(page: string) {
    if (page == 'my-account') {
      this.routes.navigate(["my-account"]);
    } else if (page == 'my-company') {
      this.routes.navigate(["my-company"]);
    }
  }

  onTopHeaderMenuClicked(data: string) {
    if (data == 'resources') {
      this.routes.navigate(['resources']);
    } else if (data == 'help-center') {
      this.routes.navigate(['help-center']);
    }

  }
}