import { NgModule, Component } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from './home.component';
import { FeaturedArticlesComponent } from "./featured-articles/featured-articles.component";


const routes: Routes = [
  {
    path: "",
    component: HomeComponent
  },
  {
    path: "featured-articles",
    component: FeaturedArticlesComponent
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule],
})
export class HomeRouter {}
