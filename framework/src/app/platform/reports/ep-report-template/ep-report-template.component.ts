import { Component, OnInit } from '@angular/core';
import { ReportsService } from './../service/reports.service';

@Component({
  selector: 'ep-report-template',
  templateUrl: './ep-report-template.component.html',
  styleUrls: ['./ep-report-template.component.css']
})
export class EpReportTemplateComponent implements OnInit {

  constructor( public reports: ReportsService ) { }

  ngOnInit() {
  }

}
