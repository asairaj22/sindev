import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationAdminComponent } from './notification-admin/notification-admin.component';
import { DomainsComponent } from './domains/domains.component';
import { SubDomainsComponent } from './sub-domains/sub-domains.component';
import { EventsComponent } from './events/events.component';
import { ManageTemplatesComponent } from './manage-templates/manage-templates.component';
import { MapTemplatesComponent } from './map-templates/map-templates.component';
import { ManageSubscriptionComponent } from './manage-subscription/manage-subscription.component';
import { NotificationLogComponent } from './notification-log/notification-log.component';

const routes: Routes = [
    { path: '', component: NotificationAdminComponent, children:[
        { path: 'domains', component: DomainsComponent },
        { path: 'sub-domains', component: SubDomainsComponent },
	    { path: 'notification-events', component: EventsComponent },
	    { path: 'manage-template', component: ManageTemplatesComponent },
	    { path: 'map-template', component: MapTemplatesComponent },
	    { path: 'manage-subscription', component: ManageSubscriptionComponent },
	    { path: 'notification-log', component: NotificationLogComponent }
    ] }
];




@NgModule({
    declarations:[
        
    ],
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class NotificationsRouter { }