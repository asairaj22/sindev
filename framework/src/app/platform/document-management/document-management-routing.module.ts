import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouterGaurdService as RouterGaurd } from '@platform/auth0/router-gaurd.service';

import { DocumentAdminComponent } from '@platform/document-management/document-admin/document-admin.component';
import { DocumentLandingComponent } from '@platform/document-management/document-landing/document-landing.component';
import { DeletedItemsComponent } from '@platform/document-management/deleted-items/deleted-items.component';
import { DocumentLanding2Component } from '@platform/document-management/document-landing2/document-landing2.component';



const routes: Routes = [
    { path: 'documentAdmin', component: DocumentAdminComponent, canActivate: [RouterGaurd] },
    { path: 'documentLanding', component: DocumentLandingComponent, canActivate: [RouterGaurd] },
    { path: 'documentDeletedItems', component: DeletedItemsComponent, canActivate: [RouterGaurd] },
    { path: 'documentLanding2', component: DocumentLanding2Component, canActivate: [RouterGaurd] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentManagementRoutingModule { }
