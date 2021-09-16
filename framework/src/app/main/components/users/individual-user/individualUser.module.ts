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
import { IndividualRoutingModule } from './individual-user-routing.module';
import { DropdownModule } from "primeng/dropdown";
import { AppService } from "src/app/app.service";
import { MatIconModule, MatTooltipModule } from "@angular/material";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatPasswordStrengthModule } from "@angular-material-extensions/password-strength";
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { IndividualUserComponent } from './individual-user.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FilterPipe } from './filter.pipe';
import { SharedDirectivesModule } from 'src/app/main/modules/shared-module.module';

@NgModule({
  declarations: [IndividualUserComponent,FilterPipe],
  imports: [
    TableModule,
    CalendarModule,
    SliderModule,
    DialogModule,
    MultiSelectModule,
    ContextMenuModule,
    DropdownModule,
    ButtonModule,
    IndividualRoutingModule,
    ToastModule,
    InputTextModule,
    ProgressBarModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatPasswordStrengthModule,
    NgxIntlTelInputModule,
    BsDropdownModule,
    SharedDirectivesModule,
    MatTooltipModule
  ],
  exports: [MatIconModule],
  entryComponents: [],
})

export class IndividualUserModule { }

