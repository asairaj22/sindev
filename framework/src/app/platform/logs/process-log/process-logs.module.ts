import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';
import { ProcessDataGridComponent } from './process-data-grid/process-data-grid.component';
import { ProcessSearchDetailsComponent } from './process-search-details/process-search-details.component';
import { ProcessLogDetailsComponent } from './process-search-details/process-log-details/process-log-details.component';
import { ProcessSearchTableComponent } from './process-search-details/process-search-table/process-search-table.component';
import { AgGridModule } from 'ag-grid-angular';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
//import { AngularMyDatePickerModule } from 'angular-mydatepicker';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ProcessLogActionsComponent } from './actions/process-log-actions.component';
import { ProcessStepDetailsComponent } from './process-search-details/process-step-details/process-step-details.component';
import { ModalModule,BsModalRef,BsModalService } from 'ngx-bootstrap/modal';
import { ModalContentComponent } from './process-search-details/modal-content-component/modal-content-component.component';
import { ProcessFlowDetailsComponent } from './process-search-details/process-flow-details/process-flow-details.component';
import { ProcessFlowMonitorComponent } from './process-search-details/process-flow-monitor/process-flow-monitor.component';


@NgModule({
  declarations: [ProcessSearchDetailsComponent, ProcessLogDetailsComponent, ProcessSearchTableComponent,ProcessDataGridComponent,ProcessLogActionsComponent, ProcessStepDetailsComponent, ModalContentComponent, ProcessFlowDetailsComponent, ProcessFlowMonitorComponent],
  imports: [
    CommonModule,
    AngularDateTimePickerModule,
  //  AngularMyDatePickerModule,
    NgxJsonViewerModule,
    ModalModule.forRoot(),
    AgGridModule.withComponents([]),
   OwlDateTimeModule,
   OwlNativeDateTimeModule,
  ],
  providers: [
    BsModalRef,
    BsModalService
],
  entryComponents: [ProcessDataGridComponent,ProcessLogActionsComponent,ModalContentComponent]
})
export class ProcessLogsModule { }
