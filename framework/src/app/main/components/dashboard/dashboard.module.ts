import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { FirstLoginWizardPopupComponent } from './first-login-wizard-popup/first-login-wizard-popup.component';
import { CloudResellAppsComponent, CloudExternalDialog } from './cloud-resell-apps/cloud-resell-apps.component';
import { CloudReportsComponent } from './cloud-resell-apps/cloud-reports/cloud-reports.component';
import { BillingDetailsComponent } from './cloud-resell-apps/billing-details/billing-details.component';
import { CostOptimizationComponent } from './cloud-resell-apps/cost-optimization/cost-optimization.component';
import { ManageAppsDetailComponent } from './manage-apps-detail/manage-apps-detail.component';
import { MaterialModule } from '../../../material.module';
import { MatCardModule } from "@angular/material/card";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { SwiperModule } from "ngx-swiper-wrapper";
import { SWIPER_CONFIG } from "ngx-swiper-wrapper";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";
import {MatDialogModule} from '@angular/material/dialog';
import { ChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from "@angular/forms";

import { TableModule } from "primeng/table";
import { CalendarModule } from "primeng/calendar";
import { SliderModule } from "primeng/slider";
import { DialogModule } from "primeng/dialog";
import { MultiSelectModule } from "primeng/multiselect";
import { ContextMenuModule } from "primeng/contextmenu";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { ToastrModule } from 'ngx-toastr';
import { InputTextModule } from "primeng/inputtext";
import { ProgressBarModule } from "primeng/progressbar";
import { DropdownModule } from "primeng/dropdown";
// import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
// import {MatDatepickerModule} from '@angular/material/datepicker';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// import { DashboardRouter } from './dashboard.router';
const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
direction: "horizontal",
slidesPerView: "auto",
};
const dashboardRoutes: Routes = [
{
  path: '',
  component: DashboardComponent,
},
{ path: "cloud-resell-apps", component: CloudResellAppsComponent },
{ path: "cloud-reports", component: CloudReportsComponent },
{ path: "cost-optimization", component: CostOptimizationComponent },
{ path: "billing-details", component: BillingDetailsComponent },
{path: "manage-apps-detail", component: ManageAppsDetailComponent}
];


@NgModule({
imports: [
  CommonModule,
  MaterialModule,
  MatProgressBarModule,
  MatCardModule,
  MatPasswordStrengthModule,
  SwiperModule,
  ChartsModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule.forChild(dashboardRoutes),
  MatDialogModule,
  TableModule,
  CalendarModule,
  SliderModule,
  DialogModule,
  MultiSelectModule,
  DateRangePickerModule,
  ToastrModule.forRoot({ closeButton: true }),
  ContextMenuModule ,
  ButtonModule ,
  ToastModule ,
  InputTextModule, 
  ProgressBarModule,
  NgbModule,
  DropdownModule 

  
],
declarations: [DashboardComponent,FirstLoginWizardPopupComponent,CloudResellAppsComponent,CloudExternalDialog,CloudReportsComponent,BillingDetailsComponent, CostOptimizationComponent,ManageAppsDetailComponent],
entryComponents: [CloudResellAppsComponent, CloudExternalDialog],
providers: [
  
  {
    provide: SWIPER_CONFIG,
    useValue: DEFAULT_SWIPER_CONFIG,
  }
]
})
export class DashboardModule { }