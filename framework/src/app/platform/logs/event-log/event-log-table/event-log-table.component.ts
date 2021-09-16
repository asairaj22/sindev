import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-event-log-table',
  templateUrl: './event-log-table.component.html',
  styleUrls: ['./event-log-table.component.css']
})
export class EventLogTableComponent implements OnInit {
  @Input() eventReportTableData: object[];
  @Input() defaultDateTimeFormat: string;
  @Output() viewEventDetails = new EventEmitter<any>();
  @Output() triggerBack = new EventEmitter<any>();
  columnDefs: any;
  context: any;

  constructor() { }

  initGridDetails(){
    this.context = { componentParent: this };
    this.columnDefs = [
      {headerName: 'Api Name', field: 'apiName', sortable: true },
      {headerName: 'Api Path', field: 'apiPath', sortable: true },
      {headerName: 'Application', field: 'applicationName', sortable: true },
      {headerName: 'Task', field: 'taskName', sortable: true },
      {headerName: 'Created Date', field: 'eventDate', sortable: true, sort: 'desc' },
      {headerName: 'User', field: 'userName', sortable: true },
      {headerName: 'Action', sortable: false }
    ];
  }

  ngOnInit() {
    this.initGridDetails();
  }

  getRowData(rowData: any){
    this.viewEventDetails.emit(rowData);
  } 

  triggerBackScreen(){
    this.triggerBack.emit('event-log-table');
  }

}
