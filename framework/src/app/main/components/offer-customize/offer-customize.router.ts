import { NgModule, Component } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OfferCustomizeComponent } from "./offer-customize.component";

const customizeRoutes: Routes = [
  {
    path: '',
    component: OfferCustomizeComponent,
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(customizeRoutes)],
  exports: [RouterModule],
})
export class OfferCustomizeRouter {} 
