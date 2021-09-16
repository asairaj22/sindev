import { NgModule, Component } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AllAppsComponent } from "./all-apps.component";

const customizeRoutes: Routes = [
  {
    path: '',
    component: AllAppsComponent,
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(customizeRoutes)],
  exports: [RouterModule],
})
export class AllAppsRouter {} 
