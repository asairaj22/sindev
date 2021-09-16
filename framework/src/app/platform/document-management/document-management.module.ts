import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { AngularSplitModule } from 'angular-split';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';

//import { JwPaginationComponent } from 'jw-angular-pagination';

import { DocumentManagementRoutingModule } from './document-management-routing.module';
import { DocumentAdminComponent } from './document-admin/document-admin.component';
import { DocumentAdminActionComponent } from './actions/document-admin-action.component';
import { ManageTagsActionComponent } from './actions/manage-tags-action.component';
import { DocumentLandingActionComponent } from './actions/document-landing-action.component';
import { DocumentLandingNamesActionComponent } from './actions/document-landing-names-action.component';
import { DocumentLandingNamesAction2Component } from './actions/document-landing-names-action2.component';
import { ManageTagsComponent } from './manage-tags/manage-tags.component';
import { DataGridComponent } from './../document-management/data-grid/data-grid.component';
import { DocumentWhitelistComponent } from './document-whitelist/document-whitelist.component';
import { DocumentTypesComponent } from './document-types/document-types.component';
import { ExcludeFoldersComponent } from './exclude-folders/exclude-folders.component';
import { DocumentLandingComponent } from './document-landing/document-landing.component';
import { PaginationComponent } from './pagination/pagination.component';
import { DmsConfigurationComponent } from './dms-configuration/dms-configuration.component';
import { DeletedItemsComponent } from './deleted-items/deleted-items.component';
import { CustomSearchComponent } from './custom-search/custom-search.component';
import { CustomSearchResultsComponent, FilterPipe } from './custom-search-results/custom-search-results.component';
import { DocumentLanding2Component } from './document-landing2/document-landing2.component';

@NgModule({
  declarations: [
   // JwPaginationComponent,
    DocumentAdminComponent, 
    ManageTagsComponent, 
    DataGridComponent, 
    ManageTagsActionComponent, 
    DocumentWhitelistComponent, 
    DocumentAdminActionComponent, 
    DocumentTypesComponent, 
    ExcludeFoldersComponent, 
    DocumentLandingComponent,
    FilterPipe,
    DocumentLandingActionComponent,
    DocumentLandingNamesActionComponent,
    DocumentLandingNamesAction2Component,
    PaginationComponent,
    DmsConfigurationComponent,
    DeletedItemsComponent,
    CustomSearchComponent,
    CustomSearchResultsComponent,
    DocumentLanding2Component
  ],
  imports: [
    FormsModule,
    CommonModule,
    DocumentManagementRoutingModule,
    AgGridModule.withComponents([]),
    AngularSplitModule,
    NgSelectModule,
    AngularDateTimePickerModule,
    NgbModule,
    DataTablesModule
  ],
  entryComponents: [
    DataGridComponent, 
    ManageTagsActionComponent, 
    DocumentAdminActionComponent,
    DocumentLandingActionComponent,
    DocumentLandingNamesActionComponent,
    DocumentLandingNamesAction2Component
  ]
})
export class DocumentManagementModule { }
