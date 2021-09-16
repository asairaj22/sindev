import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-notification-history-action',
  templateUrl: './notification-history-action.component.html',
  styleUrls: ['./notification-history-action.component.css']
})
export class NotificationHistoryActionComponent implements ICellRendererAngularComp {

  params;
  label: string;

  agInit(params): void {
    this.params = params;
    this.label = this.params.label || null;
  }

  refresh(params?: any): boolean {
    return true;
  }

  onClick($event, type) {
    if (this.params.onClick instanceof Function) {
      // const params = {
      //   event: $event,
      //   rowData: this.params.node.data
      // }
      this.params.onClick(this.params,type);

    }
  }

}
