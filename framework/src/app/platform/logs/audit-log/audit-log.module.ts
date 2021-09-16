/*! Plugin - Audit Log v1.0.0 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AgGridModule } from 'ag-grid-angular';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ClipboardModule } from 'ngx-clipboard';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';

import { AuditLogCheckboxComponent } from './actions/audit-log-checkbox.component';
import { AuditLogActionsComponent } from './actions/audit-log-actions.component';
import { DataGridComponent } from './data-grid/data-grid.component';
import { AuditLogReportComponent } from './audit-log-report/audit-log-report.component';
import { AuditLogTableComponent } from './audit-log-table/audit-log-table.component';
import { AuditLogDetailsComponent } from './audit-log-details/audit-log-details.component';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';


const monacoConfig: NgxMonacoEditorConfig = {
  baseUrl: './assets', // configure base path for monaco editor
  defaultOptions: { scrollBeyondLastLine: false }, // pass default options to be used
  onMonacoLoad: onMonacoLoadFn
  // here monaco object will be available as window.monaco use this function to extend monaco editor functionality.
  };

@NgModule({
  declarations: [AuditLogCheckboxComponent, AuditLogActionsComponent, DataGridComponent, AuditLogReportComponent, AuditLogTableComponent, AuditLogDetailsComponent],
  imports: [
    FormsModule,
    CommonModule,
    NgSelectModule,
    AgGridModule.withComponents([]),
    NgxJsonViewerModule,
    ClipboardModule,
    AngularDateTimePickerModule,
    MonacoEditorModule.forRoot(monacoConfig)
  ],
  entryComponents: [AuditLogCheckboxComponent, AuditLogActionsComponent, DataGridComponent],
  exports:[
    DataGridComponent
  ]
})
export class AuditLogModule { }

export function onMonacoLoadFn() { console.log((<any>window).monaco); }
