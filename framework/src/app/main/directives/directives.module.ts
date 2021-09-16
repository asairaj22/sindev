import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomDirectiveIfDirective, CustomDisableDirective, InputWhiteSpaceDirective, TextareaWhiteSpaceDirective, NumberDirective, LowercaseDirective, SkipFormValidationDirective, CustomInputDirective } from './custom-directive-if.directive';
import { FilterByPipe } from 'src/app/shared/pipe/filterby.pipe';

@NgModule({
  imports: [],
  declarations: [CustomDirectiveIfDirective, CustomDisableDirective, CustomInputDirective, InputWhiteSpaceDirective, TextareaWhiteSpaceDirective, NumberDirective, LowercaseDirective, SkipFormValidationDirective, FilterByPipe],
  exports: [CustomDirectiveIfDirective, CustomDisableDirective, CustomInputDirective, InputWhiteSpaceDirective, TextareaWhiteSpaceDirective, NumberDirective, LowercaseDirective, SkipFormValidationDirective, FilterByPipe]
})
export class DirectivesModule { }