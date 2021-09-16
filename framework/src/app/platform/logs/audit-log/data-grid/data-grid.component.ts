import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuditLogActionsComponent } from './../actions/audit-log-actions.component';
import { AuditLogCheckboxComponent } from './../actions/audit-log-checkbox.component';

@Component({
  selector: 'app-data-grid-audit-log',
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
  private rowArr:any = [];

  constructor() { }

  initGridDetails(){
    this.frameworkComponents = {
      auditLogCheckboxComponent: AuditLogCheckboxComponent,
      auditLogsActionComponent: AuditLogActionsComponent
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
            colDef.cellRenderer = 'auditLogsActionComponent';
            break;
          case '':
              colDef.cellRenderer = 'auditLogCheckboxComponent';
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

  passCurrentRowCheckboxData(rowData: any){
    if(typeof(rowData) == 'number'){
      this.rowArr = this.rowArr.filter(function( obj ) {
        return obj.id != rowData;
      });
    }else{
      this.rowArr.push(rowData);
    }
    this.getRowDataCheckbox.emit(this.rowArr);
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
