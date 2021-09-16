import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { AppService } from "src/app/app.service";
import { MatIconModule } from "@angular/material";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { MatPasswordStrengthModule } from "@angular-material-extensions/password-strength";
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { OfferCustomizeRouter } from './offer-customize.router';
import { OfferCustomizeComponent } from "./offer-customize.component";
import { SubcriptionTypeComponent } from "./subcription-type/subcription-type.component";
import {MatStepperModule} from '@angular/material/stepper';
// import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { BeforeLoginComponent } from './before-login/before-login.component';
// import { BsDatepickerModule } from 'ngx-bootstrap';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FilterByPipe } from './filterby.pipe';
import { SharedDirectivesModule } from 'src/app/main/modules/shared-module.module';



@NgModule({
  imports: [
    CommonModule,
    TableModule,
    CalendarModule,
    SliderModule,
    DialogModule,
    MultiSelectModule,
    ContextMenuModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    ProgressBarModule,
    OfferCustomizeRouter,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatPasswordStrengthModule,
    BsDatepickerModule.forRoot(),
    DatepickerModule.forRoot(), 
    NgxIntlTelInputModule,
    BsDropdownModule,
     MatStepperModule,
    // MatIconModule,
    PdfViewerModule,
    MatInputModule,
    SharedDirectivesModule
  ],
  exports: [MatIconModule,SubcriptionTypeComponent],
  declarations: [    
    OfferCustomizeComponent,
    SubcriptionTypeComponent,
    FilterByPipe,
    BeforeLoginComponent
  ]
})
export class OfferCustomizeModule { }