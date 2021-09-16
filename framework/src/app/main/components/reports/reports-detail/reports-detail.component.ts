import { Component, OnInit, ElementRef } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import _ from 'lodash';
import { Router, ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";
import { AppService } from "src/app/app.service";
import * as orbiteraJson from 'src/assets/json/Orbitera.json'

interface FoodNode {
  displayName: string;
  priceBook? : string;
  sellerCost?: number;
  customerCost?: number;
  margin?: number;
  usage?: string;
  unit?: string;
  region? : string;
  totalSellerCost?: number;
  totalCustomerCost?: number;
  totalMargin? : number;
  child?: FoodNode[];
}
interface ExampleFlatNode {
  expandable: boolean;
  displayName: string;
  priceBook? : string;
  sellerCost?: number;
  customerCost?: number;
  margin?: number;
  usage?: string;
  unit?: string;
  region? : string;
  totalSellerCost?: number;
  totalCustomerCost?: number;
  totalMargin? : number;
  level: number;
}

@Component({
  selector: 'app-reports-detail',
  templateUrl: './reports-detail.component.html',
  styleUrls: ['./reports-detail.component.css'],
  providers: [DatePipe]
})
export class ReportsDetailComponent implements OnInit {
  finalArry: any = [];
  results: any = [];
  dummyArry: any = [];
  mainArry: any = [];
  displayName: string;
  startDate: Date;
  endDate: Date;
  starttoend: string;
  defaultCurrency: any;
  currencySymbol: any = [];
  thnamelist: any = [];
  thcustomname: string;
  totalsellerCosts: any;
  totalcustomercosts: any;
  totalMargins: any;
  selectedMonth: any = 'MONTH_TO_DATE';
  reportColumns: any = [
    "customername",
    "pricebook",
    "sellercost",
    "customercost",
    "margin",
    "usagequantity"
    // "unit",
    // "region"
  ];
  monthtoDate:any = [
    {'id':'MONTH_TO_DATE','name':'Month to Date'},
    {'id':'YEAR_TO_DATE','name':'Year to Date'},
    {'id':'QUARTER_TO_DATE','name':'Quarter to Date'},
    ];

  orbiteraLoginJson: any = orbiteraJson.signin;
  orbiteraLoginJsonSandbox: any = orbiteraJson.signinSandbox;
  signInAccountId: any;
  orbiteraSessionId: any;
  reportId: any;
  customerId: any;
  orbiteraCustomerId: any;
  tableShowBoolean: boolean = true;
  totalArry: any = {
    totalSellerCost: 0,
    totalCustomerCost: 0,
    totalMargin: 0
  };
  private transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.child && node.child.length > 0,
      displayName: node.displayName,
      priceBook: node.priceBook,
      sellerCost: node.sellerCost,
      customerCost: node.customerCost,
      margin: node.margin,
      usage: node.usage,
      unit: node.unit,
      region: node.region,
      totalSellerCost: node.totalSellerCost,
      totalCustomerCost: node.totalCustomerCost,
      totalMargin: node.totalMargin,
      level: level,
    };
  }

treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level,
    node => node.expandable, node => node.child);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private router: Router, private _datepipe: DatePipe,private elemRef: ElementRef,
  private appService : AppService,
  private route: ActivatedRoute ) {
  
  this.reportId = this.route.snapshot.params["id"];
 // this.customerId = sessionStorage.getItem("customerID");
 this.customerId = 1090;
    let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
    this.appService.getCustomerDetailsById(this.customerId, individualObj).subscribe(res => {
      if (res.body.length > 0) {
        if (res.body[0] && res.body[0].orbiteraCustId) {
          this.orbiteraCustomerId = res.body[0].orbiteraCustId;
          this.appService.orbiteraSignInAdminSandbox(this.orbiteraLoginJsonSandbox).subscribe(res => {
            if (res.body) {
              this.orbiteraSessionId = res.body.sessionId;
              this.signInAccountId = res.body.info.accountId;
              this.getReportById(this.reportId, "MONTH_TO_DATE");
            }
          });
        } else {
          this.tableShowBoolean = true;
        }
      }
    });
   }

  ngOnInit() {
  }
backArrow(){
    this.router.navigateByUrl('/apps/reports');
  }
  getReportById(reportId, filterName) {

    // const params = {
    //   "reportId": reportId,
    //   "accountId": this.signInAccountId,
    //   "sessionId": this.orbiteraSessionId,
    //   "specs": {
    //     "dateRangeOption": {
    //       "selectedRange": {
    //         "relativeDateRange": filterName
    //       }
    //     }
    //   }
    // }

    const params = {
      "reportId": reportId,
      "accountId": this.signInAccountId,
      "sessionId": this.orbiteraSessionId,
      "dateRange": filterName,
      "customerId" : this.orbiteraCustomerId

    };

    this.appService.getCustomerReportBYId(params).subscribe(res => {
      if (res.body) {
        let custdata = res.body;
        this.displayName = custdata.report.displayName;
        this.startDate = custdata.report.specs.dateRangeOption.selectedRange.relativeActualDateRange.startDate;
        this.endDate = custdata.report.specs.dateRangeOption.selectedRange.relativeActualDateRange.endDate;
        this.defaultCurrency = custdata.report.specs.currencyOption.selectedCurrency.name;
        this.starttoend = custdata.report.specs.dateRangeOption.selectedRange.relativeDateRange;

        custdata.report.specs.currencyOption.availableCurrencies.forEach(item => {
          this.currencySymbol.push({ "name": item.name, "code": item.code });
        });

        custdata.report.specs.selectedColumns.forEach((thname) => {
          if (thname.groupingLevel) {
            this.thnamelist.push(thname.displayName);
          }
        });
        this.thcustomname = this.thnamelist.toString().replace(/,/g, "/");

        if (custdata.results) {
          this.tableShowBoolean = false;
          if (custdata.results.rows.length > 0) {
            custdata.results.rows.forEach((item, index) => {
              item.values.forEach((subItem, y) => {
                if (subItem.valueType == 'STRING') {
                  subItem.totalSellerCost = 0;
                  subItem.totalCustomerCost = 0;
                  subItem.totalMargin = 0;
                  if (y - 1 != -1) {
                    subItem.finalCheck = this.childCheck(y + 1, item.values);
                    if (subItem.finalCheck && subItem.finalCheck.childCheck == true) {
                      subItem = subItem.finalCheck;
                    } else {
                      subItem.index = y;
                      subItem.finalCheck = '';
                      subItem.displayName = subItem.stringValue;
                      subItem.parentName = this.checkParent(y - 1, item.values);
                      if (y - 2 != -1) {
                        subItem.grandParentName = this.checkGrandParent(y - 2, item.values);
                      }
                    }
                  } else if (y == 0) {
                    subItem.index = y;
                    subItem.displayName = subItem.stringValue;
                  }
                  if (_.findIndex(this.dummyArry, subItem) == -1) {
                    this.dummyArry.push(subItem);
                  }
                }
              });
            })
            this.constructingMainArry();
          }
        } else {
          this.tableShowBoolean = true;
        }
      }
    });
  }


  selectedMonths(e) {
    this.getReportById(this.reportId, e);
  }
  constructingMainArry() {
    let cloneData = this.dummyArry;
    this.dummyArry.forEach((arry, index) => {
      if (arry.parentName && arry.index - 1 != -1) {
        let childExist = this.dummyArry.filter((w, y) => {
          return (w.parentName == arry.displayName && w.index == arry.index + 1 && w.grandParentName == arry.parentName);
        })
        if (childExist.length > 0) {
          arry.child = childExist;
        }
      } else {
        let childExist = this.dummyArry.filter((w, y) => {
          return (w.parentName == arry.stringValue && w.index == arry.index + 1);
        })
        if (childExist.length > 0) {
          arry.child = childExist;
        }
      }
    })
    this.finalArry = this.dummyArry.filter(w => {
      return (!w.parentName && (w.index == 0));
    })
    this.subTotal(this.finalArry);

    if (this.finalArry.length > 0) {
      this.finalArry.forEach((item, i) => {
        item.totalSellerCost = 0;
        item.totalCustomerCost = 0;
        item.totalMargin = 0;
        this.calculateTotal(item, item);
      })
    }
    this.totalsellerCosts = this.totalArry.totalSellerCost;
    this.totalcustomercosts = this.totalArry.totalCustomerCost;
    this.totalMargins = this.totalArry.totalMargin;
    let TREE_DATA: FoodNode[] = this.finalArry;
    this.dataSource.data = TREE_DATA;
  }

  subTotal(datasource){
  if(datasource.length > 0){
    datasource.forEach((item, index) => {
      if (item.child && item.child.length > 0) {
        this.calculateTotal(item, item);
        this.subTotal(item.child)
      }
    })
  }
}

  calculateTotal(parent, item) {
    if (!item.child) {
      parent.totalSellerCost = parseFloat(parent.totalSellerCost) + item.sellerCost;
      parent.totalCustomerCost = parseFloat(parent.totalCustomerCost) + item.customerCost;
      parent.totalMargin = parseFloat(parent.totalMargin) + item.margin;

    this.totalArry.totalSellerCost = parseFloat(this.totalArry.totalSellerCost) + item.sellerCost;
    this.totalArry.totalCustomerCost = parseFloat(this.totalArry.totalCustomerCost) + item.customerCost;
    this.totalArry.totalMargin = parseFloat(this.totalArry.totalMargin) + item.margin;

    } else {
      if (item.child && item.child.length > 0) {
        item.child.forEach(x => {
          this.calculateTotal(parent, x);
        })
      }
    }
  }

  checkParent(lastIndex, data) {
    if (data.length > 0) {
      let parentData = data[lastIndex].stringValue;
      return parentData;
    }
  }

  checkGrandParent(grandParentIndex, data) {
    if (data.length > 0) {
      let grandParentData = data[grandParentIndex].stringValue;
      return grandParentData;
    }
  }
  childCheck(nextIndex, data) {
    let objectArry: any = {};
    if (data.length > 0 && data[nextIndex]) {
      let childData = data[nextIndex].valueType;
      let modifiedChildArry: any = [];
      if (childData == 'MONEY') {
       for (var i = nextIndex; i <= data.length; i++) {
        if (i == nextIndex) {
          objectArry.sellerCost = data[i].moneyValue.value ? parseFloat(data[i].moneyValue.value.toFixed(2)) : 0.00;
        }
        if (nextIndex + 1 && data[nextIndex + 1])
          objectArry.customerCost = data[nextIndex + 1].moneyValue.value ? parseFloat(data[nextIndex + 1].moneyValue.value.toFixed(2)) : 0.00;
        }
        if (nextIndex + 2 && data[nextIndex + 2]) {
          objectArry.margin = data[nextIndex + 2].moneyValue.value ? parseFloat(data[nextIndex + 2].moneyValue.value.toFixed(2)) : 0.00;
        }
        if (nextIndex + 3 && data[nextIndex+ 3]) {
          objectArry.usage = parseFloat(data[nextIndex + 3].floatValue.toFixed(2));
        }
        if (nextIndex + 4 && data[nextIndex + 4]) {
          objectArry.unit = data[nextIndex + 4].stringValue
        }
        if (nextIndex + 5 && data[nextIndex + 5]) {
          objectArry.region = data[nextIndex + 5].stringValue
        }
        objectArry.childCheck = true;
        objectArry.priceBook = data[nextIndex - 1].stringValue;
        objectArry.parentName = data[nextIndex - 2].stringValue;
        objectArry.grandParentName = data[nextIndex - 3].stringValue;
        objectArry.displayName = data[nextIndex - 1].stringValue;
        objectArry.index = nextIndex - 1;
        return objectArry;
      }
    } else {
      objectArry.childCheck = false;
      return objectArry;
    }
  }
}