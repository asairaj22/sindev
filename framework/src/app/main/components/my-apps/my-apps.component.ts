import { Component, OnInit,ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { MyAppsService } from "./my-apps.service";
import { AppService } from "src/app/app.service";
import { Table } from "primeng/table";
import { Customer } from "src/app/main/components/users/manage-users/manage-users";
import { GlobalDataService } from 'src/app/main/services/global.service';
import { ApiService } from "src/app/platform/util/api.service";
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-my-apps',
  templateUrl: './my-apps.component.html',
  styleUrls: ['./my-apps.component.css', '../../../appdemo.scss']
})
export class MyAppsComponent implements OnInit {
  @ViewChild("dt", { static: false }) table: Table;
  custId:any;
  paginationBoolean:boolean = true;
  customers: any[];
  selectedCustomers: any[];
  getAccessSet = this.globalDataService.accessSet['myAppsPage'];
//   customers: any[];
//   selectedCustomers: any[];
  loading: boolean = true;
   // ****** to hide for phase 1 a ******	
  hideForCloudPdts: boolean = false;
  products: any = [];
  selectedItem: any;
  getInstanceDetails:any = [];

  constructor(private cdRef: ChangeDetectorRef,private router: Router, private myAppsService: MyAppsService, private appService: AppService,private globalDataService: GlobalDataService, private apiService: ApiService) {
    this.custId = sessionStorage.getItem("customerId"); 
  }

  ngOnInit() {    
    // this.onFetchCustomerInventory();
    this.getCustomerDetails(this.custId);
  }

ngAfterViewChecked() {
  if(this.table){
   if (this.table._totalRecords === 0) 
     this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace("{first}", "0") 
   else 
     this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace("0", "{first}") 
  }
     this.cdRef.detectChanges();
  }
  getCustomerDetails(custid){
    this.appService.getCustomerDetails(custid)
      .subscribe((res: any) => {
        //this.paginationBoolean = true;
        this.getInstanceDetails = res.body;
        if(this.getInstanceDetails.length == 0){
         // this.paginationBoolean = false;
        }
       this.customers = this.getInstanceDetails;
        // ******** whether the instanceName is abscent use the product_guid as instanceName ********	
        // for(let i=0; i<this.customers.length; i++) {
        //   if(this.customers[i].instanceName === undefined || this.customers[i].instanceName === null || 	
        //   this.customers[i].instanceName === '') {	
        //     this.customers[i].instanceName = this.customers[i].product_guid ? this.customers[i].product_guid : '';	
        //   }	
        // }
      });
  }

//   setMyPagination(event) {
//     let startRow = event.first + 1;
//     let endRow =  startRow + event.rows;
//     let totalRows = this.cars.length;
//     this.myPaginationString  = "showing "+startRow +" to "+ endRow +" of "+ totalRows  +" entries"
// }

  goToDetailsApp(product){
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
      this.appService.manageUserObj.push({"product":productsDetails,"data":res.body });
      if(productsDetails && res && res.body) {
        sessionStorage.setItem("my-apps", this.apiService.crypto.encrypt(JSON.stringify(this.appService.manageUserObj)));
      }
      this.router.navigate(['/my-apps/my-apps-detail']);
    });
  }

// onFetchCustomerInventory() {
  //   let id = sessionStorage.getItem('customerId');
  //   this.myAppsService.getCustomerInventory(id)
  //     .subscribe((res: any) => {
  //     
  //       if(res.body.errorMessage) {
  //        
  //       }
  //       else if(res.body.length > 0) {
  //         this.products = res.body;
  //         for (let i = 0; i < this.products.length; i++) {
  //           this.products[i].instanceName = this.products[i].ecdmProductCharacteristic.accountName;
  //           this.products[i].saasID = this.products[i].ecdmProductCharacteristic.saasID;
  //           this.products[i].plan = this.products[i].details[0].BillingAccountInfo.cycle;
  //           this.products[i].orderNo = this.products[i].orderId[0].order_id
  //           this.onFetchEcdmDetails(this.products[i].subs_prod_id, i);
  //         };
  //       
  //       }
  //        // for(let i=0; i<this.dummy.length;i++) {
  //         //   this.products.push(this.dummy[i])
  //         // }
  //       },
  //       (err) => {
  //         
  //       },
  //       ()=>{
         
  //       });
  // }
  onFetchEcdmDetails(subsId, index) {
    let id = {
      ECDM_PRODUCT_id: subsId,
      "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
    };
   
    this.myAppsService.getEcdmDetails(id)
      .subscribe((res: any) => {
        this.products[index].licenseUsed = `${res.body[0].usedQuantity} / 10`;
        this.products[index].licenseUsedQuantity = `${res.body[0].usedQuantity}`;
        
      },
        (err) => {
         
        });
  }

  onNavigateDetail(val: any) {
    this.router.navigate(['/my-apps/my-apps-detail', JSON.stringify(val)]);
  }




  


}
