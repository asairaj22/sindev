import { NgModule } from "@angular/core";
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
import { ManageUsersRouter } from "./manage-users.router";
import { MatIconModule } from "@angular/material";
import { CreateUsersComponent } from "./create-users/create-users.component";
import { ManageUsersComponent } from "./manage-users-landing/manage-users.component";
import { DefaultUsersComponent } from "./default-users/default-users.component";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatPasswordStrengthModule } from "@angular-material-extensions/password-strength";
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { FilterPipe } from './filter.pipe';
import { SharedDirectivesModule } from 'src/app/main/modules/shared-module.module';

@NgModule({
  declarations: [
    ManageUsersComponent,
    CreateUsersComponent,
    DefaultUsersComponent,
    FilterPipe
  ],
  imports: [
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
    ManageUsersRouter,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatPasswordStrengthModule,
    SharedDirectivesModule,
    NgxIntlTelInputModule,
    BsDropdownModule,
    

  ],
  exports: [MatIconModule],
  entryComponents: [],
})
export class ManageUsersModule {}
