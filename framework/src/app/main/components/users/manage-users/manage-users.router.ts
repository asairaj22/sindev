import { NgModule, Component } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateUsersComponent } from "./create-users/create-users.component";
import { ManageUsersComponent } from "./manage-users-landing/manage-users.component";
import { DefaultUsersComponent } from "./default-users/default-users.component";


const routes: Routes = [
{
  path: '',
  component: ManageUsersComponent,
},
{ path: "create-user", component: CreateUsersComponent }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule],
})
export class ManageUsersRouter {}
