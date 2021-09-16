import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Router, ActivatedRoute } from '@angular/router';
import * as orbiteraJson from 'src/assets/json/Orbitera.json'
import { AppService } from "src/app/app.service";

interface FoodNode {
  displayName: string;
  createdBy?: string;
  reportId?: string;
  subLocations?: FoodNode[];
}
interface ExampleFlatNode {
  expandable: boolean;
  displayName: string;
  createdBy: string;
  reportId?: string;
  level: number;
}


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {

  displayedColumns: string[] = ["displayName", 'createdBy'];
  displayedColumns1: string[] = ['name', 'count'];
  orbiteraLoginJson: any = orbiteraJson.signin;
  orbiteraLoginJsonSandbox: any = orbiteraJson.signinSandbox;
  signInAccountId : any;
  orbiteraSessionId : any;
  private transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.subLocations && node.subLocations.length > 0,
      displayName: node.displayName,
      createdBy: node.createdBy,
      reportId: node.reportId,
      level: level,
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level,
    node => node.expandable, node => node.subLocations);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  constructor(private elemRef: ElementRef, private router: Router, private route: ActivatedRoute,
    private marketProductService : AppService) { }

  ngOnInit() {
     this.marketProductService.orbiteraSignInAdminSandbox(this.orbiteraLoginJsonSandbox).subscribe(res => {
      if (res.body) {
        this.orbiteraSessionId = res.body.sessionId;
        this.signInAccountId = res.body.info.accountId;

        let obj = {
          "paramId": this.signInAccountId,
          "sessionId": this.orbiteraSessionId,
          "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
        }

        this.marketProductService.getReportListSandBox(obj).subscribe(res => {
          if (res.body) {
            let custdata = res.body.reports;
            if (custdata.length > 0) {
              let groups = this.nestGroupsBy(custdata, ['category']);
              groups = groups["BILLING_REPORTS"];
              let result = [{
                displayName: "Azure Billing Customers Reports",
                createdBy: "",
                subLocations: groups
              }]
              let TREE_DATA: FoodNode[] = result;
              this.dataSource.data = TREE_DATA;
            }
          }
        });
      }
    });
  }

  detailreport(item) {
    this.router.navigateByUrl('/reports/reports-detail/' + item.reportId)
  }
  nestGroupsBy(arr, properties) {
    properties = Array.from(properties);
    if (properties.length === 1) {
      return this.groupBy(arr, properties[0]);
    }
    const property = properties.shift();
    var grouped = this.groupBy(arr, property);
    for (let key in grouped) {
      grouped[key] = this.nestGroupsBy(grouped[key], Array.from(properties));
    }
    return grouped;
  }

  groupBy(conversions, property) {
    return conversions.reduce((acc, obj) => {
      let key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  }
}