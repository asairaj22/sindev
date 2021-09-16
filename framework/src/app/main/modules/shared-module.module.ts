import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectivesModule } from 'src/app/main/directives/directives.module';

@NgModule({
    imports: [
        CommonModule,
        DirectivesModule
    ],
    exports: [
        CommonModule,
        DirectivesModule
    ]
})
export class SharedDirectivesModule {
}
