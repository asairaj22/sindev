import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import moment from 'moment';
@Component({
  selector: 'app-audit-log-table',
  templateUrl: './audit-log-table.component.html',
  styleUrls: ['./audit-log-table.component.css']
})
export class AuditLogTableComponent implements OnInit {
  @Input() auditReportTableData: object[];
  @Input() defaultDateTimeFormat : string;
  @Input() userNamesMap: any;
  @Output() triggerBack = new EventEmitter<any>();
  @Output() viewAuditDetails = new EventEmitter<any>();
  @Output() compareAuditLog = new EventEmitter<any>();
  columnDefs: any;
  context: any;

  constructor() { }

  ngOnInit() {
    this.initGridDetails();
  }

  multipleRowDataArr:any = [];

  initGridDetails(){
    this.context = { componentParent: this };
    this.columnDefs = [{ headerName: '',width: 30, cellClass: 'no-border'},
      {headerName: 'Date', field: 'createdDate',cellRenderer: (data: any) => {
        return moment(data.value).format(this.defaultDateTimeFormat)
    }, sortable: true },
      {headerName: 'Users', field: 'userName', cellRenderer: (data: any) => {
        return data.node.data.authorName || this.userNamesMap[data.value] || data.value || "";
    }, sortable: true },
      {headerName: 'Summary', field: 'changeSummary', sortable: true },
      {headerName: 'Object PK', field: 'objectPK', sortable: true },
      {headerName: 'Action', sortable: false }
    ];
  }

  getRowData(rowData :any){
    this.viewAuditDetails.emit(rowData);
  }

  getRowDataCheckbox(multipleRowData: any){
    this.multipleRowDataArr = multipleRowData;
  }

  triggerBackScreen(){
    this.triggerBack.emit('audit-log-report');
  }

  compareAudit(){
    this.compareAuditLog.emit(this.multipleRowDataArr);
  }


}
