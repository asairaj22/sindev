import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ep-report-chart',
  templateUrl: './ep-report-chart.component.html',
  styleUrls: ['./ep-report-chart.component.css']
})
export class EpReportChartComponent implements OnInit {
  @Input() secObj: any;

  constructor() { }

  ngOnInit() {
  }

}
