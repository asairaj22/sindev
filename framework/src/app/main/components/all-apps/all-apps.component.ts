import { Component, OnInit, ElementRef } from '@angular/core';
import *  as  appData from './all-apps.json';
import _ from 'lodash';

@Component({
  selector: 'app-all-apps',
  templateUrl: './all-apps.component.html',
  styleUrls: ['./all-apps.component.css']
})
export class AllAppsComponent implements OnInit {

  prodDetData: any = (appData as any).default;
  appData: any = [];
  appTempData: any = [];
  category:any = [];
  selectedText ="";

  constructor( private  elemRef: ElementRef) { }

  ngOnInit() {
    this.selectedText = "All Products";
    this.appData = _.cloneDeep(this.prodDetData);
    this.appData.appDetails.sort(function (a, b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
      });
    this.appTempData = _.cloneDeep(this.prodDetData);
   
    // var tempCategory = []
    // this.appData.forEach((val,i)=>{
    //   tempCategory.push(val.category)
    // })

    this.category = this.appData.category;
  }

  showApps(event){
    this.selectedText = event;
    this.appData.appDetails = [];
    if(event == "All Apps"){
    this.appData = _.cloneDeep(this.prodDetData);
    } else {
      this.appTempData.appDetails.forEach((val)=>{
        if(val.category.includes(event)){
          this.appData.appDetails.push(val);
        }
      })
    }

    
    this.appData.appDetails.sort(function (a, b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
      });
    
  }

}