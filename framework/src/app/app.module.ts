import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
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
import {
  MatButtonModule, MatCheckboxModule,
  MatDialogModule, MatFormFieldModule, MatIconModule,
  MatInputModule, MatProgressSpinnerModule, MatSelectModule,MatOptionModule,
  MatSnackBarModule, MatSortModule, MatTableModule
} from '@angular/material';

/* Widget External plug-in Import Starts */
/* Widget External plug-in Import Ends */

import { AppRoutingModule } from './app-routing.module';
import { EventLogModule } from './platform/logs/event-log/event-log.module';
import { TransactionLogModule } from './platform/logs/transaction-log/transaction-log.module';
import { AuditLogModule } from './platform/logs/audit-log/audit-log.module';
import { ReportsModule } from './platform/reports/reports.module';
import { DashboardModule } from './platform/dashboard/dashboard.module';
import { AppComponent } from './app.component';
import { EportalSessionComponent } from './platform/ep-session/eportal-session.component';
import { CustomRouterHandlerComponent } from './platform/custom-router-handler/custom-router-handler.component';
import { PageNotFoundComponent } from './platform/page-not-found/page-not-found.component';
import { HeaderComponent } from './header/header.component';
import { UnauthorizedComponent } from './platform/unauthorized/unauthorized.component';
import { ProcessLogsModule } from './platform/logs/process-log/process-logs.module';
import { ModalModule, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SchedulerModule } from './platform/scheduler/scheduler.module';
import { ReactiveFormsModule } from '@angular/forms';

import { NotificationsModule } from './platform/notifications/notifications.module';
import { FooterComponent } from './main/components/footer/footer.component';
import { HeaderMenuComponent } from './main/components/header-menu/header-menu.component';
// import { MyCompanyComponent } from './main/components/my-company/my-company.component';
import { HomeComponent } from './main/components/home/home.component';
import { MaterialModule } from './material.module';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { HelpCenterComponent } from './main/components/help-center/help-center.component';
import { ResourcesComponent } from './main/components/resources/resources.component';
import { Interceptor } from "./interceptor/interceptor";
// import { FilterByPipe } from './shared/pipe/filterby.pipe';
import { PreviousRouteService } from './shared/service/previous-router.service';
import { WorkflowComponent } from './main/components/workflow/workflow.component';
import { VerifyOtpComponent } from './main/components/verify-otp/verify-otp.component';
import { SharedDirectivesModule } from './main/modules/shared-module.module';
// home imports starts


import { SwiperModule } from "ngx-swiper-wrapper";
import { SWIPER_CONFIG } from "ngx-swiper-wrapper";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";
import { MatCardModule } from "@angular/material/card";
// import { DashboardComponent } from './main/components/dashboard/dashboard.component';
// import { CloudResellAppsComponent } from './main/components/dashboard/cloud-resell-apps/cloud-resell-apps.component';
// import { DashboardRouter } from './dashboard.router';



import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// import {MatIconModule} from '@angular/material';


import { SubHeaderMenuComponent } from './main/components/sub-header-menu/sub-header-menu.component';
import { AppService } from './app.service';
import { GlobalDataService } from './main/services/global.service';

// import { NgxCaptchaModule } from 'ngx-captcha';
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import {RecaptchaLoaderService } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';
import { CommonModule } from '@angular/common';
import { AboutUsComponent } from './main/components/about-us/about-us.component';
import { ContactUsComponent } from './main/components/contact-us/contact-us.component'
import { TermsandconditionComponent } from './main/components/termsandcondition/termsandcondition.component'
// import {

//   MatInputModule,

// } from '@angular/material';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { IsLoadingModule } from '@service-work/is-loading';
import { PdfViewerModule } from 'ng2-pdf-viewer'; // <- import PdfViewerModule
const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: "horizontal",
  slidesPerView: "auto",
};


// home imports ends
/* Widget Import Starts */
// import { WidgetSpecModule } from 'widget-spec';
// import { WidgetBanerModule } from './widget-baner/widget-baner.module';
/* Widget Import Ends */

@NgModule({
  declarations: [
    AppComponent,
		EportalSessionComponent,
    HeaderComponent,
    /* Widget NgModule Declarations Starts */
    /* Widget NgModule Declarations Ends */

    CustomRouterHandlerComponent,
    PageNotFoundComponent,
    UnauthorizedComponent,
    FooterComponent,
    HeaderMenuComponent,
    WorkflowComponent,
    VerifyOtpComponent,
    // DashboardComponent,
    // CloudResellAppsComponent,
    SubHeaderMenuComponent,
    AboutUsComponent,
    ContactUsComponent,
    TermsandconditionComponent,
    HelpCenterComponent,
    ResourcesComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    BrowserModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    AppRoutingModule,
    ReportsModule,
    DashboardModule,
    EventLogModule,
    SharedDirectivesModule,
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
    TransactionLogModule,
    AuditLogModule,
    ProcessLogsModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    SchedulerModule,
    ReactiveFormsModule,
    NotificationsModule,

    /* Widget NgModule Imports Starts */
    // WidgetSpecModule,
    // WidgetBanerModule,
    /* Widget NgModule Imports Ends */

    HttpClientModule,
    ToastrModule.forRoot({ closeButton: true }),
    BrowserAnimationsModule,
    SwiperModule, MatCardModule, BsDropdownModule.forRoot(),
    MatProgressBarModule,
    MatIconModule,
    MatInputModule,
    MatPasswordStrengthModule.forRoot(),
    IsLoadingModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule, MatSelectModule,MatOptionModule, MatSortModule, MatCheckboxModule, MatInputModule,
    PdfViewerModule

    // home imports ends
  ],
  exports: [MatProgressBarModule, MatIconModule, MatInputModule],
  providers: [
    {
    provide: RECAPTCHA_SETTINGS,
    useValue: {
      siteKey: '6LeVcLsaAAAAAFOU9707e3UUpKvW3p3KOHnwiIZ6',
    } as RecaptchaSettings,
  },
  RecaptchaLoaderService,
    { provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true },
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },

    // home imports starts
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG,
    },
    // home imports ends
    JwtHelperService,

    /* Widget NgModule Providers Starts */
    /* Widget NgModule Providers Ends */

    BsModalRef,
    BsModalService,
    AppService,
    GlobalDataService,
    PreviousRouteService
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}