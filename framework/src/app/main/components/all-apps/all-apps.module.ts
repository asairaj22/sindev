import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllAppsComponent } from "./all-apps.component";
import { AllAppsRouter } from './all-apps.router';
// import {
//     MatAutocompleteModule, MatBadgeModule, MatBottomSheetModule, MatButtonModule,
//     MatButtonToggleModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule,
//     MatDialogModule, MatDividerModule, MatExpansionModule, MatFormFieldModule, MatGridListModule,
//     MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatPaginatorModule,
//     MatProgressBarModule, MatProgressSpinnerModule, MatRadioModule, MatRippleModule, MatSelectModule,
//     MatSidenavModule, MatSliderModule, MatSlideToggleModule, MatSnackBarModule, MatSortModule,
//     MatStepperModule, MatTableModule, MatTabsModule, MatToolbarModule, MatTooltipModule, MatTreeModule
// } from '@angular/material';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    AllAppsRouter,
    MatTooltipModule
  ],
  exports: [MatTooltipModule],
  declarations: [AllAppsComponent]
})
export class AllAppsModule { }