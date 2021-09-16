import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyAppsRoutingModule } from './my-apps-routing.module';
import { MyAppsComponent } from './my-apps.component';
import { MyAppsDetailComponent } from './my-apps-detail/my-apps-detail.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { TableModule } from "primeng/table";
 import {MatIconModule} from '@angular/material';
 import { SharedDirectivesModule } from 'src/app/main/modules/shared-module.module';


@NgModule({
  declarations: [MyAppsComponent, MyAppsDetailComponent],
  imports: [
    CommonModule,
    MyAppsRoutingModule,
    TableModule,
    SharedDirectivesModule,
    NgbModule,
    MatIconModule
  ]
})
export class MyAppsModule { }
