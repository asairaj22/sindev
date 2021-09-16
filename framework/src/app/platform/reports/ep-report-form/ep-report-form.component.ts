import { Component, OnInit, Input } from '@angular/core';
import { ReportTemplateService } from './../service/report-template.service';

@Component({
  selector: 'ep-report-form',
  templateUrl: './ep-report-form.component.html',
  styleUrls: ['./ep-report-form.component.css']
})
export class EpReportFormComponent implements OnInit {
  @Input() secObj: any;
  constructor( private report_template: ReportTemplateService ) { }

  ngOnInit() {
  }

}
