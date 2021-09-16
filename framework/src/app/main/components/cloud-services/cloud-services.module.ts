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
import { MatIconModule } from "@angular/material";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatPasswordStrengthModule } from "@angular-material-extensions/password-strength";
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CloudServicesRouter } from './cloud-services.router';
import { CloudServicesComponent } from './cloud-services.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
// import { DeployProdComponent } from './deploy-prod/deploy-prod.component';

import { SwiperModule } from "ngx-swiper-wrapper";
import { SWIPER_CONFIG } from "ngx-swiper-wrapper";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: "horizontal",
  slidesPerView: "auto",
};
@NgModule({
  declarations: [
    CloudServicesComponent,
    ProductDetailsComponent,
    // DeployProdComponent
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
    CloudServicesRouter,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatPasswordStrengthModule,
    NgxIntlTelInputModule,
    SwiperModule,
    BsDropdownModule

  ],
  exports: [MatIconModule],
  entryComponents: [],
  providers: [
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG,
    },
  ],
})
export class CloudServicesModule {}
