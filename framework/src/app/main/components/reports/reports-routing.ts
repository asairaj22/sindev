import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { ReportsDetailComponent } from "./reports-detail/reports-detail.component"

const routes: Routes = [
    {
        path: "",
        component: ReportsComponent
    },
    {
        path: "reports-detail/:id",
        component: ReportsDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule { }