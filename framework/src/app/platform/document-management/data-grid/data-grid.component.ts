import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ManageTagsActionComponent } from '../actions/manage-tags-action.component';
import { DocumentAdminActionComponent } from '../actions/document-admin-action.component';
import { DocumentLandingActionComponent } from '../actions/document-landing-action.component';
import { DocumentLandingNamesActionComponent } from '../actions/document-landing-names-action.component';
import moment from 'moment';

@Component({
  selector: 'app-data-grid-dms',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css']
})
export class DataGridComponent implements OnInit {
  @Input() gridData: object[];
  @Input() private defaultDateTimeFormat: string;
  @Input() columnDefs: object[];
  @Input() context: object;
  @Input() actionComponent: string;
  @Input() private docLandingGridSearchVal: string;
  @Input() docLandingGridSearchScope: string;
  @Input() pageSize : number;
  @Input() isCustomPagination: boolean;
  @Output() deleteTags = new EventEmitter<any>();
  @Output() deleteAction = new EventEmitter<any>();
  @Output() editAction = new EventEmitter<any>();
  @Output() invokeDocumentLandingAction = new EventEmitter<any>();
  @Output() docLandingGridSearch = new EventEmitter<any>();
  @Output() changePageSize = new EventEmitter<any>();

  gridApi: any;
  searchText: string = '';
  frameworkComponents: object;
  popupParent: any;

  static defaultDateTimeFormat_local: any;

  constructor() { 
    this.popupParent = document.querySelector("body");
  }

  initGridDetails(){
    DataGridComponent.defaultDateTimeFormat_local = this.defaultDateTimeFormat;
    this.frameworkComponents = {
      manageTagsActionComponent: ManageTagsActionComponent,
      documentAdminActionComponent: DocumentAdminActionComponent,
      documentLandingActionComponent: DocumentLandingActionComponent,
      documentLandingNamesActionComponent: DocumentLandingNamesActionComponent
    }
    this.context = { componentParent: this };
    this.pageSize = this.pageSize || 10;
    this.setColDefFormatters();
  }

  setColDefFormatters(){
    this.columnDefs.forEach((colDef: any) => {
      if(!colDef.valueFormatter) {
        const headerName: string = colDef.headerName;
        switch (headerName) {
          case 'Name':
            if(this.actionComponent == 'document-landing-actions'){
              colDef.cellRenderer = 'documentLandingNamesActionComponent';
            }else{
              colDef.cellRenderer = TextValueCellRenderer;
            }
            break;
          case 'Last Updated':
            colDef.valueFormatter = dateValueFormatter;
            break;
          case 'Method':
            colDef.valueFormatter = 'value.toUpperCase()';
            break;
          case 'Status':
            colDef.cellRenderer = StatusValueCellRenderer;
            break;
          case'Allowed':
            colDef.valueFormatter = allowedValueFormatter;
            break;
          case 'Tag':
            colDef.cellRenderer = TagNamesCellRenderer;
            break;
          case 'Action':
          case 'Message':
            if(this.actionComponent == 'manage-tags-action'){
              colDef.cellRenderer = 'manageTagsActionComponent';
            }else if(this.actionComponent == 'document-actions'){
              colDef.cellRenderer = 'documentAdminActionComponent';
            }else if(this.actionComponent == 'document-landing-actions'){
              colDef.cellRenderer = 'documentLandingActionComponent';
            }
            break;
          default:
            colDef.cellRenderer = TextValueCellRenderer;
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
    if(this.isCustomPagination){
      this.changePageSize.emit(Number(this.pageSize));
    }else{
      this.gridApi.paginationSetPageSize(Number(this.pageSize));
    }
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.searchText);
  }

  invokeAction(params: any){
    switch (params.type) {
      case 'delete-tags':
          this.deleteTags.emit(params.rowData);
        break;
      case 'delete':
          this.deleteAction.emit(params.rowData);
        break;
      case'edit':
          this.editAction.emit(params.rowData);
        break;
      case 'select-folder':
      case 'download-file':
      case 'approve':
      case 'checkin':
      case 'checkout':
      case 'cancel-checkout':
      case 'reject':
      case 'remove':
      case 'restore':
      case 'edit-properties':
      case 'view-history':
          this.invokeDocumentLandingAction.emit({rowData: params.rowData, type: params.type});
          break;
      default:
        break;
    }
  }

  invokeDocLandingGridSearch(){
    this.docLandingGridSearch.emit({searchedDataDT: this.docLandingGridSearchVal, searchedDataScope: this.docLandingGridSearchScope});
  }
}

function dateValueFormatter(params: any){
  try {
    if(typeof params.value == 'string') params.value = parseInt(params.value);
  } catch (error) { }
  const data: any = params.value;
  return data != undefined && data != null ? escapeHtml(moment(data).format(DataGridComponent.defaultDateTimeFormat_local)) : 'N/A';
}

function allowedValueFormatter(params: any){
  const data: any = params.value;
  if(data != undefined && data != null) return (data == true) ? 'YES' : 'NO';
  else 'N/A';
}

function textValueFormatter(params: any){
  const data: any = params.value;
  return data != undefined && data != null ? escapeHtml(data) : 'N/A';
}

function StatusValueCellRenderer () {}
StatusValueCellRenderer.prototype.init = function(params: any) {
    this.eGui = document.createElement('label');
    const textValue = textValueFormatter(params);
    this.eGui.innerHTML = textValue;
    this.eGui.setAttribute('class', 'label label-primary');
};
StatusValueCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

function TextValueCellRenderer () {}
TextValueCellRenderer.prototype.init = function(params: any) {
    this.eGui = document.createElement('span');
    const textValue = textValueFormatter(params);
    this.eGui.innerHTML = textValue;
    this.eGui.setAttribute('title', textValue);
};
TextValueCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

function tagValueFormatter(params: any){
  const data: any = params.value;
  if(data != undefined && data != null){
    var _tags = "";
    if(data[0].startsWith("[")){
      try{
        var parsedArr = JSON.parse(data[0]);
        _tags = parsedArr.join();
      }catch(e){}
    }else{
      _tags = data[0];
    }
    return _tags == "" ? 'N/A' : _tags;
  }else{
    return 'N/A';
  }
}

function TagNamesCellRenderer () {}
TagNamesCellRenderer.prototype.init = function(params: any) {
    this.eGui = document.createElement('span');
    const tagValue = tagValueFormatter(params);
    this.eGui.innerHTML = tagValue;
    this.eGui.setAttribute('title', tagValue);
};
TagNamesCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

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

