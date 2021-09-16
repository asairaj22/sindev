import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TransactionLogActionsComponent } from './../actions/transaction-log-actions.component';
import moment from 'moment';

@Component({
  selector: 'app-data-grid-transaction-log',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css']
})
export class DataGridComponent implements OnInit {
  @Input() gridData: object[];
  @Input() private defaultDateTimeFormat: string;
  @Input() columnDefs: object[];
  @Input() context: object;
  @Output() getRowData = new EventEmitter<any>();
  @Output() getRowDataCheckbox = new EventEmitter<any>();

  private gridApi: any;
  pageSize: any = 10;
  searchText: string = '';
  frameworkComponents: object;

  static defaultDateTimeFormat_local: any;

  constructor() { }

  initGridDetails(){
    DataGridComponent.defaultDateTimeFormat_local = this.defaultDateTimeFormat;
    this.frameworkComponents = {
		transactionLogsActionComponent: TransactionLogActionsComponent
	}
    this.context = { componentParent: this };
    this.setColDefFormatters();
  }

  setColDefFormatters(){
    this.columnDefs.forEach((colDef: any) => {
      if(!colDef.valueFormatter) {
        const headerName: string = colDef.headerName;
        switch (headerName) {
          case 'Start Time':
          case 'End Time':
            colDef.valueFormatter = dateValueFormatter;
            break;
          case 'Method':
            colDef.valueFormatter = 'value.toUpperCase()';
            break;
          case 'Status':
            colDef.valueFormatter = statusValueFormatter;
            break;
          case 'User Name':
            colDef.cellRenderer = UserNameCellRenderer;
            break;
          case 'Action':
            colDef.cellRenderer = 'transactionLogsActionComponent';
            break;
          default:
            colDef.valueFormatter = textValueFormatter;
            break;
        }
      }
    });
  }

  ngOnInit() {
    this.initGridDetails();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setDomLayout("autoHeight");
    this.gridApi.paginationSetPageSize(Number(this.pageSize));
  }

  onPageSizeChanged() {
    this.gridApi.paginationSetPageSize(Number(this.pageSize));
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.searchText);
  }

  passCurrentRowData(rowData: any){
    this.getRowData.emit(rowData);
  } 

}

function textValueFormatter(params: any){
  const data: any = params.value;
  return data != undefined && data != null ? escapeHtml(data) : 'N/A';
}

function dateValueFormatter(params: any){
    const data: any = params.value;
    return data != undefined && data != null ? escapeHtml(moment(data).format(DataGridComponent.defaultDateTimeFormat_local)) : 'N/A';
}

function statusValueFormatter(params: any){
  const data: any = params.value;
  if(data != undefined && data != null) return (data == true) ? 'Success' : 'Failed';
  else 'N/A';
}

function escapeHtml(source: any) {
  if (typeof(source) == 'string') {
    source = source
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
  }
  return source;
}

function UserNameCellRenderer () {}
UserNameCellRenderer.prototype.init = function(params: any) {
    this.eGui = document.createElement('div');
    const data: any = params.value;
    this.eGui.innerHTML = data != undefined && data != null 
                          ? '<a href="javascript:void(0)" data-toggle="popover" data-content="">' + escapeHtml(params.value)+ '</a>'
                          : 'N/A';
};
UserNameCellRenderer.prototype.getGui = function() {
    return this.eGui;
};
