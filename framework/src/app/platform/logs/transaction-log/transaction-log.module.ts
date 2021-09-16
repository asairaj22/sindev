import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AgGridModule } from 'ag-grid-angular';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ClipboardModule } from 'ngx-clipboard';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';

import { DataGridComponent } from './data-grid/data-grid.component';
import { TransactionLogReportComponent } from './transaction-log-report/transaction-log-report.component';
import { TransactionLogTableComponent } from './transaction-log-table/transaction-log-table.component';
import { TransactionLogDetailsComponent } from './transaction-log-details/transaction-log-details.component';
import { TransactionLogActionsComponent } from './actions/transaction-log-actions.component';

@NgModule({
  declarations: [DataGridComponent, TransactionLogReportComponent, TransactionLogTableComponent, TransactionLogDetailsComponent, TransactionLogActionsComponent],
  imports: [
    FormsModule,
    CommonModule,
    NgSelectModule,
    AgGridModule.withComponents([]),
    NgxJsonViewerModule,
    ClipboardModule,
    AngularDateTimePickerModule
  ],
  entryComponents: [TransactionLogActionsComponent, DataGridComponent],
  exports:[
    DataGridComponent
  ]
})
export class TransactionLogModule { }
