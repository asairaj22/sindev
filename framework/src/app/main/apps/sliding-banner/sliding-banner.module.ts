import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlidingBannerViewComponent } from './sliding-banner-view/sliding-banner-view.component'
import { SlidingBannerService } from './sliding-banner.service'
import { MatCarouselModule } from '@ngmodule/material-carousel';
import * as Hammer from 'hammerjs';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

export class MyHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    swipe: { direction: Hammer.DIRECTION_ALL },
  };
}

@NgModule({
  imports: [
    CommonModule,
    MatCarouselModule.forRoot()
  ],
  providers: [SlidingBannerService, { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig }],
  declarations: [SlidingBannerViewComponent],
  exports: [SlidingBannerViewComponent]
})
export class SlidingBannerModule { }