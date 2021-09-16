import { Component, OnInit, ElementRef } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-billing-details',
  templateUrl: './billing-details.component.html',
  styleUrls: ['./billing-details.component.css']
})
export class BillingDetailsComponent implements OnInit {
  accDetails;
  item: any;

  constructor(private  elemRef: ElementRef,private appService: AppService, private router: Router,private route: ActivatedRoute) { }

  ngOnInit() { 
    this.appService.cloudResellAccDetails.subscribe(
      data => {
        if (data !== null) {
          // this.showSass = true;
          sessionStorage.setItem("cloudResellAccDetails", JSON.stringify(data));
          this.item = data;
          this.accDetails = data.ecdmProductCharacteristic;
        }
        else if (data === null) {
          // this.showSass = true;
          this.item = JSON.parse(sessionStorage.cloudResellAccDetails);
          this.accDetails = this.item.ecdmProductCharacteristic;
        }
         
      })
  }

  
  navToReports(){
  this.router.navigate([
        'dashboard/cloud-reports'
  ]);
  }

}