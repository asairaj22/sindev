import {Component,OnInit,ElementRef,HostListener,ViewChild} from '@angular/core';
import {ChartType,ChartOptions, Chart} from 'chart.js';
import {AppService} from "src/app/app.service";
import { Table } from "primeng/table";
import {CdkDragDrop,moveItemInArray} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from "@angular/router";
// import { monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
declare function require(name: string);
import * as orbiteraJson from 'src/assets/json/Orbitera.json'
var Highcharts = require('highcharts');
import moment from 'moment';
import {Moment} from 'moment';
// import { BaseChartDirective }   from 'ng2-charts/ng2-charts';
import { ChangeDetectorRef } from '@angular/core';
interface BillingInvoice {
    cloudAccount?: string;
    instanceName?: string;
    billingDate?: string;
    usagePeriod?: string;
    usageAmount?: number;
}


@Component({
selector: 'app-appdashboard',	
templateUrl: './appdashboard.component.html',
styleUrls: ['./appdashboard.component.css']
})
export class AppdashboardComponent implements OnInit {
// dailySpendData = [];
public dailySpendData = [];
public topCustomerCostData = [];
dateRangeFilterd:string = "";
filteredChartlabels = [];
starDateReq:string;
endDateReq:string;
public startDate: Date;
public endDate: Date;
public billingStartDate:Date;
public billingEndDate:Date;
billingReqStartDate:string;
billingReqEndDate:string;
// billingDateValue:string;
selectedBilling:BillingInvoice[];
billingInvoiceData:any = [];
dailyChartExist:boolean=false;
productChartExist:boolean=false;
customerChartExist:boolean=false;

// topCustCostAcclenthBoolean:boolean = false;
pulsecanvas: any;
  pulse: any;
  @ViewChild('mychart', {static:false}) mychart;
	@ViewChild('chart1', {static:false}) chart1;
	@ViewChild('chart2', {static:false}) chart2;
	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild("reportsDateRange", { static: false }) reportsDateRange;

// public dailySpendColors: Array<any> = [
//     {
//       backgroundColor: 'rgba(22, 134, 243,1)',
//       borderColor: 'rgba(22, 134, 243,1)',
// 	  fill:false,
//       borderWidth: 2,
//     },
//     {
//       backgroundColor: 'rgba(253, 136, 36,1)',
//       borderColor: 'rgba(253, 136, 36,1)',
// 	  fill:false,
//       borderWidth: 2,
//     }
//   ];
public dailySpendColors: Array<any> =[
    {
      backgroundColor: [
        'rgba(22, 134, 243,0.1)',
        'rgba(253, 136, 36,0.1)',
        'rgba(185, 63, 184,0.1)',
        'rgba(105, 181, 74,0.1)',
        'rgba(83, 107, 190,0.1)'
         
      ]
    }
	];
	public dailySpendBorderColors: Array<any> =[
    {
      backgroundColor: [
        'rgba(22, 134, 243)',
        'rgba(253, 136, 36)',
        'rgba(185, 63, 184)',
        'rgba(105, 181, 74)',
        'rgba(83, 107, 190)'
         
      ]
    }
	];
	// public topCustomerCostColors: Array<any> = [
  //   {
  //     backgroundColor: 'rgba(22, 134, 243,1)',
  //     borderColor: 'rgba(22, 134, 243,1)',
	//   fill:false,
  //     borderWidth: 2,
  //   },
  //   {
  //     backgroundColor: 'rgba(253, 136, 36,1)',
  //     borderColor: 'rgba(253, 136, 36,1)',
	//   fill:false,
  //     borderWidth: 2,
  //   },
	// 	{
  //     backgroundColor: 'rgba(185, 63, 184,1)',
  //     borderColor: 'rgba(185, 63, 184,1)',
	//   fill:false,
  //     borderWidth: 2,
  //   },
	// 	{
  //     backgroundColor: 'rgba(105, 181, 74,1)',
  //     borderColor: 'rgba(105, 181, 74,1)',
	//   fill:false,
  //     borderWidth: 2,
  //   },
	// 	{
  //     backgroundColor: 'rgba(83, 107, 190,1)',
  //     borderColor: 'rgba(83, 107, 190,1)',
	//   fill:false,
  //     borderWidth: 2,
  //   },	
	// 	{
  //     backgroundColor: 'rgba(185, 53, 154,1)',
  //     borderColor: 'rgba(185, 53, 154,1)',
	//   fill:false,
  //     borderWidth: 2,
  //   },
	// 	{
  //     backgroundColor: 'rgba(145, 63, 124,1)',
  //     borderColor: 'rgba(145, 63, 124,1)',
	//   fill:false,
  //     borderWidth: 2,
  //   },
  // ];
	public topCustomerCostColors: Array<any> =[
    {
      backgroundColor: [
        'rgba(22, 134, 243,0.1)',
        'rgba(253, 136, 36,0.1)',
        'rgba(185, 63, 184,0.1)',
        'rgba(105, 181, 74,0.1)',
        'rgba(83, 107, 190,0.1)',
				'rgba(185, 53, 154,0.1)',
				'rgba(145, 63, 124,0.1)'

         
      ]
    }
	];
	public topCustomerCostBorderColors: Array<any> =[
    {
      backgroundColor: [
        'rgba(22, 134, 243)',
        'rgba(253, 136, 36)',
        'rgba(185, 63, 184)',
        'rgba(105, 181, 74)',
        'rgba(83, 107, 190)',
				'rgba(185, 53, 154)',
				'rgba(145, 63, 124)'

         
      ]
    }
	];
  public top5SpendColors: Array<any> =[
    {
      backgroundColor: [
        'rgba(22, 134, 243,1)',
        'rgba(253, 136, 36,1)',
        'rgba(185, 63, 184,1)',
        'rgba(105, 181, 74,1)',
        'rgba(83, 107, 190,1)'
         
      ]
    }
	];
top5ProdMarketData= [];
public top5ProdData = [];
top5SpendProdChart = false;
top5SpendProdMarketChart = false;
dailySpendLabels = [];
topCustomerCostLabels = [];
top5ProdLabels = [];
top5ProdMarketLabels = [];
dailySpendType:string;
topCustomerCostType:string;
top5ProdChartType:string;
top5ProdMarketChartType:string;
cardsArray = [];
orbiteraCustomerId:any;
sessionId:string;
top5ProdMarketOptions = {
	responsive: true,
		scales: {
			xAxes: [{
				stacked: true,
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
	},
	legend:{
		display:false
	}
};
public top5ProdOptions :any;
public dailySpendOptions:any;
public topCustomerCostOptions:any;
constructor(private cdRef: ChangeDetectorRef,private marketProductservice: AppService, private router: Router,private route: ActivatedRoute) {}
pulseChart:any;
dailySpendChart:any;
top5SpendChart: any;
ngOnInit(){

this.dateFilterFun("YEAR_TO_DATE",'Year to Date');

}

ngAfterViewInit() {
    
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
chartLoadFun(){
let individualObj = {"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''};
this.marketProductservice.getOrbiteraDashboardByAccount(individualObj).subscribe((res)=>{
if(res.body){
this.cardsArray = res.body.dashboardCardIds;
this.sessionId = res.body.sessionId;
this.orbiteraCustomerId = sessionStorage.getItem('customerId');
if(this.cardsArray && this.cardsArray.length>0 && this.sessionId && this.orbiteraCustomerId){

this.cardsArray.forEach((carditem)=>{
let inputObj: {[k: string]: any} = {};
 inputObj = {
"dateRange": {
	"relativeDateRange": this.dateRangeFilterd,
},
"paramId": carditem,
"sessionId":this.sessionId,
"id": this.orbiteraCustomerId,
"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
};
let fixedDateRangeObj =  {
      "startDate": (this.starDateReq)?this.starDateReq : "",
      "endDate": (this.endDateReq)?this.endDateReq : ""
    };
if(this.dateRangeFilterd == "CUSTOM"){
	inputObj.dateRange.fixedDateRange = fixedDateRangeObj;
}	
else {
	if(inputObj.dateRange.fixedDateRange){
     delete inputObj.dateRange.fixedDateRange;
	}
		}
this.marketProductservice.getOrbiteraDashboardByCustFilter(inputObj).subscribe((res)=>{

this.setChartsData(res.body);
});		 

});
}
}
});
}


setChartsData(data){
this.dailySpendData = [];
this.top5ProdData = [];
this.top5ProdMarketData = [];
this.topCustomerCostData = [];

if(data.title=="Daily spend"){
let dailySpendData = [];
let dailySpendLabels = [];
this.dailySpendType = 'line'; 
let dailySpendSeries = data.dataSeries;

if(!dailySpendSeries){
  this.dailyChartExist=false;
	this.dailySpendChart.destroy();
}
else
{
this.dailyChartExist=true;
dailySpendSeries.forEach((seriesItem,index)=>{
	dailySpendLabels = [];
let dataObj = {
"data":[],
lineTension: 0,
"label":seriesItem.label || "",
"pointRadius": 4,
"pointHoverRadius": 8,
// backgroundColor: "rgba(255, 99, 132,0.4)",
// borderColor: "rgb(255, 99, 132)",
fill:true,
backgroundColor:this.dailySpendColors[0].backgroundColor[index],
borderColor:this.dailySpendBorderColors[0].backgroundColor[index]
};
seriesItem.dataPoints.forEach((dataitem)=>{
// dataObj.data.push(dataitem.value);
let yValue = dataitem.label + "000";
	 let	xlabelvalue = moment(new Date(parseInt(yValue))).format('MMM D');
			dailySpendLabels.push(xlabelvalue);
 
			if (this.dateRangeFilterd == "YEAR_TO_DATE"){
				yValue = moment(new Date(parseInt(yValue))).format('MMM D YYYY');
			}
			else{
				yValue = moment(new Date(parseInt(yValue))).format('MMM D');
			}
			var obj = {
				'x': yValue,
				'y': dataitem.value
			};
			dataObj.data.push(obj);
});
// dataObj.data.pointBackgroundColor = this.dailySpendColors;
dailySpendData.push(dataObj);
});
// this.dailySpendLabels = this.filteredChartlabels;
// this.dailySpendData.length = 0;
// this.dailySpendData.push(...dailySpendData);
// this.dailySpendOptions = {
// 	scaleShowVerticalLines: false,
// 	responsive: true,
// 	maintainAspectRatio: false,
// 	legend: {
// 		position: 'bottom',
// 		boxWidth: 10,
// 		labels: {
// 			usePointStyle: true,
// 			// fontColor: 'black'
// 		}
// 	},
// 	scales: {
// 		yAxes: [{
// 			type: "linear",
// 			ticks: {
// 				// fontColor: 'black',
// 				beginAtZero: true,
// 				// Include a dollar sign in the ticks
// 				callback: function (dailySpendData) {
// 					return '$' + dailySpendData;
// 				}
// 			},
// 			position: 'right',
// 		}],
// 		xAxes: [{
// 			ticks: {
// 				// fontColor: 'black'
// 			}
// 		}]
// 	}
// };
if (this.dateRangeFilterd == "LAST_MONTH" || this.dateRangeFilterd == "LAST_YEAR" ) {
							// this.dailySpendLabels.length = 0;
						  this.dailySpendLabels = this.filteredChartlabels;

					}else{
       this.dailySpendLabels.length = 0;
       this.dailySpendLabels.push(...dailySpendLabels);	
					}
					//creating new chart
		if(this.dailySpendChart && this.dailySpendChart.canvas){
      this.dailySpendChart.destroy();
		}
	let dailyspendcanvas = this.chart1.nativeElement; 
    let dailyspendDimnsn = dailyspendcanvas.getContext('2d');
     this.dailySpendChart = new Chart(dailyspendDimnsn, {
      type: 'line',
      data: {
				labels:dailySpendLabels,
        datasets:dailySpendData,
				colors:this.dailySpendColors
      },
     options:{
	scaleShowVerticalLines: false,
	responsive: true,
	maintainAspectRatio: false,
	legend: {
		position: 'bottom',
		boxWidth: 10,
		labels: {
			usePointStyle: true,
			// fontSize:4
			// fontColor: 'black'
		}
	},
	scales: {
		yAxes: [{
			type: "linear",
			ticks: {
				// fontColor: 'black',
				beginAtZero: true,
				// Include a dollar sign in the ticks
				callback: function (dailySpendData) {
					if(dailySpendData && dailySpendData < 0) {
						return '-$' + dailySpendData.toLocaleString().replace(/[^0-9]/g, '');
					} else {
						return '$' + dailySpendData;
					}
				}
			},
			position: 'right',
		}],
		xAxes: [{
			ticks: {
				// fontColor: 'black'
			}
		}]
	}
}
    });
}
}
if(data.title=="Top 5 spend by product"){
	let top5ProdData = [];
// 	this.top5ProdOptions = {
// 	responsive: true,
// 		scales: {
// 			xAxes: [{
// 				stacked: true,
// 					gridLines: {
// 			display: false
// 		}
// 		}],
// 			yAxes: [
// 			{
// 				stacked: true,
// 				barPercentage: 0.6,

// 			}
// 		]
// 	},
// 	legend:{
// 		display:false
// 	}
// };

this.top5ProdChartType = 'horizontalBar'; 
let top5ProdSeries = data.dataSeries;
let labels = [];
 this.productChartExist=true;
if(!top5ProdSeries){
   this.productChartExist=false;
}
(top5ProdSeries || []).forEach((seriesItem,index)=>{
	labels = [];
let dataObj = {
"data":[],
"label":seriesItem.label || "",
backgroundColor : [
        'rgba(22, 134, 243,1)',
        'rgba(253, 136, 36,1)',
        'rgba(185, 63, 184,1)',
        'rgba(105, 181, 74,1)',
        'rgba(83, 107, 190,1)'
         
      ]
};
seriesItem.dataPoints.forEach((dataitem,index)=>{
dataObj.data.push(dataitem.value);
labels.push(dataitem.label);
});
// this.top5ProdLabels = JSON.parse(JSON.stringify(labels));
top5ProdData.push(dataObj);

});
this.top5ProdData.length = 0;
this.top5ProdData.push(...top5ProdData);
this.top5ProdLabels.length = 0;
this.top5ProdLabels.push(...labels);
//creating new chart
// $('#chart2').empty().append('<canvas baseChart id="chart2" style="height:270px;width:100%;" #chart2></canvas>');
if(typeof this.top5SpendChart ==='undefined'){
  //  this.top5SpendChart.destroy();
	let top5spendcanvas = this.chart2.nativeElement; 
    let top5spendDimnsn = top5spendcanvas.getContext('2d');
    this.top5SpendChart = new Chart(top5spendDimnsn, {
      type: 'horizontalBar',
      data: {
				labels:labels,
        datasets:top5ProdData
      },
     options:{
		responsive:true,
		scales: {
			xAxes: [{
				stacked: true,
				ticks: {
					// fontColor: 'black',
					beginAtZero: true,
					// Include a dollar sign in the ticks
					callback: function (top5ProdData) {
						if(top5ProdData && top5ProdData < 0) {
							return '-$' + top5ProdData.toLocaleString().replace(/[^0-9]/g, '');
						} else {
							return '$' + top5ProdData;
						}
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
	},
	legend:{
		display:false
	}
}
    });
}
else if(this.top5SpendChart && this.top5SpendChart.options){
 this.top5SpendChart.config.data.labels = labels;
 this.top5SpendChart.config.data.datasets = top5ProdData; 
 if(!this.productChartExist){
     this.top5SpendChart.destroy();
		  this.top5SpendChart=undefined;
 }
// this.top5SpendChart.scales['x-axis-0'].ticks=[];
 else
 this.top5SpendChart.update();
	}

}
// if(data.title=="Top customer cost by account number"){
// let topCustomerCostData = [];
// let topCustomerCostLabels = [];
// this.topCustomerCostType = 'line'; 
// let dailySpendSeries = data.dataSeries;
// dailySpendSeries.forEach((seriesItem,index)=>{
// let dataObj = {
// "data":[],
// "label":seriesItem.label || "",
// "pointRadius": 8,
// "pointHoverRadius": 8
// };
// seriesItem.dataPoints.forEach((dataitem)=>{
// // dataObj.data.push(dataitem.value);
// let yValue = dataitem.label + "000";
// let	xlabelvalue = moment(new Date(parseInt(yValue))).format('MMM D');
// 			topCustomerCostLabels.push(xlabelvalue);


// 			if (this.dateRangeFilterd == "YEAR_TO_DATE"){
// 				yValue = moment(new Date(parseInt(yValue))).format('MMM D YYYY');
// 			}
// 			else{
// 				yValue = moment(new Date(parseInt(yValue))).format('MMM D');
// 			}
// 			var obj = {
// 				'x': yValue,
// 				'y': dataitem.value
// 			};
// 			dataObj.data.push(obj);
// });
// topCustomerCostData.push(dataObj);
// });
// // this.topCustomerCostLabels = this.filteredChartlabels;
// this.topCustomerCostData.length = 0;
// this.topCustomerCostData.push(...topCustomerCostData);
// this.topCustomerCostOptions = {
// 	scaleShowVerticalLines: false,
// 	responsive: true,
// 	maintainAspectRatio: false,
// 	legend: {
// 		position: 'bottom',
// 		boxWidth: 10,
// 		labels: {
// 			usePointStyle: true,
// 			// fontColor: 'black'
// 		}
// 	},
// 	scales: {
// 		yAxes: [{
// 			type: "linear",
// 			ticks: {
// 				// fontColor: 'black',
// 				beginAtZero: true,
// 				// Include a dollar sign in the ticks
// 				callback: function (topCustomerCostData) {
// 					return '$' + topCustomerCostData;
// 				}
// 			},
// 			position: 'right',
// 		}],
// 		xAxes: [{
// 			ticks: {
// 				// fontColor: 'black'
// 			}
// 		}]
// 	}
// };
// if (this.dateRangeFilterd == "MONTH_TO_DATE") {
// 						if (this.topCustomerCostOptions.scales.xAxes[0] && this.topCustomerCostOptions.scales.xAxes[0].type)
// 							delete this.topCustomerCostOptions.scales.xAxes[0].type;
// 							this.topCustomerCostLabels.length = 0;
// 						this.top5ProdMarketLabels = this.filteredChartlabels;

// 					}else{
// 						this.topCustomerCostLabels.length = 0;
//          this.topCustomerCostLabels.push(...topCustomerCostLabels);
// 					}
// 					// if (this.dateRangeFilterd == "YEAR_TO_DATE") {
// 					// 	this.topCustomerCostOptions.scales.xAxes[0].type = "time";
// 					// 	this.topCustomerCostLabels = [];
// 					// }
					
// this.topCustomerCostChart = true;
// }

if(data.title=="Top customer cost by account number"){
	let dummyObj = [];
	let topCustomerCostData = [];
let topCustomerCostLabels = [];
this.topCustomerCostType = 'line'; 
let dailySpendSeries = data.dataSeries;
if(!dailySpendSeries){
	this.pulseChart.destroy();
   this.customerChartExist=false;
}
 else{
	 this.customerChartExist=true;
dailySpendSeries.forEach((seriesItem,index)=>{
topCustomerCostLabels = [];
let dataObj = {
"data":[],
lineTension: 0,
"label":seriesItem.label || "",
"pointRadius": 4,
"pointHoverRadius": 8,
// backgroundColor: "rgba(255, 99, 132,0.4)",
// borderColor: "rgb(255, 99, 132)",
fill: true,
backgroundColor:this.topCustomerCostColors[0].backgroundColor[index],
borderColor:this.topCustomerCostBorderColors[0].backgroundColor[index]
};
seriesItem.dataPoints.forEach((dataitem)=>{
// dataObj.data.push(dataitem.value);
let yValue = dataitem.label + "000";
let	xlabelvalue = moment(new Date(parseInt(yValue))).format('MMM D');
			topCustomerCostLabels.push(xlabelvalue);


			if (this.dateRangeFilterd == "YEAR_TO_DATE"){
				yValue = moment(new Date(parseInt(yValue))).format('MMM D YYYY');
			}
			else{
				yValue = moment(new Date(parseInt(yValue))).format('MMM D');
			}
			var obj = {
				'x': yValue,
				'y': dataitem.value
			};
			dataObj.data.push(obj);
			// topCustomerCostData.push(obj);
});
topCustomerCostData.push(dataObj);
});
if (this.dateRangeFilterd == "MONTH_TO_DATE") {
	             if(this.topCustomerCostOptions)
							delete this.topCustomerCostOptions.scales.xAxes[0].type;
							this.topCustomerCostLabels.length = 0;
						this.topCustomerCostLabels = this.filteredChartlabels;

					}else{
						this.topCustomerCostLabels.length = 0;
         this.topCustomerCostLabels.push(...topCustomerCostLabels);
					}
// 	data.dataSeries[0].dataPoints.forEach(pt =>{
// 	// if(pt.value != 0){ 
// 				dummyObj.push({x:parseFloat(pt.label).toFixed(2),y:parseFloat(pt.value).toFixed(2)});
// 	// }
// });
	this.pulsecanvas = this.mychart.nativeElement; 
    this.pulse = this.pulsecanvas.getContext('2d');
		if(this.pulseChart && this.pulseChart.canvas){
      this.pulseChart.destroy();
		}
    this.pulseChart = new Chart(this.pulse, {
      type: 'line',
      data: {
				labels:topCustomerCostLabels,
        datasets:topCustomerCostData
      },
     options:{
	scaleShowVerticalLines: false,
	responsive: true,
	maintainAspectRatio: false,
	legend: {
		position: 'bottom',
		boxWidth: 10,
		labels: {
			usePointStyle: true,
			// fontSize:4
			// fontColor: 'black'
		}
	},
	scales: {
		yAxes: [{
			type: "linear",
			ticks: {
				// fontColor: 'black',
				beginAtZero: true,
				// Include a dollar sign in the ticks
				callback: function (topCustomerCostData) {
					if(topCustomerCostData && topCustomerCostData < 0) {
						return '-$' + topCustomerCostData.toLocaleString().replace(/[^0-9]/g, '');
					} else {
						return '$' + topCustomerCostData;
					}
				}
			},
			position: 'right',
		}],
		xAxes: [{
			ticks: {
				// fontColor: 'black'
			}
		}]
	}
}
    });
// this.pulseChart.options.title.text = data.dataSeries[0].label;
// this.pulseChart.options.scales.xAxes[0].scaleLabel.labelString = data.dataSeries[0].valueType;
// this.pulseChart.options.scales.yAxes[0].scaleLabel.labelString = data.dataSeries[0].labelType;

}

}
}


dateRangeFilterdLabel:string = "Date Range";

dateFilterFun(dateFilterd,labelData) {
this.dateRangeFilterd = dateFilterd;
this.dateRangeFilterdLabel = labelData;
if(this.dateRangeFilterd != "CUSTOM"){
	if(this.reportsDateRange){
		this.reportsDateRange.clear();
	}
	
}
if (this.dateRangeFilterd == "MONTH_TO_DATE") {
	this.filteredChartlabels = [];
	let start = new Date(moment().startOf('month').format('YYYY-MM-DD'));
	let end: any = new Date(moment().format('YYYY-MM-DD'));
	end = moment(end, "YYYY-MM-DD").add('days', 1);

	while (start < end) {
		let temp = moment(start).format('LL');
		temp = moment(temp).format('MMM D');
		this.filteredChartlabels.push(temp);
		let newDate = start.setDate(start.getDate() + 1);
		start = new Date(newDate);
	}
		this.chartLoadFun();
}
if (this.dateRangeFilterd == "YEAR_TO_DATE") {
	this.filteredChartlabels = [];

	let start: any = moment().startOf('year').format('YYYY-MM-DD');
	let end: any = moment().format('YYYY-MM-DD');
	start = moment(start, 'YYYY-MM-DD');
	end = moment(end, 'YYYY-MM-DD');

	while (start < end) {
		var a = start.startOf('month').format('YYYY-MM-DD');
		a = moment(a).format('MMM D');
		this.filteredChartlabels.push(a);
		start.add(1, 'month')
	}
	this.chartLoadFun();
}
if (this.dateRangeFilterd == "QUARTER_TO_DATE") {
	this.filteredChartlabels = [];

	let start: any = moment().quarter(moment().quarter()).startOf('quarter').format('YYYY-MM-DD');
	let end: any = moment().format('YYYY-MM-DD');
	start = moment(start, 'YYYY-MM-DD');
	end = moment(end, 'YYYY-MM-DD');

	while (start < end) {
		var a = start.startOf('month').format('YYYY-MM-DD');
		a = moment(a).format('MMM D');
		this.filteredChartlabels.push(a);
		start.add(1, 'month')
	}
	this.chartLoadFun();
}
if (this.dateRangeFilterd == "LAST_MONTH") {
	this.filteredChartlabels = [];
	var start: any = new Date(moment().startOf('month').subtract(1, 'month').format("YYYY-MM-DD"));
	var end: any = new Date(moment().endOf('month').subtract(1, 'month').format("YYYY-MM-DD"));

	while (start < end) {
		let temp = moment(start).format('LL');
		temp = temp.slice(0, temp.indexOf(','));
		this.filteredChartlabels.push(temp);
		let newDate = start.setDate(start.getDate() + 5);
		start = new Date(newDate);
	}
	this.chartLoadFun();
}
if (this.dateRangeFilterd == "LAST_QUARTER") {
	this.filteredChartlabels = [];
	let quarterAdjustment = (moment().month() % 3) + 1;
	let end: any = moment().subtract({
		months: quarterAdjustment
	}).endOf('month');
	let start: any = end.clone().subtract({
		months: 3
	}).startOf('month');
	end =new Date(moment(end).format("YYYY-MM-DD"));
	start = new Date(moment(start).add(1, 'month').format("YYYY-MM-DD"));

	while (start < end) {
		// let temp = moment(start).startOf('month').format('YYYY-MM-DD');
		// temp = moment(temp).format('MMM D');
		// this.filteredChartlabels.push(temp);
		//  start = moment(start).add(1, 'month').format("YYYY-MM-DD");
		let temp = moment(start).format('LL');
		temp = moment(temp).format('MMM D');
		// temp = temp.slice(0, temp.indexOf(','));
		this.filteredChartlabels.push(temp);
		let newDate = start.setDate(start.getDate() + 5);
		start = new Date(newDate);
	}
	this.chartLoadFun();
}
if (this.dateRangeFilterd == "LAST_YEAR") {
	this.filteredChartlabels = [];
	this.filteredChartlabels = Array.apply(0, Array(12)).map(function (_, i) {
		return (moment().subtract(1, 'year').month(i).format('MMM') + '1')
	});
	this.chartLoadFun();
}
}
dateChanged(data) {
		let startDate;
		let endDate;
		if(data.startDate && data.endDate){
			let startmonth = (data.startDate.getMonth());
		 startDate = data.startDate.getFullYear()+ "-" + startmonth +"-" +data.startDate.getDate() + "T00:00:00Z";
		 let endmonth = (data.endDate.getMonth())
		 endDate = data.endDate.getFullYear()+ "-" + endmonth +"-" +data.endDate.getDate() + "T00:00:00Z";
		this.starDateReq = startDate;
		this.endDateReq = endDate;
		this.dateRangeFilterd = "CUSTOM";
		this.chartLoadFun();
		}
		else{
			this.starDateReq = "";
			this.endDateReq = "";
			this.startDate = null;
			this.endDate = null;
		}

  }

getBillingInvoice(){

	let inputObj = {
"customerid": this.orbiteraCustomerId,
"startmonth":(this.billingReqStartDate)? this.billingReqStartDate :'',
"endmonth":(this.billingReqEndDate)? this.billingReqEndDate :'',
"individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
};
		this.marketProductservice.getOrbiteraBillingInvoice(inputObj).subscribe((res)=>{
    let billingInvoiceData = res.body;
     billingInvoiceData.forEach((billingitem,index)=>{
			 billingInvoiceData[index].usageAmount = (billingitem.usageDetails && billingitem.usageDetails.totalamount)? "$" + (billingitem.usageDetails.totalamount).toFixed(2) : "$0.00";
			 billingInvoiceData[index].usagePeriod = (billingitem.billingStartDate && billingitem.billingEndDate)? (billingitem.billingStartDate + " - " + billingitem.billingEndDate) : "-" ;
		 }
		 );
		 this.billingInvoiceData = billingInvoiceData;
		});
	}
	billingDateChanged(data){
		if(data.startDate){
 let billingstartdate = new Date(data.startDate);
 this.billingReqStartDate = billingstartdate.getFullYear()+""+ (('0' + (billingstartdate.getMonth()+1)).slice(-2));

// let displayStartDate = billingstartdate.toLocaleString('default', { month: 'short' }) + " "+ billingstartdate.getFullYear();
// this.billingStartDate = displayStartDate;

		}

if(data.endDate){
 let billingenddate = new Date(data.endDate);
this.billingReqEndDate = billingenddate.getFullYear()+"" + (('0' + (billingenddate.getMonth()+1)).slice(-2));
// let displayEndDate = billingenddate.toLocaleString('default', { month: 'short' }) + " "+ billingenddate.getFullYear();
// this.billingEndDate = displayEndDate;

		}
		this.getBillingInvoice();
	}
	billingDateClear(){
		this.billingReqStartDate = '';
		this.billingReqEndDate = '';
	}
	navigateToDetails(billingitem){
		this.marketProductservice.billingInvoiceSelect(billingitem);
this.router.navigate([
        'appdashboard/billing-details'
  ]);
	}
}