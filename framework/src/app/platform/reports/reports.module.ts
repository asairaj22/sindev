import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EpReportLandingComponent } from './ep-report-landing/ep-report-landing.component';
import { EpReportDataGridComponent } from './ep-report-data-grid/ep-report-data-grid.component';
import { EpReportGridLegendComponent } from './ep-report-grid-legend/ep-report-grid-legend.component';
import { EpReportTemplateComponent } from './ep-report-template/ep-report-template.component';
import { EpReportGridPaginationComponent } from './ep-report-grid-pagination/ep-report-grid-pagination.component';
import { EpReportFormComponent } from './ep-report-form/ep-report-form.component';
import { EpReportMatrixComponent } from './ep-report-matrix/ep-report-matrix.component';
import { EplmsdlistDirective } from './widgets/eplmsdlist.directive';
import { EpReportUserValueListComponent } from './ep-report-user-value-list/ep-report-user-value-list.component';
import { EpReportDateTimePickerComponent } from './widgets/ep-report-date-time-picker/ep-report-date-time-picker.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EpReportGraphDirective } from './widgets/ep-report-graph.directive';
import { EpReportChartComponent } from './ep-report-chart/ep-report-chart.component';
import { EpReportYearPickerComponent } from './widgets/ep-report-year-picker/ep-report-year-picker.component';
import { DlDateTimeDateModule, DlDateTimeInputModule, DlDateTimePickerModule } from 'angular-bootstrap-datetimepicker';
import { EpReportMonthPickerComponent } from './widgets/ep-report-month-picker/ep-report-month-picker.component';

@NgModule({
  declarations: [
    EpReportLandingComponent,
    EpReportDataGridComponent,
    EpReportGridLegendComponent,
    EpReportTemplateComponent,
    EpReportGridPaginationComponent,
    EpReportFormComponent,
    EpReportMatrixComponent,
    EplmsdlistDirective,
    EpReportUserValueListComponent,
    EpReportDateTimePickerComponent,
    EpReportGraphDirective,
    EpReportChartComponent,
    EpReportYearPickerComponent,
    EpReportMonthPickerComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    NgbModule.forRoot(),
    DlDateTimeDateModule,
    DlDateTimeInputModule,
    DlDateTimePickerModule,
  ]
})
export class ReportsModule { }
