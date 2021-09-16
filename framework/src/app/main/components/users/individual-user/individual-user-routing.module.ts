import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndividualUserComponent } from "./individual-user.component";


const routes: Routes = [
  { path: '', component: IndividualUserComponent },
  { path: 'individual-user', component: IndividualUserComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndividualRoutingModule { }
