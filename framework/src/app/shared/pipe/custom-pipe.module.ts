import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortByDatePipe } from "src/app/shared/pipe/sortbyDate.pipe";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SortByDatePipe],
  exports: [SortByDatePipe],
})
export class CustomPipeModule { }