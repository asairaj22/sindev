import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import moment from 'moment';
import { NotificationActionsComponent } from './../actions/notification-actions.component';

@Component({
  selector: 'app-data-grid-notification',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css']
})
export class DataGridComponent implements OnInit {
  @Input() gridData: object[];
  @Input() private defaultDateTimeFormat: string;
  @Input() columnDefs: object[];
  @Input() context: object;
  @Input() defaultColDef: object;
  @Input() rowSelection: any;
  
  @Output() getRowData = new EventEmitter<any>();
  @Output() selectionChanged = new EventEmitter<any>();

  private gridApi: any;
  pageSize: any = 10;
  searchText: string = '';
  frameworkComponents: object;

  static defaultDateTimeFormat_local: any;

  constructor() { }

  initGridDetails(){
    DataGridComponent.defaultDateTimeFormat_local = this.defaultDateTimeFormat;
    this.frameworkComponents = {
      notificationActionComponent: NotificationActionsComponent
    }
    this.context = { componentParent: this };
    this.setColDefFormatters();
  }

  setColDefFormatters(){
    this.columnDefs.forEach((colDef: any) => {
      if(!colDef.valueFormatter) {
        const headerName: string = colDef.headerName;
        switch (headerName) {
          case 'Action':
            colDef.cellRenderer = 'notificationActionComponent';
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

  onSelectionChanged() {
    var selectedRows = this.gridApi.getSelectedRows();
    this.selectionChanged.emit(selectedRows);
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.searchText);
  }

  passCurrentRowData(rowData: any){
    this.getRowData.emit(rowData);
  }

  onRowClick(event) {
    let selectedRows;
    if (this.rowSelection === 'multiple') {
      selectedRows = this.gridApi.getSelectedRows();
    } else {
      selectedRows = this.gridApi.getSelectedRows()[0];
    }
    this.selectionChanged.emit(selectedRows);
}

}

function textValueFormatter(params: any){
  const data: any = params.value;
  return data != undefined && data != null ? escapeHtml(data) : 'N/A';
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