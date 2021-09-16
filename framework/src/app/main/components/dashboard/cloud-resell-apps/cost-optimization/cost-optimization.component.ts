import { Component, OnInit, ElementRef } from '@angular/core';
import {ChartType,ChartOptions} from 'chart.js';
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from 'src/app/app.service';


@Component({
  selector: 'app-cost-optimization',
  templateUrl: './cost-optimization.component.html',
  styleUrls: ['./cost-optimization.component.css']
})
export class CostOptimizationComponent implements OnInit {

availableChart:any;
  selectedChart : any;
  private routerSub: any;
  item:any;
  accDetails:any;


  
  // Chart 3 configuration
  public chart3Type: string = 'bar';
  public chart3Data: Array<any> = [
    { data: [65, 59, 60, 81, 56, 55, 40], label: 'Licence'},
    { data: [21, 20, 60, 30, 14, 15, 16], label: 'Server Hardware' },
    { data: [21, 20, 60, 30, 14, 35, 16], label: 'Facility' },
    { data: [15, 20, 40, 30, 11, 15, 20], label: 'Storage' },
    { data: [21, 40, 40, 30, 34, 25, 46], label: 'Maintenance' },
    { data: [21, 30, 40, 30, 34, 15, 46], label: 'Network' },

  ];
public chart3Labels: Array<any> = ['Jan', 'Feb', 'March', 'April', 'May', 'Jun'];

public chart3Colors: Array<any> = [
    {
      backgroundColor: [
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)',
        'rgb(254, 180, 237)'
         
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
					fontColor: 'black',
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
			boxWidth: 40,
      align:'start',
			labels: {
				// usePointStyle: true,
				fontColor: 'black'
			}
		}
    };

  // chart 4 configuration
  public chart4Type: string = 'horizontalBar';
  public chart4Data: Array<any> = [
    { data: [65, 59, 157, 81, 56, 55, 40], label: 'My horiz data' }
  ];


  constructor(private  elemRef: ElementRef, private router: Router,private route: ActivatedRoute, private appService: AppService) { }

  ngOnInit() { 
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

  opensidenav(value: any, drawer: any, chartOption, currentChart, availableChart) {
		drawer.toggle();
		this.availableChart = availableChart.split(",");
    this.selectedChart = currentChart.charAt(0).toUpperCase() + currentChart.slice(1);
		
	}
chartChange($event){

  }

  navigateToCloudResell(){
  this.router.navigate([
        'dashboard/cloud-resell-apps/'
  ]);
  }

}