import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MyCompanyComponent } from './my-company.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { BsDatepickerModule } from 'ngx-bootstrap';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { MaterialModule } from '../../../material.module';
import { ExcelService } from 'src/app/main/components/my-account/export-to-excel.service';
import { SharedDirectivesModule } from 'src/app/main/modules/shared-module.module';


// import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';


const myCompanyRoutes: Routes = [
  {
    path: '',
    component: MyCompanyComponent,
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CalendarModule,
    SliderModule,
    DialogModule,
    MultiSelectModule,
    ContextMenuModule,
    ButtonModule,
    ProgressBarModule,
    MaterialModule,
    DropdownModule,
    ToastModule,
    InputTextModule,
    NgxDaterangepickerMd,
    DateRangePickerModule,
    SharedDirectivesModule,
    // NgxDaterangepickerMd.forRoot(),
    BsDatepickerModule.forRoot(),
    RouterModule.forChild(myCompanyRoutes)
    
  ],
  providers: [
    ExcelService
  ],
  declarations: [MyCompanyComponent]
})
export class MyCompanyModule { }