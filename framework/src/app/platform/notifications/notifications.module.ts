import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageTemplatesComponent } from './manage-templates/manage-templates.component';
import { DomainsComponent } from './domains/domains.component';
import { EventsComponent } from './events/events.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AgGridModule } from 'ag-grid-angular';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ClipboardModule } from 'ngx-clipboard';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DataGridComponent } from './data-grid/data-grid.component';
import { SubDomainsComponent } from './sub-domains/sub-domains.component';
import { MatTabsModule, MatTableModule } from '@angular/material';
import { ManageSubscriptionComponent } from './manage-subscription/manage-subscription.component';
import { MapTemplatesComponent } from './map-templates/map-templates.component';
import { NotificationLogComponent } from './notification-log/notification-log.component';
//import { NotificationAtionComponent } from '../logs/actions/notification-action.component';
//import { EditArchiveAtionComponent } from '../logs/actions/edit-archive-actions.component';
import { NotificationAdminComponent } from './notification-admin/notification-admin.component';
import { LeftMenuComponent } from './left-menu/left-menu.component';
import { NgMaterialMultilevelMenuModule } from 'ng-material-multilevel-menu';
import { NotificationsRouter } from './notifications.router';
import { ManageNotificationComponent } from './manage-notification/manage-notification.component';
import { NotificationActiveCheckboxComponent } from './manage-notification/notification-active-checkbox/notification-active-checkbox.component';
import { NotificationHistoryActionComponent } from './notification-log/notification-history-action/notification-history-action.component';
import { NotificationActionsComponent } from './actions/notification-actions.component';

@NgModule({
  declarations: [    
    DataGridComponent,
    EventsComponent,
    DomainsComponent,
    SubDomainsComponent,
    ManageTemplatesComponent,
    ManageNotificationComponent,
    ManageSubscriptionComponent,
    MapTemplatesComponent,
    NotificationLogComponent,
    NotificationAdminComponent,
    LeftMenuComponent,
    NotificationActiveCheckboxComponent,
    NotificationHistoryActionComponent,
    NotificationActionsComponent
    ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatTabsModule,
    MatTableModule,
    NgMultiSelectDropDownModule.forRoot(),
    AgGridModule.withComponents([]),
    NgxJsonViewerModule,
    ClipboardModule,
    AngularDateTimePickerModule,
    NgbModule,
    NgSelectModule,
    DragDropModule,
    NgMaterialMultilevelMenuModule,
    NotificationsRouter,
    AgGridModule.withComponents([NotificationActiveCheckboxComponent, NotificationHistoryActionComponent])
  ],
  exports: [
    DataGridComponent
  ],
    entryComponents: [NotificationActionsComponent, DataGridComponent]
})
export class NotificationsModule { }
