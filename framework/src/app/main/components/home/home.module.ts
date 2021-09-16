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
import { MatIconModule } from "@angular/material";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatPasswordStrengthModule } from "@angular-material-extensions/password-strength";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { HomeComponent } from "./home.component";
import { FeaturedArticlesComponent } from "./featured-articles/featured-articles.component";
import { MatCardModule } from "@angular/material/card";
import { HomeRouter } from "./home.router";
import { MatCarouselModule } from "@ngmodule/material-carousel";
import { SwiperModule, SwiperConfigInterface, SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { SlidingBannerModule } from '../../apps/sliding-banner/sliding-banner.module';


const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  observer: true,
  direction: 'horizontal',
  threshold: 50,
  spaceBetween: 5,
  slidesPerView: 'auto',
  centeredSlides: true
};


@NgModule({
  declarations: [HomeComponent, FeaturedArticlesComponent],
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
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatPasswordStrengthModule,
    NgxIntlTelInputModule,
    BsDropdownModule,
    MatCardModule,
    BsDropdownModule.forRoot(),
    HomeRouter,
    MatCarouselModule.forRoot(),
    SwiperModule,
    SlidingBannerModule
  ],
  exports: [MatIconModule],
  entryComponents: [],
  providers: [
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    }   
  ],
})
export class HomeModule {}
