import { Component, OnInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog, MatDialogRef, } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Table } from "primeng/table";
import { ApiService } from "src/app/platform/util/api.service";

export interface DialogData {
  dataKey: any;
  tilename:'';
}

@Component({
  selector: 'app-cloud-resell-apps',
  templateUrl: './cloud-resell-apps.component.html',
  styleUrls: ['./cloud-resell-apps.component.css'],
  host: {
    "(window:click)": "eventHandlingFunction($event)"
  }
})
export class CloudResellAppsComponent implements OnInit {

  consoleURL:string;
  ofcResellApps = [
    {
      appHeaderName: "",
      isStacked: "true",
      appLogo: "./assets/images/dashboard/app-logo/office365.png",
      appFooterName: "Subscribers",
      appFooterSubtitle: "Access and Manage",
      star: "false",
      tilename: "aws",
      isMenuOpen: false
     
    },
    {
      appHeaderName: "",
      isStacked: "true",
      appLogo: "./assets/images/dashboard/app-logo/office365.png",
      appFooterName: "Active/Deactive",
      appFooterSubtitle: "Access and Manage",
      star: "false",
      tilename: "aws",
      isMenuOpen: false
      
    },
    {
      appHeaderName: "",
      isStacked: "true",
      appLogo: "./assets/images/dashboard/app-logo/office365.png",
      appFooterName: "Users",
      appFooterSubtitle: "Access and Manage",
      star: "false",
      tilename: "aws",
      isMenuOpen: false
     
    },
    {
      appHeaderName: "",
      isStacked: "true",
      appLogo: "./assets/images/dashboard/app-logo/office365.png",
      appFooterName: "Coming Soon",
      appFooterSubtitle: "Access and Manage",
      star: "false",
      tilename: "aws",
      isMenuOpen: false
    },

  ]
  awsResellApps = [
    {
      appHeaderName: "",
      isStacked: "true",
      appLogo: "./assets/images/dashboard/app-logo/512px-Amazon_Web_Services_Logo.svg-2.png",
      appFooterName: "AWS Console (AWS)",
      appFooterSubtitle: "Access and Manage",
      star: "false",
      tilename: "aws",
      isMenuOpen: false,
      manageService:""
    },
    {
      appHeaderName: "Provisioning In Progress",
      isStacked: "true",
      appLogo: "./assets/images/dashboard/cloud-resell/Group2.png",
      appFooterName: "Cloud Report",
      appFooterSubtitle: "View Reports",
      star: "false",
      tilename: "",
      isMenuOpen: false,
      manageService:""
    }
    // {
    //   appHeaderName: "User Not Assigned",
    //   isStacked: "false",
    //   appLogo: "./assets/images/dashboard/cloud-resell/Group3.png",
    //   appFooterName: "Management Portal",
    //   appFooterSubtitle: "View Details",
    //   star: "false",
    //   tilename: "cmp",
    //   isMenuOpen: false,
    //   manageService:"Cloud"
    // },
    // {
    //   appHeaderName: "",
    //   isStacked: "false",
    //   appLogo: "./assets/images/dashboard/cloud-resell/Group4.png",
    //   appFooterName: "Cost Optimisation",
    //   appFooterSubtitle: "View Details",
    //   star: "false",
    //   tilename: "",
    //   isMenuOpen: false,
    //   manageService:""
    // },
    // {
    //   appHeaderName: "",
    //   isStacked: "false",
    //   appLogo: "./assets/images/dashboard/cloud-resell/Group5.png",
    //   appFooterName: "Monitoring",
    //   appFooterSubtitle: "View Details",
    //   star: "false",
    //   tilename: "",
    //   isMenuOpen: false,
    //   manageService:"MG SVC"
    // },
    // {
    //   appHeaderName: "",
    //   isStacked: "false",
    //   appLogo: "./assets/images/dashboard//cloud-resell/Group6.png",
    //   appFooterName: "Build with Blueprint",
    //   appFooterSubtitle: "View Details",
    //   star: "false",
    //   tilename: "blueprint",
    //   isMenuOpen: false,
    //   manageService:"MG SVC"
    // },
    // {
    //   appHeaderName: "",
    //   isStacked: "false",
    //   appLogo: "./assets/images/dashboard//cloud-resell/Group6.png",
    //   appFooterName: "OS patching",
    //   appFooterSubtitle: "View Details",
    //   star: "false",
    //   tilename: "",
    //   isMenuOpen: false,
    //   manageService:"MG SVC"
    // },
    // {
    //   appHeaderName: "TRAIL",
    //   isStacked: "false",
    //   appLogo: "./assets/images/dashboard/cloud-resell/Group1.png",
    //   appFooterName: "Security",
    //   appFooterSubtitle: "View Details",
    //   star: "false",
    //   tilename: "",
    //   isMenuOpen: false,
    //   manageService:"MG SVC"
    // },
    // {
    //   appHeaderName: "",
    //   isStacked: "false",
    //   appLogo: "./assets/images/dashboard/cloud-resell/Group5.png",
    //   appFooterName: "Backup and recovery",
    //   appFooterSubtitle: "View Details",
    //   star: "false",
    //   tilename: "",
    //   isMenuOpen: false,
    //   manageService:"MG SVC"
    // }
    
    // {
    //   appHeaderName: "",
    //   isStacked: "false",
    //   appLogo: "./assets/images/dashboard//cloud-resell/user-interface.svg",
    //   appFooterName: "Services & Security",
    //   appFooterSubtitle: "Instance Name",
    //   star: "false",
    //   tilename:""
    // },
    // {
    //   appHeaderName: "",
    //   isStacked: "false",
    //   appLogo: "./assets/images/dashboard//cloud-resell/user-interface.svg",
    //   appFooterName: "Managed Services & Blueprint",
    //   appFooterSubtitle: "View Details",
    //   star: "false",
    //   tilename:""
    // }
  ];
  subscribers =
    {

      "attributes": {

        "etag": null,

        "objectType": "Collection"

      },

      "totalCount": "1",

      "items": [

        {

          "commitmentEndDate": "2021-07-02T00:00:00Z",

          "offerName": "Microsoft 365 E3",

          "quantity": 10,

          "microsoftProduct": false,

          "orderId": "20A24D26-3EE9-4CD6-97B9-87B65E494612",

          "contractType": "subscription",

          "entitlementId": "5F1B68AA-F3CD-45E0-996B-28D2826D0C8F",

          "creationDate": "2020-06-16T14:05:37.78Z",

          "attentionNeeded": false,

          "trial": false,

          "termDuration": "P1Y",

          "unitType": "Licenses",

          "actionTaken": false,

          "billingType": "license",

          "billingCycle": "monthly",

          "effectiveStartDate": "2020-06-16T00:00:00Z",

          "offerId": "2B3B8D2D-10AA-4BE4-B5FD-7F2FEB0C3091",

          "hasPurchasableAddons": true,

          "attributes": {

            "etag": "eyJpZCI6IjVmMWI2OGFhLWYzY2QtNDVlMC05OTZiLTI4ZDI4MjZkMGM4ZiIsInZlcnNpb24iOjEwfQ==",

            "objectType": "Subscription"

          },

          "id": "5F1B68AA-F3CD-45E0-996B-28D2826D0C8F",

          "autoRenewEnabled": true,

          "actions": [

            "Cancel",

            "Edit"

          ],

          "friendlyName": "Office 365 subscription",

          "status": "active"

        }

      ]

    }


  ofcUsers =
    {

      "userSession": {

        "customerTenantId": "ab2a3e62-0dd6-487d-874c-8e6acae09d88",

        "sessionId": "dc488935-9331-40a2-8a31-e308da9f1567"

      },

      "items": [

        {

          "passwordProfile": null,

          "firstName": "Krishna",

          "lastName": "Manthena",

          "displayName": "Krishna Manthena",

          "usageLocation": null,

          "id": "c1016b46-49cd-44d7-a63b-4886e73e3f83",

          "userPrincipalName": "admin@k1121.onmicrosoft.com"

        },

        {

          "passwordProfile": null,

          "firstName": "Madhu",

          "lastName": "Sudanan",

          "displayName": "MadhuFromSwagger",

          "usageLocation": "LK",

          "id": "3b897c8d-feb2-4aba-a198-dda610e55f31",

          "userPrincipalName": "madhufromswagger@k1121.onmicrosoft.com"

        },

        {

          "passwordProfile": null,

          "firstName": "Sanjay",

          "lastName": "Gurung",

          "displayName": "Sanjay",

          "usageLocation": "LK",

          "id": "a6a4809e-b961-4814-b017-c529be95773e",

          "userPrincipalName": "sanjayadmin@k1121.onmicrosoft.com"

        },

        {

          "passwordProfile": null,

          "firstName": "Madhu",

          "lastName": "Sudanan",

          "displayName": "swaggeraug31",

          "usageLocation": "LK",

          "id": "66a0858f-6887-4fb2-b7ee-4ada8a4d7071",

          "userPrincipalName": "swaggeraug31@k1121.onmicrosoft.com"

        }

      ]

    }


  private routerSub: any;
  item: any;
  users;
  ofcListUsers;
  listOfUsers;
  subscriber;
  isOfficeProd: boolean = false;
  selectedProduct: any;
  characteristicMetaData: any;
  quantity;
  url = "https://login.microsoftonline.com/common/oauth2/authorize?&client_id=6d35fc0d-18aa-47d3-8f18-99571afebabb&response_type=code&redirect_url="


  loading: boolean = true;
  // @ViewChild("dt", { static: false }) table: Table;


  @ViewChild("toggleButton", { static: false }) toggleButton: ElementRef;

  accDetails;
  newAccDetails:any = {};
  itemIndex;
  office365;
  azCode;
  azRedirectUri;
  office365New;
  showSass;

  constructor(private elemRef: ElementRef, private renderer: Renderer2,
    private appService: AppService, private router: Router, public dialog: MatDialog,
    private route: ActivatedRoute, private apiService: ApiService) { }

  ngOnInit() {
    this.azRedirectUri = this.router['currentUrlTree'].queryParams.code ? window.location.href.split('?')[0] : window.location.href.split(';')[0];
    if (this.router['currentUrlTree'].queryParams.code) {
      this.azCode = this.router['currentUrlTree'].queryParams.code;
      let obj = {
          "sessionId": sessionStorage.sessionID,
          "azCode":this.azCode ,
          "azRedirectUri": this.azRedirectUri
        }
        
      this.appService.getUserList(obj).subscribe((res: any) => {

      this.ofcListUsers = res.body["items"]
      sessionStorage.setItem("userSessionId",res.body["userSession"]["sessionId"])
      sessionStorage.setItem("customerTenantId",res.body["userSession"]["customerTenantId"])
      this.subscriber = false;
      this.listOfUsers = true;
        },
            (err) => {
             
            });
    }

    // this.users = this.subscribers["items"]
    // this.ofcListUsers = this.ofcUsers["items"]
    this.loading = false;
    if(sessionStorage.getItem("dashboard-cloudService")) {
      let getObj = this.apiService.crypto.decrypt(sessionStorage.getItem("dashboard-cloudService"));
      if(getObj) {            
        this.appService.passCloudResellAccDetails(JSON.parse(getObj));
      } else {
        this.appService.passCloudResellAccDetails({});
      }
    }
    this.appService.cloudResellAccDetails.subscribe(
      data => {
        if (data !== null) {
          this.awsResellApps[0].appLogo = data.productLogo;
          this.showSass = true;
          sessionStorage.setItem("cloudResellAccDetails", JSON.stringify(data));
          this.item = data;
          this.accDetails = data.ecdmProductCharacteristic;
          let tempAccDetails:any = {};
          for(let i=0; i<this.accDetails.length; i++) {
          
            if(this.accDetails[i].ecdm_key) {
              tempAccDetails[this.accDetails[i].ecdm_key] = this.accDetails[i].ecdm_value;
            }
          }
         
          this.newAccDetails = tempAccDetails;
        
        }
        else if (data === null) {
          this.showSass = true;
          // this.item = JSON.parse(sessionStorage.cloudResellAccDetails);
          // this.accDetails = this.item.ecdmProductCharacteristic;
        }

        if (this.item && this.item.productName && this.item.productName.indexOf("Azure") >= 0) {
          this.selectedProduct = "Azure";
          this.awsResellApps[0].appFooterName = "Azure Console (Azure)";
          this.consoleURL = "https://portal.azure.com";
          if (this.accDetails && this.accDetails.characteristicMetaData) {
            this.characteristicMetaData = JSON.parse(this.accDetails.characteristicMetaData);
          }
          
        }
        else if (this.item && this.item.productName && this.item.productName.indexOf("AWS") >= 0) {
          this.selectedProduct = "AWS";
          this.awsResellApps[0].appFooterName = "AWS Console (AWS)";
          this.consoleURL = "https://console.aws.amazon.com/console/home";
        }
        else if (this.item && this.item.productName && this.item.productName.indexOf("Jenkins") >= 0) {
          this.selectedProduct = "Jenkins";
          this.awsResellApps[0].appFooterName = "Jenkins Console (Jenkins)";
        }
        else if (this.item && this.item.productName && this.item.productName.indexOf("Microsoft 365") >= 0) {
          this.selectedProduct = "office 365";
        }
      }
    );
    // this.appService.cloudResellAccDetailsOffice365.subscribe(
    //   data => {
    //     if (data !== null) {
    //       sessionStorage.setItem("cloudResellAccDetailsOffice365", JSON.stringify(data));
    //       this.office365New = data;
    //        sessionStorage.setItem("offerId",this.office365New.offerId)
       
    //       this.showSass = false;
    //       this.selectedProduct = "office 365";
    //     }
    //     else if (data === null) {
    //       this.office365New = JSON.parse(sessionStorage.cloudResellAccDetailsOffice365);
         
    //       sessionStorage.setItem("offerId",this.office365New.offerId)
    //        this.showSass = false;
    //        this.selectedProduct = "office 365";
    //     }
    //   }
    // );
    this.subscriber = true;


    // this.getMyyProductsList()



  }
  buyPremium(i) {
    this.awsResellApps[i].isMenuOpen = true;
    this.itemIndex = i;

  }
  openBuyPremiumPopup(appitem){

      const dialogRef = this.dialog.open(CloudExternalDialog, {
        height: '300px',
        width: '550px',
        data: {
          dataKey: "buypremium",
          tilename:appitem.appFooterName
        }
      });


    
  }

  updateSubscription() {

    let obj = {
      "sessionId": sessionStorage.sessionID,
      "subscriptionId":  this.office365New.id,
      "id": this.office365New.id,
      "quantity": this.quantity
    }
    
    this.appService.updateSubscriptionCount(obj)
      .subscribe((res: any) => {
        
      },
        (err) => {
         
        });

  }
  navigateToAWSCloudReports(appitem, i) {
    if (appitem.appFooterName == "Cloud Report") {
      // this.router.navigateByUrl('/dashboard/cloud-reports');
      this.router.navigateByUrl('/appdashboard');

    }
    else if (appitem.tilename == "aws") {
      this.openDialog(appitem.tilename, i);
      // window.open("https://aws.amazon.com/");
    }
    else if (appitem.appFooterName == "Cost Optimisation") {
      this.router.navigate(
        ['/dashboard/cost-optimization']
      );
    }
    else if(appitem.tilename == "cmp"){
        // window.open("https://cloudmanagerportal.com/oidc/hrd");
        window.open("https://dev-cmp.blazeclan.com/v1/app/cmpportal/ui/dashboard");
    }
    else if(appitem.tilename == "blueprint"){
      const dialogRef = this.dialog.open(CloudExternalDialog, {
        height: '500px',
        width: '800px',
        data: {
          dataKey: "blueprint"
        }
      });
    }
  }
  navigateToCloudReports(appitem) {
    if (appitem === 'Subscribers') {
      this.subscriber = true;
      this.listOfUsers = false;

    } else if (appitem === 'Active/Deactive') {

      const dialogRef = this.dialog.open(CloudExternalDialog, {
        height: '250px',
        width: '350px',
        data: {
          dataKey: "activate",
          status: this.office365New.status,
          id: this.office365New.id
        }
      });


    } else if (appitem === 'Users') {

      window.open(this.url+ this.azRedirectUri,"_self");
      this.subscriber = false;
      this.listOfUsers = true;

    } else if (appitem === 'Coming Soon') {

    }
  }

  gotoDashbaord() {
    sessionStorage.removeItem("dashboard-cloudService");
    this.router.navigateByUrl('/dashboard');
  }

  assignSubscription(customer) {

    let obj = {
                "sessionId": sessionStorage.sessionID,
                "customerTenantId":sessionStorage.customerTenantId ,
                "licenses": [
                  {
                    "licenseType": sessionStorage.offerId,
                    "userId": customer.id,
                  }
                ]
              }

    const dialogRef = this.dialog.open(CloudExternalDialog, {
       height: '250px',
      width: '500px',
      data: {
        dataKey: "assign",
        subscriptionObject: obj
      }
    });

    // this.appService.assignUserToProduct(obj).subscribe((res: any) => {
    

    // },
    //     (err) => {
    
    //     });
  }

  createUser() {


    const dialogRef = this.dialog.open(CloudExternalDialog, {
      height: '600px',
      width: '600px',
      data: {
        dataKey: "cmp"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
     
      this.ofcListUsers = result;
     
    });


  }


  openDialog(tilename, i) {
    this.itemIndex = i;
    if (tilename === 'aws') {
      const dialogRef = this.dialog.open(CloudExternalDialog, {
        height: '250px',
        width: '500px',
        data: {
          dataKey: 'aws',
          consolename:this.selectedProduct,
          consoleURL:this.consoleURL
        }
      });


    }
    else {
      this.buyPremium(i);
    }

  }
  eventHandlingFunction($event) {
    // if ($event.target !== this.toggleButton.nativeElement) {
    //       // this.awsResellApps[this.itemIndex].isMenuOpen = false;
    //     }

    let hambergerList = this.elemRef.nativeElement.querySelectorAll(".kebab");
    let app_header = this.elemRef.nativeElement.querySelectorAll(".app__header");
    let figParent = $event.target.offsetParent;
    // if($event.target.offsetParent.className != "kebab")
    hambergerList.forEach((ele, i) => {
      if ($event.target !== ele) {
        this.awsResellApps[i].isMenuOpen = false;
      }
     
    });

  }

  openCMP() {
    const dialogRef = this.dialog.open(CloudExternalDialog, {
      height: '250px',
      width: '500px',
      data: {
        dataKey: "cmp"
      }
    });
  }

  

}

@Component({
  selector: 'cloud-external-dialog',
  templateUrl: 'cloud-external-dialog.html',
  styles: [`
    .mat-dialog-container {
    border-top: solid 4px #ed1a3d !important;
}`]

})
export class CloudExternalDialog {

  displayName;
  firstName;
  lastName;
  password;
  userPrincipalName;
  usageLocation;
  passwordOption;
  updatedUsers;


  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private appService: AppService, public dialogRef: MatDialogRef<CloudExternalDialog>) { }

  ngOnInit() {
    // will log the entire data object
   

  }
  openProductConsole(url){
   window.open(url);
  }

  createUser() {
    let obj = {
      "sessionId": sessionStorage.userSessionId,
      "customerTenantId": sessionStorage.customerTenantId,
      "items": [{
        "displayName": this.displayName,
        "firstName": this.firstName,
        "lastName": this.lastName,
        "passwordProfile": {
          "forceChangePassword": this.passwordOption,
          "password": this.password
        },
        "userPrincipalName": this.userPrincipalName,
        "usageLocation": this.usageLocation
      }
      ]
    }

    this.appService.createUsers(obj).subscribe((res: any) => {
     
      this.dialogRef.close(res.body["items"]);

      // this.ofcListUsers = res.body["items"]

    },
        (err) => {
         
        });

    
  }
  activate() {

    let obj = {
      "sessionId": sessionStorage.sessionID,
      "subscriptionId": this.data["id"],
      "id": this.data["id"],
      "status": "active"
    }

    this.appService.suspendSubscription(obj).subscribe((res: any) => {
     

    },
        (err) => {
         
        });
  }
  suspend() {

    let obj =
    {
      "sessionId": sessionStorage.sessionID,
      "subscriptionId": this.data["id"],
      "id": this.data["id"],
      "status": "suspended"
    }
    this.appService.suspendSubscription(obj).subscribe((res: any) => {
     

    },
        (err) => {
         
        });


  }
  assignSubscription(){
    this.appService.assignUserToProduct(this.data["subscriptionObject"]).subscribe((res: any) => {
    

    },
        (err) => {
          
        });

  }

  

}