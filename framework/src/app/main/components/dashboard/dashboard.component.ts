import {Component,  OnInit,  Output,  Renderer2,  ElementRef,  ViewChild,HostListener} from "@angular/core";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";
import { EventEmitter } from "protractor";
import { AppService } from "src/app/app.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "src/app/platform/util/api.service";
declare var $: any;

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit {
  products:any = [];
  emptyProduct:any = {};
  isFirstLogin:boolean = false;
  assignPopupProdLogo:string;
  currentSelectedProdItem:any;
  // ********** alert are not for phase 1A. so the objects inside the alerts are commented **********
  alerts = [
    // {
    //   alertTitle: "Trial Required",
    //   alertSubtitle: "Financio",
    //   buttonName: "Trial request",
    // },
    // {
    //   alertTitle: "2 users used 80% storage",
    //   alertSubtitle: "Microsoft Office 365 Security and Compliance",
    //   buttonName: "View Now",
    // },
    // {
    //   alertTitle: "Save 5% &amp; get unlimited storage with ONEOffice",
    //   alertSubtitle: "ONEOffice",
    //   buttonName: "View Now",
    // },
    // {
    //   alertTitle: "You have Freemium Apps available",
    //   alertSubtitle: "Financio",
    //   buttonName: "View Now",
    // },
    // {
    //   alertTitle: "Sample alert",
    //   alertSubtitle: "Sample category",
    //   buttonName: "View Now",
    // },
    // {
    //   alertTitle: "Sample alert",
    //   alertSubtitle: "Sample category",
    //   buttonName: "View Now",
    // },
  ];

  
  awsResellApps = [
    {
      appHeaderName: "",
      isStacked: "true",
      appLogo: "./assets/images/dashboard/app-logo/512px-Amazon_Web_Services_Logo.svg-2.png",
      appFooterName: "Essential Cloud Resell (AWS)",
      appFooterSubtitle: "Instance Name1",
      star: "false",
      tilename:"aws",
      isMenuOpen:false
    },
    {
      appHeaderName: "TRAIL",
      isStacked: "false",
      appLogo: "./assets/images/dashboard/app-logo/512px-Amazon_Web_Services_Logo.svg-2.png",
      appFooterName: "Essential Cloud Resell (AWS)",
      appFooterSubtitle: "Instance Name1",
      star: "false",
      tilename:"aws",
      isMenuOpen:false
    },
    {
      appHeaderName: "Provisioning In Progress",
      isStacked: "true",
      appLogo: "./assets/images/dashboard/app-logo/512px-Amazon_Web_Services_Logo.svg-2.png",
      appFooterName: "Essential Cloud Resell (AWS)",
      appFooterSubtitle: "",
      star: "false",
      tilename:"aws",
      isMenuOpen:false
    },
    {
      appHeaderName: "User Not Assigned",
      isStacked: "false",
      appLogo: "./assets/images/dashboard/app-logo/512px-Amazon_Web_Services_Logo.svg-2.png",
      appFooterName: "Essential Cloud Resell (AWS)",
      appFooterSubtitle: "Instance Name1",
      star: "false",
      tilename:"aws",
      isMenuOpen:false
    },
    {
      appHeaderName: "",
      isStacked: "false",
      appLogo: "./assets/images/dashboard/app-logo/512px-Amazon_Web_Services_Logo.svg-2.png",
      appFooterName: "Essential Cloud Resell (AWS)",
      appFooterSubtitle: "Instance Name",
      star: "false",
      tilename:"",
      isMenuOpen:false
    }
  ];

  stackedproducts = true;
  awscloudReselClick = false;
  loginUserEmail: string;
  itemIndex;
  sortedApps;

  public config: SwiperConfigInterface = {
    a11y: true,
    direction: "horizontal",
    slidesPerView: 1,
    keyboard: true,
    mousewheel: true,
    scrollbar: false,
    navigation: true,
    autoplay: {
      delay: 2000,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      hideOnClick: false,
    },
  };

  // @Output() alertOutput = new EventEmitter<number>();

  /**
   * This is the toogle button elemenbt, look at HTML and see its defination
   */

  @ViewChild("menu", { static: false }) menu: ElementRef;
  @ViewChild("toggleButton", { static: false }) toggleButton: ElementRef;
  @ViewChild("menuothers", { static: false }) menuothers: ElementRef;
  @ViewChild("logo", { static: false }) logo: ElementRef;

  isMenuOpen = false;
  office365Products;
  showProductBundle:boolean = false;
  showSubBundle:boolean = false;
  custId:any;
  constructor(private appService: AppService,private renderer: Renderer2,private router: Router,private activatedRoute: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    this.appService.passValue(this.alerts.length);
    this.fetchCustomerInventory();
    this.custId = sessionStorage.getItem('customerId');
    this.loginUserEmail = sessionStorage['ep-username'];
    var userAccountDetails = JSON.parse(sessionStorage.getItem('userAccountDetails'));
    if(userAccountDetails && userAccountDetails.isFirstLogin){
      this.isFirstLogin = true;
    } else {
      this.isFirstLogin = false;
    }
  }

  fetchCustomerInventory() {
    let id =sessionStorage.getItem('customerId');
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.appService.getCustomerInventory(id, individualObj).subscribe((res: any) => {
        if(res.body instanceof Array){
          this.products = res.body;
        if(this.products.length > 0)
        {
          this.showProductBundle = true; 
        this.products.forEach((prod)=>{
          prod.star = false;
        });
       
        }
        }
        else{
          
          this.emptyProduct = Object.assign({}, res.body);
        }
      },
        (err) => {
         
        });

  }

  showStackedProducts(tilename) {

    this.router.navigate(['/dashboard/cloud-resell-apps']);
    sessionStorage.setItem("appname","office365")

  }

  removeAlerts(i) {
    this.alerts.splice(i, 1);
    this.appService.passValue(this.alerts.length);
  }
getSubBundleProduct:any = [];

navigateToResell(item){
  this.getSubBundleProduct.push(item);
 
  if(this.getSubBundleProduct.length > 0)
  { 
    this.showSubBundle = true;
    this.showProductBundle = false;
    
  }
  // this.appService.passCloudResellAccDetails(item);
  //    this.router.navigate(['/dashboard/cloud-resell-apps']);

}

backToShop(){
  this.showSubBundle = false;
    this.showProductBundle = true;
    this.getSubBundleProduct = [];
}



navigateToResellOffice365(item){
  this.appService.passCloudResellAccDetailsOffice365(item);
  this.router.navigate(['/dashboard/cloud-resell-apps']);
}

navigateToCloudResell(item){
  if(this.loginUserEmail && item && item.subscriptionId && item.subscriptionId.length > 0 && (item.subscriptionId.indexOf(this.loginUserEmail)) != -1) {
    this.appService.passCloudResellAccDetails(item);
    sessionStorage.setItem("dashboard-cloudService", this.apiService.crypto.encrypt(JSON.stringify(item)));
    this.router.navigate(['/dashboard/cloud-resell-apps']);
  }
  else if(item.subscriptionStatus!=="true" && item.status=="Active"){
    this.assignPopupProdLogo = item.productLogo;
    this.currentSelectedProdItem = item;
   $("#assignUsersPopup").modal();
  } else {
    $("#userAssignedPopup").modal();
  }  
}

  toggleMenu(index) {
    this.itemIndex = index;
  }

  receiveMessage(event){
    
  }

setId:number = 0;
setEmpty:boolean = false;
dummyID:number = 0;
toggleSetting(id){
if(this.setId == 0 || this.setId != id)
{
  this.setId = id;
  this.setEmpty = false;
}
else{
  this.setEmpty = true;
}
}

@HostListener('document:click')
  clickout() {
    if(this.dummyID != this.setId)
    {
      this.dummyID = this.setId;
    }
    else
    {
      this.dummyID = 0;
      this.setId = 0;
    }
    
    // if (this.setEmpty == true) {
    //   alert(this.setId+" click outside");
    //   this.setId = 0;
    // }
    // else{
    //   alert(this.setEmpty);
    // }
  }
  gotToAssignUsers(){
    $("#assignUsersPopup").hide();
    this.getUserSettingsDetails(this.currentSelectedProdItem);
  }

getUserSettingsDetails(product){
  this.appService.manageUserObj = []; 
let obj = 
  {
  "id":this.custId,
  "ECDM_PRODUCT_id": product.id,
  "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
}

this.appService.getUserSettingsDetails(obj).subscribe((res: any) => {
        let productsDetails = {
          "logo":product.productLogo,
          "productName":product.productName,
          "saasId":product.saasId,
          "instanceName":product.instanceName,
          "productId":product.id,
          "subscriptionType":product.subscriptionType ? product.subscriptionType : "NIL",
          "pricePlan":product.pricePlan ? product.pricePlan : "NIL"
        }
          this.appService.manageUserObj.push({"product":productsDetails,"data":res.body, });
          this.router.navigate(['/my-apps/my-apps-detail']);
      });
}

}
