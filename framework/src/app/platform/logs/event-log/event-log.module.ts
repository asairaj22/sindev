import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AgGridModule } from 'ag-grid-angular';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ClipboardModule } from 'ngx-clipboard';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';

import { EventLogReportComponent } from './event-log-report/event-log-report.component';
import { EventLogTableComponent } from './event-log-table/event-log-table.component';
import { EventLogDetailsComponent } from './event-log-details/event-log-details.component';
import { EventLogActionsComponent } from './actions/event-log-actions.component';
import { DataGridComponent } from './data-grid/data-grid.component';

@NgModule({
  declarations: [EventLogReportComponent, EventLogTableComponent, EventLogDetailsComponent, EventLogActionsComponent, DataGridComponent],
  imports: [
    FormsModule,
    CommonModule,
    NgSelectModule,
    AgGridModule.withComponents([]),
    NgxJsonViewerModule,
    ClipboardModule,
    AngularDateTimePickerModule
  ],
  entryComponents: [EventLogActionsComponent, DataGridComponent],
  exports:[
    DataGridComponent
  ]
})
export class EventLogModule { }
