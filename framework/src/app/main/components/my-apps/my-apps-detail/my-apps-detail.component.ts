import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from "src/app/app.service";
import { Customer } from "src/app/main/components/users/manage-users/manage-users";
import { Table } from "primeng/table";
import { ToastrService } from 'ngx-toastr';
import { ApiService } from "src/app/platform/util/api.service";
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-my-apps-detail',
  templateUrl: './my-apps-detail.component.html',
  styleUrls: ['./my-apps-detail.component.css']
})

export class MyAppsDetailComponent implements OnInit {
  @ViewChild("dt", { static: false }) table: Table;
  detail: any;
  private routerSub: any;
  detailsData:any = [];
  customers: any = [];
  countData:number;
  selectedCustomers: Customer[];
  loading: boolean = true;
  productDetails:any = {};
  productAccountBoolean:boolean = false;
  keyAccount:string = "";
  updateApps:boolean = false;
  filterResult:any = [];
  assignStatus:string = "";
  assignCancelStatus:string = "";
  contentAssign:boolean = false;
  assignContents:string = "";
   // ****** to hide for phase 1 a ******	
  hideForCloudPdts: boolean = false;	
  
  constructor(private cdRef: ChangeDetectorRef,private route: Router, private appService: AppService,private toastr:ToastrService, private apiService: ApiService) { }

  ngOnInit() {
    if(sessionStorage.getItem("my-apps")) {
      let getObj = this.apiService.crypto.decrypt(sessionStorage.getItem("my-apps"));        
      this.appService.manageUserObj = getObj ? JSON.parse(getObj) : {};
    }
    this.detailsData = this.appService.manageUserObj;
    if(this.appService.manageUserObj.length > 0) {
      this.getUserList(this.appService.manageUserObj)
    } else{
      this.route.navigate(["/my-apps"]);
    }
  }

  ngAfterViewChecked() {
  if(this.table){
   if (this.table._totalRecords === 0) 
     this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace("{first}", "0"); 
   else 
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace("0", "{first}"); 
  }
  this.cdRef.detectChanges();
  }

  pageListCount:any = [];
  emailArray:any = [];
  paginationBoolean:boolean = false;
  
  getUserList(users){
    this.updateApps = true;
    this.paginationBoolean = true;
      this.customers = users[0].data;
      if(this.customers.length == 0){
        this.paginationBoolean = false;
      }
      this.pageListCount = users[0].data;
      this.productDetails = users[0].product;
      this.loading = false;

      this.customers.forEach(email => {
          email.indvContactMedium.forEach(emailarraydata =>{
            if(emailarraydata.type == "loginid"){
                email.dataEmail = emailarraydata.characteristic.emailAddress;
            }
          });
        
      });
     
      this.filterResult = this.detailsData[0].data.filter(assign => assign.status == 'Assigned');
      if(this.filterResult.length > 0)
      {
       this.countData = (this.filterResult.length / 10) * 100;
       if(this.countData > 100){
         this.countData = 100;
       }
      }
      else if(this.filterResult.length == 0) {
        this.countData = 0;
      }
  }

  keyFind(event)
  {
    this.keyAccount = event.target.value;
    if(event.keyCode == 13)
    {
      this.changeAwsAccName();
    }
  }
  assignBooleanId:number;
  dummyID:number = 0;
  custObj:any = {};
  cname:string = "";
  getModalContent(cust){
    this.custObj = cust;
    this.cname = cust.firstName;
    if(cust.status == 'Unassigned') {
        this.assignStatus = "Confirm";
        this.assignCancelStatus = "Discard Changes";
        this.contentAssign = true;
        this.assignContents = "You want Assign this Apps to "+cust.firstName+" ?";
      } else{
        this.assignStatus = "Unassign";
        this.assignCancelStatus = "Cancel";
        this.contentAssign = false;
        this.assignContents = "You want Unassign this Apps from "+cust.firstName+" ?";
    }
  }

  changeAssignStatus(cust){
    this.assignBooleanId = 0;
    if(this.custObj.status == 'Unassigned'){
      this.custObj.status = 'Assigned';
      this.custObj.role = 'End User';
    } else{
      this.custObj.status = 'Unassigned';
      this.custObj.role = '';
    }

    let objs = {
    "ECDM_PRODUCT_id": this.appService.manageUserObj[0].product.productId,
    "ECDM_PRODUCT_SUBSCRIPTION_id": "",
    "userName": this.custObj.firstName,
    "userEmail": this.custObj.dataEmail,
    "status": this.custObj.status,
    "individualId": this.custObj.indvContactMedium[0].Individual_id,
    "productName": this.appService.manageUserObj[0].product.productName,
    "role":this.custObj.role,
    "userIndividualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
  }

    this.appService.changeAssignStatus(objs).subscribe(data =>{
      if(data){
        this.toastr.success(data.body.status+' successfully');
        this.detailsData[0].data.forEach(assign => {
      if(assign.id == cust.id)
      {
        assign.status = cust.status;
      }
    });
      this.filterResult = this.detailsData[0].data.filter(assign => assign.status == 'Assigned');
      if(this.filterResult.length > 0)
      {
       this.countData = (this.filterResult.length / 10) * 100;
       if(this.countData > 100){
         this.countData = 100;
       }
      }
      else if(this.filterResult.length == 0) {
        this.countData = 0;
      }

        this.assignStatus = "";
      this.assignCancelStatus = "";
      this.assignContents = "";
      }
    });
  }

  gotoMyapps() {
    this.route.navigate(["/my-apps"]);
    sessionStorage.removeItem("my-apps");
  }
  
  toggleAssign(status,id){
    if(this.filterResult.length < 10 || status == 'Assigned') { 
      this.assignBooleanId = id;
    } else{
      this.toastr.warning('No License available. The app cannot be assigned!');
    }
  }

  cancelStatus(){
    this.assignStatus = "";
    this.assignCancelStatus = "";
    this.assignContents = "";
    this.custObj = {};
  }

  @HostListener('document:click')
  clickout() {
    if(this.dummyID != this.assignBooleanId) {
      this.dummyID = this.assignBooleanId;
    } else {
      this.dummyID = 0;
      this.assignBooleanId = 0;
    }
  }

  changeAwsAccName(){ 
  let acc =  {
    "id": this.productDetails.productId,
    "instanceName": this.keyAccount,
    "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
  }

  this.appService.changeAwsAccName(acc).subscribe(data =>{
      if(data) {
        let item = data.body;
        this.keyAccount = item.instanceName;
        this.productDetails.instanceName = item.instanceName;
        this.productAccountBoolean = !this.productAccountBoolean;
        this.toastr.success(' Instance Name Updated successfully');
      }
    });
  }

  instanceEdit(){
    this.productAccountBoolean = !this.productAccountBoolean;
    if(this.productAccountBoolean == true) {
      this.keyAccount = this.productDetails.instanceName
    } else{
      this.keyAccount = "";
    }
  }
  
}
