import { NgModule, Component } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CloudServicesComponent } from "./cloud-services.component";
import { ProductDetailsComponent } from "./product-details/product-details.component";

const cloudRoutes: Routes = [
  {path: '', component: CloudServicesComponent },
  { path: "product-details/:id", component: ProductDetailsComponent }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(cloudRoutes)],
  exports: [RouterModule],
})
export class CloudServicesRouter {}
