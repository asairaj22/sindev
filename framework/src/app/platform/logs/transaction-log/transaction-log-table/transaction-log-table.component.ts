import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-transaction-log-table',
  templateUrl: './transaction-log-table.component.html',
  styleUrls: ['./transaction-log-table.component.css']
})
export class TransactionLogTableComponent implements OnInit {
  @Input() transactionReportTableData: object[];
  @Input() defaultDateTimeFormat: string;
  @Output() viewTransactionDetails = new EventEmitter<any>();
  @Output() triggerBack = new EventEmitter<any>();
  columnDefs: any;
  context: any;


  constructor() { }

  initGridDetails(){
    this.context = { componentParent: this };
    this.columnDefs = [
      {headerName: 'Connector Name', field: 'connectorName', sortable: true },
      {headerName: 'Operation', field: 'operation', sortable: true },
      {headerName: 'Method', field: 'method', sortable: true },
      {headerName: 'Start Time', field: 'startTime', sortable: true, sort: 'desc' },
      {headerName: 'End Time', field: 'endTime', sortable: true },
      {headerName: 'Response Time (ms)', field: 'responseTime', sortable: true },
      {headerName: 'Status', field: 'success', sortable: true },
      {headerName: 'User Name', field: 'userName', sortable: true },
      {headerName: 'Action', sortable: false }
    ];
  }

  ngOnInit() {
    this.initGridDetails();
  }

  getRowData(rowData: any){
    this.viewTransactionDetails.emit(rowData);
  } 

  triggerBackScreen(){
    this.triggerBack.emit('transaction-log-table');
  }

}
