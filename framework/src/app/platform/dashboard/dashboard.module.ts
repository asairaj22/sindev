import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderModule } from 'ngx-order-pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { ColorPickerModule } from 'ngx-color-picker';
import { EpDashboardComponent } from './ep-dashboard/ep-dashboard.component';
import { EpQueryBuilderComponent } from './ep-query-builder/ep-query-builder.component';



@NgModule({
  declarations: [EpDashboardComponent, EpQueryBuilderComponent],
  imports: [
    CommonModule,
    FormsModule,
    OrderModule,
    NgbModule,
    DataTablesModule,
    NgxBootstrapSliderModule,
    ColorPickerModule
  ]
})
export class DashboardModule { }
