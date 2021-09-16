import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AgGridModule } from 'ag-grid-angular';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ClipboardModule } from 'ngx-clipboard';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';

import { DataGridComponent } from './data-grid/data-grid.component'; 
import { SchedulerDashboardComponent } from './scheduler-dashboard/scheduler-dashboard.component';
import { CreateSchedulerComponent } from './create-scheduler/create-scheduler.component';
//import { EnabledRenderComponent } from './GridColumnDefinitions/enabled-render/enabled-render.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    DataGridComponent,
    SchedulerDashboardComponent,
    CreateSchedulerComponent,
    //EnabledRenderComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    NgMultiSelectDropDownModule.forRoot(),
    AgGridModule.withComponents([]),
    NgxJsonViewerModule,
    ClipboardModule,
    AngularDateTimePickerModule,
    NgbModule
  ],
  exports:[
    DataGridComponent
  ],
  entryComponents: [DataGridComponent, SchedulerDashboardComponent, CreateSchedulerComponent]
})
export class SchedulerModule { }
