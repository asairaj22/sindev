import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { CustomRouterHandlerComponent } from "./platform/custom-router-handler/custom-router-handler.component";
import { EventLogReportComponent } from "./platform/logs/event-log/event-log-report/event-log-report.component";
import { AuditLogReportComponent } from "./platform/logs/audit-log/audit-log-report/audit-log-report.component";
import { ProcessSearchDetailsComponent } from "./platform/logs/process-log/process-search-details/process-search-details.component";
import { TransactionLogReportComponent } from "./platform/logs/transaction-log/transaction-log-report/transaction-log-report.component";
import { PageNotFoundComponent } from "./platform/page-not-found/page-not-found.component";
import { RouterGaurdService as RouterGaurd } from "./platform/auth0/router-gaurd.service";
import { UnauthorizedComponent } from "./platform/unauthorized/unauthorized.component";
import { SchedulerDashboardComponent } from "./platform/scheduler/scheduler-dashboard/scheduler-dashboard.component";
import { EpReportLandingComponent } from "./platform/reports/ep-report-landing/ep-report-landing.component";
import { EpDashboardComponent } from "./platform/dashboard/ep-dashboard/ep-dashboard.component";

import { NotificationAdminComponent } from "./platform/notifications/notification-admin/notification-admin.component";
import { ManageNotificationComponent } from "./platform/notifications/manage-notification/manage-notification.component";
import { HomeComponent } from "./main/components/home/home.component";
import { CloudServicesComponent } from './main/components/cloud-services/cloud-services.component';
import { OfferCustomizeComponent } from './main/components/offer-customize/offer-customize.component';
import { AboutUsComponent } from './main/components/about-us/about-us.component';
import { ContactUsComponent } from './main/components/contact-us/contact-us.component';
import { HelpCenterComponent } from './main/components/help-center/help-center.component';
import { ResourcesComponent } from './main/components/resources/resources.component';
import { TermsandconditionComponent } from './main/components/termsandcondition/termsandcondition.component';
import { WorkflowComponent } from "./main/components/workflow/workflow.component";
import { VerifyOtpComponent } from "./main/components/verify-otp/verify-otp.component";

const routes: Routes = [
  { path: "index.html", component: CustomRouterHandlerComponent },
  {
    path: "auditLogs",
    component: AuditLogReportComponent,
    canActivate: [RouterGaurd],
  },
  {
    path: "eventLogs",
    component: EventLogReportComponent,
    canActivate: [RouterGaurd],
  },
  {
    path: "processLog",
    component: ProcessSearchDetailsComponent,
    canActivate: [RouterGaurd],
  },
  {
    path: "transactionLog",
    component: TransactionLogReportComponent,
    canActivate: [RouterGaurd],
  },

  // Components From Header starts
  { path: "", pathMatch: "full", redirectTo: "auth" },
 
  { path: "about-us", component: AboutUsComponent },
  { path: "help-center", component: HelpCenterComponent },
  { path: "resources", component: ResourcesComponent },
  { path: "contact-us", component: ContactUsComponent },
  { path: 'terms', component: TermsandconditionComponent },
   //{ path: "my-company", component: MyCompanyComponent },
  {
    path: "cloud-services/:type",
    loadChildren:
      "./main/components/cloud-services/cloud-services.module#CloudServicesModule",
  },
  {
    path: "all-apps",
    loadChildren:
      "./main/components/all-apps/all-apps.module#AllAppsModule",
  },
  {
    path: "offer-customize/:id",
    loadChildren:
      "./main/components/offer-customize/offer-customize.module#OfferCustomizeModule",
  },
  {
    path: "home",
    loadChildren:
      "./main/components/home/home.module#HomeModule",
  },
  {
    path: "my-company",
    loadChildren:
      "./main/components/my-company/my-company.module#MyCompanyModule",
  },
  
  {
    path: "dashboard",
    loadChildren:
      "./main/components/dashboard/dashboard.module#DashboardModule",
  },
  {
    path: "my-account",
    loadChildren:
      "./main/components/my-account/my-account.module#MyAccountModule",
  },
  {
    path: "manage-users",
    loadChildren:
      "./main/components/users/manage-users/manage-users.module#ManageUsersModule",
  },
  {
    path: "individual-user",
    loadChildren:
      "./main/components/users/individual-user/individualUser.module#IndividualUserModule",
  },
  {
    path: "my-apps",
    loadChildren:
      "./main/components/my-apps/my-apps.module#MyAppsModule",
  },
  {
    path: "auth",
    loadChildren:
      "./main/components/login/login.module#LoginModule",
  },
  
  {
    path: "appdashboard",
    loadChildren:
      "./main/components/appdashboard/appdashboard.module#AppdashboardModule",
  },
  // Components From Header Ends
  { path: "workflow", component: WorkflowComponent },
  { path: "verify-otp", component: VerifyOtpComponent },
  {
    path: "reports/:id",
    component: EpReportLandingComponent,
    canActivate: [RouterGaurd],
  },
  {
    path: "dashboard",
    component: EpDashboardComponent,
    canActivate: [RouterGaurd],
  },
  { path: "unauthorized", component: UnauthorizedComponent },
  { path: "workflow_scheduler", component: SchedulerDashboardComponent },
  { path: "manageNotifications", component: ManageNotificationComponent },
  { path: "notificationAdmin", component: NotificationAdminComponent },
  {
    path: "notificationAdmin",
    loadChildren:
      "./platform/notifications/notifications.module#NotificationsModule",
  },
  {
    path: "dms",
    loadChildren:
      "./platform/document-management/document-management.module#DocumentManagementModule",
  },
  {
        path: "reports",
        loadChildren: "./main/components/reports/reports.module#ReportsModule",
    },
  { path: "**", component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled'
})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
