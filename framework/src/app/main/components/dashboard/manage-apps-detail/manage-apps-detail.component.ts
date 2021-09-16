import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-manage-apps-detail',
  templateUrl: './manage-apps-detail.component.html',
  styleUrls: ['./manage-apps-detail.component.css']
})
export class ManageAppsDetailComponent implements OnInit {
isUserTab:boolean=false;
isExistingPlanTab:boolean=true;
  constructor() { }

  ngOnInit() { 
  }

onTabClicked(data:string){
  if(data == 'ExistingPlan'){
this.isExistingPlanTab = true;
this.isUserTab = false;

  }else if(data == 'Users'){
this.isUserTab = true;
this.isExistingPlanTab = false;
  }
}
}