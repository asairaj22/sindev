import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyAppsComponent } from './my-apps.component';
import { MyAppsDetailComponent } from './my-apps-detail/my-apps-detail.component';

const routes: Routes = [
  { path: '', component: MyAppsComponent },
  { path: 'my-apps-detail', component: MyAppsDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyAppsRoutingModule { }
