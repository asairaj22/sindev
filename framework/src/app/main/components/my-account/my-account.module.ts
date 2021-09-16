import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyAccountComponent } from './my-account.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { ToastrModule } from 'ngx-toastr';
import { FilterPipe } from './filter.pipe';
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
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import { RouterModule, Routes } from '@angular/router';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { ExcelService } from './export-to-excel.service';
import { MatIconModule } from "@angular/material";
import { SharedDirectivesModule } from 'src/app/main/modules/shared-module.module';

const myAccountRoutes: Routes = [{ path: '', component: MyAccountComponent }];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    DateRangePickerModule,
    DropdownModule,
    TableModule,
    MatIconModule,
    ToastrModule.forRoot({ closeButton: true }),
    MatPasswordStrengthModule.forRoot(),
    RouterModule.forChild(myAccountRoutes),
    SharedDirectivesModule
  ],
  providers: [
    ExcelService
  ],
  declarations: [MyAccountComponent, FilterPipe]
})
export class MyAccountModule { }