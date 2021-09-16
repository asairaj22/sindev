import * as $ from "jquery";
import { Component, HostListener } from "@angular/core";
import { DndService } from "./platform/designer/dnd.service";
import { PropertyService } from "./platform/designer/property.service";
import { ApiService } from "@platform/util/api.service";
import { Router, NavigationStart, NavigationEnd } from "@angular/router";
import { filter } from 'rxjs/operators';
import { IsLoadingService } from '@service-work/is-loading';
import { AppService } from "src/app/app.service";
import { BackgroundService } from "./shared/service/background.service";
import { UserAccountDetails } from "./app";
import { Subscription } from 'rxjs';
import { PreviousRouteService } from 'src/app/shared/service/previous-router.service';
import { GlobalDataService } from 'src/app/main/services/global.service';
import { UtilService } from "src/app/widgets/platform/util.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css", "./appdemo.scss"],
})
export class AppComponent {
  userAccountDetails: UserAccountDetails = {
    id: null,
    loginid: "",
    customerid: "",
    name: "",
    role: "",
    phoneno: "",
    mobileno: "",
    fax: ""
  };

  companyDetails: any;
  getUserDetailsSubscription: Subscription;
  companyLogo: any = "";
  logoName: any = '';
  title = "Widget";
  isHeaderLoaded = false;
  time;
  showHead: boolean = false;
  headType: string = "";
  wrapperheight = 0;
  headerHeight = 0;
  subHeaderHeight = 0;
  previousUrl: string = null;
  currentUrl: string = null;

  fixedBoxOffsetTop: number = 0;
  fixedBoxOffsetTopOtherMethod: number = 0;
  exceedScrollLimit: boolean = false;
  redirectUrl: string;
  isUserLoggedIn: boolean = false;
  loginInSubscription: Subscription;

  constructor(
    private dndService: DndService,
    private propertyService: PropertyService,
    private apiService: ApiService,
    private customerService: AppService,
    public backgroundService: BackgroundService,
    private router: Router,
    private previousRouteService: PreviousRouteService,
    private isLoadingService: IsLoadingService,
    private globalDataService:GlobalDataService,
    private utilService:UtilService
  ) {
    this.showHead = false;
    apiService.language.setDefault("en");
    this.redirectUrl = this.apiService.accountName + "/" + this.apiService.appName + "/" + "pages/auth/login";
    if (sessionStorage.getItem("ep-username") !== undefined && sessionStorage.getItem("ep-username") !== null) {
      this.isUserLoggedIn = true;
      this.getAccessSets();
      // Environment Check
      const pathSplittedArray = location.pathname.split('/');
      var accountName = pathSplittedArray[1];
      let env = { 'href': location.origin, 'content': accountName}
      this.customerService.environmentcheck(env).subscribe((res:any)=>{
        this.globalDataService.environment['isAPISuccess'] = true;
        if (res && res.body && res.body.msg == true) {
          this.globalDataService.environment['isCaptchaWhitelsit'] = true;
        }
      });
    }
    
    // on route change to '/login', set the variable showHead to false
  }
private async getAccessSets(){
// const data = await this.utilService.invokeAPI("/user/getAllAccessSet?email=" + sessionStorage['ep-username'],"GET",null,null,"cust").toPromise();
//   this.globalDataService.shareObj['userAccess'] = data.body;
}
  ngOnInit() {
    // this.resetTimer();
    this.router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        this.headType = event["url"];
        let _headType = event["url"].split('/');
        for (let i = 0; i < _headType.length; i++) {
          if (_headType[i] == 'set-password') {
            this.headType = 'set-password';
          }
        }

        if (
          event["url"] == "/login" ||
          event["url"] == "/sign-up" ||
          event["url"] == "/forgot-password" ||
          event["url"] == "/change-password" ||
          event["url"].includes("/login/") || 
          event["url"].search("/login") > -1 ||
          event["url"] == "/"
        ) {

          this.showHead = false;
          if(event["url"].includes("/login")){
            this.headType = "/login";
          }
        } else {
          this.headType = "";
          if (sessionStorage.getItem('ep-username')) {
            this.showHead = true;
          } else {
            this.showHead = false;
          }
        }
      }
    });

    this.customerService.headerheight.subscribe(
      data => {
        this.headerHeight = data;
        if (this.headerHeight != null && this.subHeaderHeight != null) {
          this.wrapperHeight();
        }
      }
    );
    this.customerService.subHeaderheight.subscribe(
      data => {
        this.subHeaderHeight = data;
        if (this.headerHeight != null && this.subHeaderHeight != null) {
          this.wrapperHeight();
        }
      }
    );



    this.customerService.headerLogoChange.subscribe(
      data => {
        if (data == "true") {
          // this.onFetchCompanyDetail();
        }
      }
    );

    this.customerService.loginOrLogout.subscribe(
      data => {
        if (data == "logout") {
          this.showHead = false;
        }
      }
    );

    //  fetching user details - this call is regarding for header menu and sun header menu component
    this.onFetchUserDetails();

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.previousUrl = this.currentUrl;
      this.currentUrl = event.url;
      this.previousRouteService.setPreviousUrl(this.previousUrl);
    });

    // check user logged in or not 
    this.loginInSubscription = this.customerService.getUserLoginStatus().subscribe(status => {
      this.isUserLoggedIn = status;
    });
    // if (sessionStorage.getItem("ep-username") !== undefined && sessionStorage.getItem("ep-username") !== null) {
    //   this.isUserLoggedIn = true;
    // }

  }

  ngAfterViewInit(): void {
    this.wrapperheight = this.headerHeight + this.subHeaderHeight;
    if (!this.showHead && this.headType !== '/login') {
      this.customerService.loginOrlogout("logout");
    } else if (!this.showHead && this.headType === '/login' && sessionStorage.getItem("ep-username") == null ) {
      this.customerService.loginOrlogout("logout");
    } else {
      this.customerService.loginOrlogout("login");
    }
  }


  onFetchUserDetails() {
    let userObj = { loginid: sessionStorage.getItem('ep-username') };

    if (userObj && userObj.loginid) {
      this.getUserDetailsSubscription = this.customerService.getuserDetails(userObj).subscribe((res) => {
        sessionStorage.setItem('userAccountDetails', JSON.stringify(res.body));
        sessionStorage.setItem('customerId', JSON.parse(sessionStorage.getItem('userAccountDetails')).customerid);
        this.userAccountDetails = res.body;
        this.customerService.manageUser = res.body.role;
        this.onFetchCompanyDetail();
      });
    }

  }

  onFetchCompanyDetail() {
    let customerid = { "id": this.userAccountDetails.customerid };

    // if (this.userAccountDetails.customerid != "") {
    this.customerService.getCompanyDetails(customerid).subscribe(res => {
      this.companyDetails = res.body;
      this.companyLogo = res.body.companyLogo;
      this.logoName = res.body.dmsDocumentName;
      sessionStorage.setItem('companyDetails', JSON.stringify(this.companyDetails));
      this.customerService.loginWizardDataPass("true");
    });
    // }
  }

  wrapperHeight() {
    this.wrapperheight = this.headerHeight + this.subHeaderHeight;
  }

  @HostListener("window:scroll", [])

  onWindowScroll() {
    var windowScroll = this.fixedBoxOffsetTop - this.wrapperheight;
    var scrollHeight = window.pageYOffset + this.wrapperheight;
    if (scrollHeight >= windowScroll && window.pageYOffset != 0) {
      this.exceedScrollLimit = true;
    } else if (window.pageYOffset < windowScroll) {
      this.exceedScrollLimit = false;
    }
  }

  updateHeaderFlag(value) {
    this.isHeaderLoaded = value;
  }
  onLogout() {
    this.getUserDetailsSubscription.unsubscribe();
    this.showHead = false;
    this.headType = "";
    Object.keys(this.userAccountDetails).forEach((item) => {
      if (item == "id") {
        this.userAccountDetails[item] = null;
      }
      else {
        this.userAccountDetails[item] = "";
      }
    });
    this.companyLogo = "";
    this.logoName = '';
    sessionStorage.clear();
  }
}