import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { MaterialModule } from '../../../material.module';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AppdashboardComponent } from "./appdashboard.component";
import { BillingDetailsComponent } from "./billing-details/billing-details.component";
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TableModule } from "primeng/table";
import { CalendarModule } from "primeng/calendar";
import { SliderModule } from "primeng/slider";
import { DialogModule } from "primeng/dialog";
import { MultiSelectModule } from "primeng/multiselect";
import { ContextMenuModule } from "primeng/contextmenu";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { InputTextModule } from "primeng/inputtext";
import { ProgressBarModule } from "primeng/progressbar";
import { DropdownModule } from "primeng/dropdown";

const cloudReportRoutes: Routes = [
  {
    path: '',
    component: AppdashboardComponent,
  },
  {
    path: "billing-details",
    component: BillingDetailsComponent,
  }
];

@NgModule({
  imports: [
    MaterialModule,
    ChartsModule,
    DateRangePickerModule,
    CommonModule,
    TableModule,
    CalendarModule,
    SliderModule,
    DialogModule,
    MultiSelectModule,
    ContextMenuModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    ProgressBarModule,
    DropdownModule,
    RouterModule.forChild(cloudReportRoutes)
  ],
  declarations: [AppdashboardComponent,BillingDetailsComponent]
})


export class AppdashboardModule { }