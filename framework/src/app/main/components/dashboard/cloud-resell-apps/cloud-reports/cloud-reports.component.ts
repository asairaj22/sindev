import { Component, OnInit, ElementRef,ViewChild } from '@angular/core';
import {ChartType,ChartOptions} from 'chart.js';
import { ActivatedRoute, Router } from "@angular/router";
import { Table } from "primeng/table";
import { AppService } from 'src/app/app.service';
import { Customer } from "src/app/main/components/users/manage-users/manage-users";
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";

@Component({
  selector: 'app-cloud-reports',
  templateUrl: './cloud-reports.component.html',
  styleUrls: ['./cloud-reports.component.css']
})
export class CloudReportsComponent implements OnInit {
  public start: Date = new Date ("09/05/2020"); 
  public end: Date = new Date ("09/11/2020");
  public start1: Date = new Date ("09/05/2020"); 
  public end1: Date = new Date ("09/11/2020");
  public start2: Date = new Date ("09/05/2020"); 
  public end2: Date = new Date ("09/11/2020");
  public start3: Date = new Date ("09/05/2020"); 
  public end3: Date = new Date ("09/11/2020");
  availableChart:any;
  selectedChart : any;
  private routerSub: any;
  customers: Customer[];
  selectedCustomers: Customer[];
  item:any;
  accDetails:any;
 budgetAlertData:any;
 curBudgetChartType:any;
 budgetname = 'Alert';
	budgetcost = 5000;
  costExceed = 100;
  budgetpercent = (this.costExceed/100)* this.budgetcost;
  curBudgetChartColors:any;
  curChartType:any;
  notificationArr:any;
  recipientArr:any;
  chart1BudgetData:any;
  chart2BudgetData:any;
  chart3BudgetData:any;
  chart4BudgetData:any;
  chart5BudgetData:any;
  chart6BudgetData:any;
  chart7BudgetData:any;
  chart8BudgetData:any;
  chart1BudgetColors:any;
  chart2BudgetColors:any;
  chart3BudgetColors:any;
  chart4BudgetColors:any;
  chart5BudgetColors:any;
  chart6BudgetColors:any;
  chart7BudgetColors:any;
  chart8BudgetColors:any;
  monthArray :Array<any> = ["Jan", "Feb" , "Mar", "Apr","May","Jun","Jul", "Aug","Sep","Oct","Nov","Dec"];
  xAxisMonths:Array<any>=[];
  xAxisDates:Array<any>=[];

  customersNew = [
 
        {
          "billingNumber": 6245343625,
          "billingDate": "07-Sep-2020",
          "usagePeriod": "01 Aug - 31 Aug 2020",
          "usageAmount": "$24,500.00"
        },
        {
          "billingNumber": 4334456785,
          "billingDate": "07-Aug-2020",
          "usagePeriod": "01 Jul - 31 Jul 2020",
          "usageAmount": "$20,000.00"
        },
        {
          "billingNumber": 5433234395,
          "billingDate": "07-Jul-2020",
          "usagePeriod": "01 Jun - 30 Jun 2020",
          "usageAmount": "$17,400.65"
        },
        {
          "billingNumber": 3547588936,
          "billingDate": "07-Jun-2020",
          "usagePeriod": "01 May - 31 May 2020",
          "usageAmount": "$17,000.87"
        },
        {
          "billingNumber": 9847493086,
          "billingDate": "07-May-2020",
          "usagePeriod": "01 Apr - 30 Apr 2020",
          "usageAmount": "$12,000.98"
        },
        {
          "billingNumber": 9435294759,
          "billingDate": "07-Apr-2020",
          "usagePeriod": "01 Mar - 31 Mar 2020",
          "usageAmount": "$11,900.43"
        }
      ]

  

//contactArr

public contactArr = [
    {"name":"Divya Eranna",
    "email":"deranna@apptium.com",
    "mob":"6380780048"
    },
     {"name":"Krishna Manthena",
    "email":"krishna@apptium.com",
    "mob":"9294846390"
    },
     {"name":"Sakthivel",
    "email":"sakthi@apptium.com",
    "mob":"390830582"
    },
     {"name":"Ajith Bharathi",
    "email":"ajith@apptium.com",
    "mob":"3840250729"
    },
     {"name":"Manoj Vuppu",
    "email":"manoj@apptium.com",
    "mob":"2092879473"
    },
     {"name":"Dharani",
    "email":"dharani@apptium.com",
    "mob":"38497529394394"
    },

  ];
  // Chart 1 configuration
  public chart1Type: string = 'bar';
  public chart1Data: Array<any> = [
    { data: [11900.43, 12000.98, 17000.87, 17400.65, 20000.00, 24500.00, 19070], label: 'My First dataset' }
  ];
public chart1Labels: Array<any> = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
// public chart1Labels:Array<any>= this.xAxisMonths;

public chart1Colors: Array<any> = [
    {
      backgroundColor: [
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)'

      ]
    }
  ];
 public chart1Options : any = {
      responsive: false,
        scales: {
          xAxes: [{
            barPercentage: 0.4,
            gridLines: {
					display: false
				}
            }],
          yAxes: [{
        ticks: {
					// fontColor: 'black',
					// Include a dollar sign in the ticks
					callback: function (chart1Data) {
						return '$' + chart1Data.toFixed();
					}
				},
          }]
      },
      legend: {
			display:false
		}
    
  };
  // Chart 2 configuration
  public chart2Type: string = 'line';
  public chart2Data: Array<any> = [
    { data: [200.7,350.5,490.8, 500, 650, 670, 690.8, 700.2, 750.3,790.8], label: ''}
  ];
public chart2Labels: Array<any> = ['Sep5', 'Sep6', 'Sep7', 'Sep8', 'Sep9', 'Sep10', 'Sep11'];
// public chart2Labels: Array<any> = this.xAxisDates;

public chart2Colors: Array<any> = [
    {
      backgroundColor: [
        'rgba(255, 206, 86, 0.2)'
      ],
      borderColor: [
        'rgba(255, 206, 86, 1)'
      ],
      borderWidth: 2,
    }
  ];
 public chart2Options : any = {
   responsive:true,
   legend:{
     display:false
   },
   scales:{
     xAxes:[{
            gridLines: {
					display: false
            }
				}],
        yAxes:[{
          ticks: {
					// fontColor: 'black',
					// Include a dollar sign in the ticks
					callback: function (chart2Data) {
						return '$' + chart2Data.toFixed();
					}
				}
        }]
   }
 };
  
  // Chart 3 configuration
  public chart3Type: string = 'bar';
  public chart3Data: Array<any> = [
    { data: [6000, 8000, 10000, 9000, 6000, 12000, 13000], label: 'AWS Data Transfer'},
    { data: [2000, 3000, 2000, 5000, 3000, 4000, 5000], label: 'AWS Simple DB' },
    { data: [2000, 3000, 2000, 5000, 3000, 4000, 5000], label: 'AWS IoT' },
    { data: [], label: 'AWS Elastic Compute Cloud' },
    { data: [], label: 'AWS Cloud Front' },

  ];
public chart3Labels: Array<any> = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

public chart3Colors: Array<any> = [
    {
      backgroundColor: [
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
         
      ]
    },
    {
      backgroundColor: [
        'rgb(252, 222, 69)',
        'rgb(252, 222, 69)',
        'rgb(252, 222, 69)',
        'rgb(252, 222, 69)',
        'rgb(252, 222, 69)',
        'rgb(252, 222, 69)'
        
      ],
    },
    {
      backgroundColor: [
        'rgb(39, 43, 252)',
        'rgb(39, 43, 252)',
        'rgb(39, 43, 252)',
        'rgb(39, 43, 252)',
        'rgb(39, 43, 252)',
        'rgb(39, 43, 252)'
      ],
    },
    {
      backgroundColor: [
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)'
      ],
    },
    {
      backgroundColor: [
        'rgb(245, 106, 0)',
        'rgb(245, 106, 0)',
        'rgb(245, 106, 0)',
        'rgb(245, 106, 0)',
        'rgb(245, 106, 0)',
        'rgb(245, 106, 0)'
      ],
    }
  ];
    public chart3Options: any = {
      responsive: true,
        scales: {
          xAxes: [{
            stacked: true,
             barPercentage: 0.4,
               gridLines: {
					      display: false
				          }
            }],
          yAxes: [
          {
            stacked: true,
            ticks: {
					// fontColor: 'black',
					// Include a dollar sign in the ticks
					callback: function (chart3Data) {
						return '$' + chart3Data.toFixed();
					}
				}
          }
        ]
      },
      legend: {
			position: 'bottom',
			boxWidth: 10,
      align:'start',
			labels: {
				// usePointStyle: true,
				// fontColor: 'black'
			}
		}
    };

  // chart 4 configuration
  public chart4Type: string = 'horizontalBar';
  public chart4Data: Array<any> = [
    { data: [300.45, 400.56, 500.76, 550.78, 606.23, 650.87, 834.56], label: 'My horiz data' }
  ];
public chart4Labels: Array<any> = ['AWS IoT', 'AWS Data Transfer', 'AWS Simple DB', 'AWS Elastic Compute Cloud', 'AWS Cloud Front'];

public chart4Colors: Array<any> = [
    {
      backgroundColor: [
        'rgb(39, 43, 252)',
        'rgb(255, 97, 105)',
        'rgb(252, 222, 69)',
        'rgb(255, 97, 105)',
        'rgb(245, 106, 0)'
      ]
    }
  ];
 public chart4Options : any = {
      responsive: true,
        scales: {
          xAxes: [{
            stacked: true,
             gridLines: {
					display: false
				},
        ticks: {
					// fontColor: 'black',
					// Include a dollar sign in the ticks
					callback: function (chart4Data) {
						return '$' + chart4Data.toFixed();
					}
				}
            }],
          yAxes: [
          {
            stacked: true,
            barPercentage: 0.6,

          }
        ]
      },
      legend:{
        display:false
      }
    };
  // Chart 5 configuration
   public chart5Type: string = 'bar';
  public chart5Data: Array<any> = [
    { data: [6000, 8000, 10000, 9000, 6000, 12000, 13000], label: 'Datadog Pro'},
    { data: [2000, 3000, 2000, 5000, 3000, 4000, 5000], label: 'N2WS Backup and Recovery' },
    { data: [2000, 3000, 2000, 5000, 3000, 4000, 5000], label: 'Trend Micro Cloud One' },
    { data: [], label: 'CloudChecker' },
    { data: [], label: 'Ebs-Prod-Management' },

  ];
public chart5Labels: Array<any> = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

public chart5Colors: Array<any> = [
    {
      backgroundColor: [
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
         
      ]
    },
    {
      backgroundColor: [
        'rgb(252, 222, 69)',
        'rgb(252, 222, 69)',
        'rgb(252, 222, 69)',
        'rgb(252, 222, 69)',
        'rgb(252, 222, 69)',
        'rgb(252, 222, 69)'
        
      ],
    },
    {
      backgroundColor: [
        'rgb(39, 43, 252)',
        'rgb(39, 43, 252)',
        'rgb(39, 43, 252)',
        'rgb(39, 43, 252)',
        'rgb(39, 43, 252)',
        'rgb(39, 43, 252)'
      ],
    },
    {
      backgroundColor: [
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)',
        'rgb(255, 97, 105)'
      ],
    },
    {
      backgroundColor: [
        'rgb(245, 106, 0)',
        'rgb(245, 106, 0)',
        'rgb(245, 106, 0)',
        'rgb(245, 106, 0)',
        'rgb(245, 106, 0)',
        'rgb(245, 106, 0)'
      ],
    }
  ];
 public chart5Options: any = {
      responsive: true,
        scales: {
          xAxes: [{
            stacked: true,
             barPercentage: 0.4,
               gridLines: {
					      display: false
				          }
            }],
          yAxes: [
          {
            stacked: true,
            ticks: {
					// fontColor: 'black',
					// Include a dollar sign in the ticks
					callback: function (chart5Data) {
						return '$' + chart5Data.toFixed();
					}
				}
          }
        ]
      },
      legend: {
			position: 'bottom',
			boxWidth: 10,
      align:'start',
			labels: {
				// usePointStyle: true,
				// fontColor: 'black'
			}
		}
    };
  // Chart 6 configuration
   public chart6Type: string = 'horizontalBar';
  public chart6Data: Array<any> = [
    { data: [300.45, 400.56, 500.76, 550.78, 606.23, 650.87, 834.56], label: 'horiz graph' }
  ];
public chart6Labels: Array<any> = ['Datadog Pro', 'N2WS Backup and Recovery', 'Trend Micro Cloud One', 'CloudChecker', 'Ebs-Prod-Management'];

public chart6Colors: Array<any> = [
    {
      backgroundColor: [
        'rgb(39, 43, 252)',
        'rgb(255, 97, 105)',
        'rgb(252, 222, 69)',
        'rgb(255, 97, 105)',
        'rgb(245, 106, 0)'
      ]
    }
  ];
 public chart6Options : any = {
    responsive: true,
    legend:{
      display:false
    },
    scales:{
      xAxes:[{
        ticks: {
					// fontColor: 'black',
					// Include a dollar sign in the ticks
					callback: function (chart6Data) {
						return '$' + chart6Data.toFixed();
					}
				},
        gridLines: {
					display: false
				}
      }],
      yAxes: [
          {
            stacked: true,
            barPercentage: 0.6,

          }
        ]
    }
  };
  // Chart 7 configuration
   public chart7Type: string = 'bar';
  public chart7Data: Array<any> = [
    { data: [1100, 1000, 1000, 800, 800, 800, 800], label: 'AWS Premium Support' }
  ];
public chart7Labels: Array<any> = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

public chart7Colors: Array<any> = [
    {
      backgroundColor: [
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)'

      ]
    }
  ];
 public chart7Options : any = {
    responsive: true,
    legend:{
       display:true,
       position:'bottom',
       align:'start'
    },
    scales:{
      xAxes:[{ 
      barPercentage: 0.4,
        gridLines: {
				display: false
				}
        }],
        yAxes:[{
        ticks: {
        max: 2100,
        min: 0,
        stepSize:300,
        beginAtZero: true,
        // fontColor: 'black',
                // Include a dollar sign in the ticks
                callback: function (chart7Data) {
                    return '$' + chart7Data.toFixed();
					}
				}
        }]
    }
  };

  // Chart 8 configuration
   public chart8Type: string = 'horizontalBar';
  public chart8Data: Array<any> = [
    { data: [1100], label: 'My First dataset' }
  ];
public chart8Labels: Array<any> = ['AWS Premium Support'];

public chart8Colors: Array<any> = [
    {
      backgroundColor: [
        'rgb(254, 180, 237)'
      ]
    }
  ];
 public chart8Options : any = {
    responsive: true,
    legend:{
      display:false,
    },
      scales:{
      yAxes:[{ 
      barPercentage: 0.2,
        gridLines: {
				display: false
				}
        }],
        xAxes:[{
          ticks: {
            max: 2100,
            min: 0,
            stepSize:300,
          beginAtZero: true,
					// fontColor: 'black',
					// Include a dollar sign in the ticks
					callback: function (chart8Data) {
						return '$' + chart8Data.toFixed();
					}
				}
        }]
    }
      
    
  };
  @ViewChild("dt", { static: false }) table: Table;
  @ViewChild('chartCustomizeTheme', { static: false }) public chartCustomizeTheme:ModalDirective;
   @ViewChild('closeBudgetPopup', { static: false }) public closeBudgetPopup:ElementRef;
  constructor(private  elemRef: ElementRef, private router: Router,private route: ActivatedRoute,private appService: AppService, private toastr: ToastrService) { }

  ngOnInit() {
let curDateInst = new Date();
let curMonth = curDateInst.getMonth();
let curDate = curDateInst.getDate();
this.xAxisMonths = [this.monthArray[curMonth%6],this.monthArray[curMonth%5],this.monthArray[curMonth%4],this.monthArray[curMonth%3],this.monthArray[curMonth%2],this.monthArray[curMonth%1]];
this.xAxisDates = [(this.monthArray[curMonth]+(curDate-6)),(this.monthArray[curMonth]+(curDate-5)),(this.monthArray[curMonth]+(curDate-4)),(this.monthArray[curMonth]+(curDate-3)),(this.monthArray[curMonth]+(curDate-2)),(this.monthArray[curMonth]+(curDate-1)),(this.monthArray[curMonth]+(curDate))];



    this.notificationArr =[{
  "costexceed":"",
  "budgetpercent":""
}
    ];
    this.recipientArr =[
      {
  "contact":"",
  "email":"",
  "mob":"",
  "contactArr":this.contactArr,
  "selectedContact":""
}
    ];

// this.routerSub = this.route.params.subscribe((params:any) => {
//        this.item = JSON.parse(params['item']); 


//     });

    this.appService.getCustomersLarge().then((customers) => {
      this.customers = customers;
      // this.loading = false;
    });
   this.appService.cloudResellAccDetails.subscribe(
      data => {
        if(data!== null){
          sessionStorage.setItem("cloudResellAccDetails", JSON.stringify(data));
          this.item = data;
        this.accDetails = data.ecdmProductCharacteristic;
       

        }    
        else if(data === null){
          this.item = JSON.parse(sessionStorage.cloudResellAccDetails);
          this.accDetails = this.item.ecdmProductCharacteristic;
      //     this.router.navigateByUrl(
      //   'dashboard'
      // );
        }
      }
    );
  }
  updateRecipientList($event){

  }
opensidenav(value: any, drawer: any, chartOption, currentChart, availableChart) {
		drawer.toggle();
		this.availableChart = availableChart.split(",");
    this.selectedChart = currentChart.charAt(0).toUpperCase() + currentChart.slice(1);
		
	}
  openbudgetpopup(chartData,chartType,chartColors){
    
    this.curBudgetChartType = chartType;
    this.budgetAlertData = "";
    if(parseInt(this.curBudgetChartType) ==1){
      if(this.chart1BudgetData && this.chart1BudgetColors){
      this.budgetAlertData = this.chart1BudgetData;
      this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart1BudgetColors));
      }
      else{
        this.chart1BudgetData = this.chart1Data;
        this.chart1BudgetColors = JSON.parse(JSON.stringify(this.chart1Colors));
        this.budgetAlertData = this.chart1BudgetData;
        this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart1BudgetColors));
      }
    }
    else if(parseInt(this.curBudgetChartType) ==2){
      if(this.chart2BudgetData && this.chart2BudgetColors){
      this.budgetAlertData = this.chart2BudgetData;
      this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart2BudgetColors));
      }
      else{
        this.chart2BudgetData = this.chart2Data;
        this.chart2BudgetColors = JSON.parse(JSON.stringify(this.chart2Colors));
        this.budgetAlertData = this.chart2BudgetData;
        this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart2BudgetColors));
      }
    }
    else if(parseInt(this.curBudgetChartType) ==3){
      if(this.chart3BudgetData && this.chart3BudgetColors){
      this.budgetAlertData = this.chart3BudgetData;
      this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart3BudgetColors));
      }
      else{
        this.chart3BudgetData = this.chart3Data;
        this.chart3BudgetColors = JSON.parse(JSON.stringify(this.chart3Colors)) ;
        this.budgetAlertData = this.chart3BudgetData;
        this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart3BudgetColors));
      }
    }
    else if(parseInt(this.curBudgetChartType) ==4){
     if(this.chart4BudgetData && this.chart4BudgetColors){
      this.budgetAlertData = this.chart4BudgetData;
      this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart4BudgetColors));
      }
      else{
        this.chart4BudgetData = this.chart4Data;
        this.chart4BudgetColors = JSON.parse(JSON.stringify(this.chart4Colors));
        this.budgetAlertData = this.chart4BudgetData;
        this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart4BudgetColors));
      }
    }
    else if(parseInt(this.curBudgetChartType) ==5){
     if(this.chart5BudgetData && this.chart5BudgetColors){
      this.budgetAlertData = this.chart5BudgetData;
      this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart5BudgetColors));
      }
      else{
        this.chart5BudgetData = this.chart5Data;
        this.chart5BudgetColors = JSON.parse(JSON.stringify(this.chart5Colors));
        this.budgetAlertData = this.chart5BudgetData;
        this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart5BudgetColors));
      }
    
    }
    else if(parseInt(this.curBudgetChartType) ==6){
      if(this.chart6BudgetData && this.chart6BudgetColors){
      this.budgetAlertData = this.chart6BudgetData;
      this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart6BudgetColors));
      }
      else{
        this.chart6BudgetData = this.chart6Data;
        this.chart6BudgetColors = JSON.parse(JSON.stringify(this.chart6Colors));
        this.budgetAlertData = this.chart6BudgetData;
        this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart6BudgetColors));
      }
    }
    else if(parseInt(this.curBudgetChartType) ==7){
      if(this.chart7BudgetData && this.chart7BudgetColors){
      this.budgetAlertData = this.chart7BudgetData;
      this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart7BudgetColors));
      }
      else{
        this.chart7BudgetData = this.chart7Data;
        this.chart7BudgetColors = JSON.parse(JSON.stringify(this.chart7Colors));
        this.budgetAlertData = this.chart7BudgetData;
        this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart7BudgetColors));
      }
    }
    else if(parseInt(this.curBudgetChartType) ==8){
      if(this.chart8BudgetData && this.chart8BudgetColors){
      this.budgetAlertData = this.chart8BudgetData;
      this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart8BudgetColors));
      }
      else{
        this.chart8BudgetData =this.chart8Data;
        this.chart8BudgetColors = JSON.parse(JSON.stringify(this.chart8Colors));
        this.budgetAlertData = this.chart8BudgetData;
        this.curBudgetChartColors = JSON.parse(JSON.stringify(this.chart8BudgetColors));
      }
    }


  }
  addNotification(){
    let notificObj= {
  "costexceed":"",
  "budgetpercent":""
  };

  this.notificationArr.push(notificObj);
  }
  deleteNotification(index){

this.notificationArr.splice(index,1);
  }

  deleteRecipient(index){

this.recipientArr.splice(index,1);
  }

  addRecipient(){
    let recipObj= {
  "contact":"",
  "email":"",
  "mob":"",
  "contactArr":this.contactArr,
  "selectedContact":""
};
this.recipientArr.push(recipObj);
 }


  submitBugetAlert(){
  
    let check = false;
this.budgetAlertData.forEach((curSet,datasetIndex)=>{
  if(this.curBudgetChartColors.hasOwnProperty(datasetIndex)){
this.curBudgetChartColors[datasetIndex].borderColor = [];
this.curBudgetChartColors[datasetIndex].borderWidth = 2;
  curSet.data.forEach((val,dataIndex)=>{
    if( val>this.budgetcost){
    check = true;
    this.curBudgetChartColors[datasetIndex].borderColor[dataIndex]=('rgba(255,0,0,1)');

    }
    else{
      this.curBudgetChartColors[datasetIndex].borderColor[dataIndex]=('');
    }

  });
}
});
var dataSetObj1 = {
					"data": [],
					"label": "budget overflow" || "",
					"backgroundColor": ['rgb(255,255,255,1)'],
					"borderColor": ['rgba(255,0,0,1)']
				}
if(parseInt(this.curBudgetChartType) == 1){
  if(check){
  this.chart1Data = [];
  this.chart1Colors = [];
  this.chart1Data= this.budgetAlertData;
  // this.chart1Data.push(dataSetObj1);
  this.chart1Colors = JSON.parse(JSON.stringify(this.curBudgetChartColors));
  // this.chart1Options.scales.xAxes[0].barPercentage = 1;
}
else{
  this.chart1Data = [];
  this.chart1Colors = [];
  this.chart1Data= this.budgetAlertData;
  this.chart1Colors = JSON.parse(JSON.stringify(this.chart1BudgetColors));
}
}
else if(parseInt(this.curBudgetChartType) == 2){
if(check){
  this.chart2Data = [];
  this.chart2Colors = [];
  this.chart2Data= this.budgetAlertData;
  // this.chart2Data.push(dataSetObj1);
  this.chart2Colors = JSON.parse(JSON.stringify(this.curBudgetChartColors));
  // this.chart2Options.scales.xAxes[0].barPercentage = 1;
}
else{
  this.chart2Data = [];
  this.chart2Colors = [];
  this.chart2Data= this.budgetAlertData;
  this.chart2Colors = JSON.parse(JSON.stringify(this.chart2BudgetColors));
}
}
else if(parseInt(this.curBudgetChartType) == 3){
if(check){
  this.chart3Data = [];
  this.chart3Colors = [];
  this.chart3Data= this.budgetAlertData;
  // this.chart3Data.push(dataSetObj1);
  this.chart3Colors = JSON.parse(JSON.stringify(this.curBudgetChartColors));
  // this.chart3Options.scales.xAxes[0].barPercentage = 1;
}
}
else if(parseInt(this.curBudgetChartType) == 4){
if(check){
  this.chart4Data = [];
  this.chart4Colors = [];
  this.chart4Data= this.budgetAlertData;
  // this.chart4Data.push(dataSetObj1);
  this.chart4Colors = JSON.parse(JSON.stringify(this.curBudgetChartColors));
  // this.chart4Options.scales.xAxes[0].barPercentage = 1;
}
}
else if(parseInt(this.curBudgetChartType) == 5){
if(check){
  this.chart5Data = [];
  this.chart5Colors = [];
  this.chart5Data= this.budgetAlertData;
  // this.chart5Data.push(dataSetObj1);
  this.chart5Colors = JSON.parse(JSON.stringify(this.curBudgetChartColors));
  // this.chart5Options.scales.xAxes[0].barPercentage = 1;
}
}
else if(parseInt(this.curBudgetChartType) == 6){
if(check){
  this.chart6Data = [];
  this.chart6Colors = [];
  this.chart6Data= this.budgetAlertData;
  // this.chart6Data.push(dataSetObj1);
  this.chart6Colors = JSON.parse(JSON.stringify(this.curBudgetChartColors));
  // this.chart6Options.scales.xAxes[0].barPercentage = 1;
}
}
else if(parseInt(this.curBudgetChartType) == 7){
if(check){
  this.chart7Data = [];
  this.chart7Colors = [];
  this.chart7Data= this.budgetAlertData;
  // this.chart7Data.push(dataSetObj1);
  this.chart7Colors = JSON.parse(JSON.stringify(this.curBudgetChartColors));
  this.chart7Options.scales.xAxes[0].barPercentage = 1;
}
}
else if(parseInt(this.curBudgetChartType) == 8){
if(check){
  this.chart8Data = [];
  this.chart8Colors = [];
  this.chart8Data= this.budgetAlertData;
  // this.chart8Data.push(dataSetObj1);
  this.chart8Colors = JSON.parse(JSON.stringify(this.curBudgetChartColors));
  // this.chart8Options.scales.xAxes[0].barPercentage = 1;
}
}
this.toastr.success("Budget Alert Submitted Successfully");
this.closeBudgetPopup.nativeElement.click();
  }

chartChange($event){

  }

  navigateToCloudResell(){
  this.router.navigate([
        'dashboard/cloud-resell-apps'
  ]);
  }

  /*****************/
  navigateTobillingDetail(index){
    if(index==0){
  this.router.navigate([
        'dashboard/billing-details'
  ]);
  }
  }
  getDater(data){
      
    }
}