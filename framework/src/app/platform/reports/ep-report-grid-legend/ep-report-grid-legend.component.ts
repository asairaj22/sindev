import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ep-report-grid-legend',
  templateUrl: './ep-report-grid-legend.component.html',
  styleUrls: ['./ep-report-grid-legend.component.css']
})
export class EpReportGridLegendComponent implements OnInit {
  @Input() secObj: any;
  
  constructor() { }

  ngOnInit() {
  }

}
