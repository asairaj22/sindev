import { Component, OnInit, ViewChild } from "@angular/core";
import { AppService } from "src/app/app.service";
import { Table } from "primeng/table";
import { Customer } from "../manage-users";
import { Router } from "@angular/router";
import { GlobalDataService } from 'src/app/main/services/global.service';
import { ApiService } from "src/app/platform/util/api.service";
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: "app-manage-users",
  templateUrl: "./manage-users.component.html",
  styleUrls: ["./manage-users.component.css"],
})
export class ManageUsersComponent implements OnInit {
  customers: Customer[];
  selectedCustomers: Customer[];
  getAccessSet = this.globalDataService.accessSet['manageUsersPage'];
  loading: boolean = true;
  custId:string;
  
  @ViewChild("dt", { static: false }) table: Table;

  constructor(private cdRef: ChangeDetectorRef,private customerService: AppService, private routes: Router,private globalDataService: GlobalDataService, private apiService: ApiService) {
    this.custId = sessionStorage.getItem("customerId");
  }

  ngOnInit(): void {
    
    this.getCustomerList(this.custId);
    // User Admin
    // this.customerService.getCustomersLarge().then((customers) => {
    //   this.customers = customers;
    //   this.loading = false;
    // });
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
  paginationBoolean:boolean = false;
  pagedataCount:any = [];
  getCustomerList(custId){
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.customerService.getCustomerList(custId, individualObj).subscribe(data => {
      if(data)
      {
        this.paginationBoolean = true;
        this.pagedataCount = data.body;
        this.customers = this.pagedataCount;
        if(this.pagedataCount.length == 0){
          this.paginationBoolean = false;
        }
        
      }
    })
  }

  createUser() {
    this.routes.navigate(["/manage-users/create-user"]);
  }

  getIndividualId(custDetails){   
    this.customerService.manageIndividualUser.individualId = custDetails.individualId;
    this.customerService.manageIndividualUser.id = custDetails.id;
    this.customerService.manageIndividualUser.assignId = custDetails.count;
    this.customerService.manageIndividualUser.status = custDetails.status;
    if(custDetails && custDetails.individualId) {
      sessionStorage.setItem("individualDetail", this.apiService.crypto.encrypt(JSON.stringify(this.customerService.manageIndividualUser)));
    }
    this.routes.navigate(["/individual-user"]);
    // /customer/{​​​​​​​​Customer_id}​​​​​​​​/individual/{​​​​​​​​Individualid}​​​​​​​​      
  }  
}
