 

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular'; 

@Component({
    selector: 'app-button-renderer',
    templateUrl: './notification-active-checkbox.component.html',
    styleUrls: ['./notification-active-checkbox.component.css']
  })
export class NotificationActiveCheckboxComponent implements ICellRendererAngularComp {

  params;

  agInit(params): void {
    params.value = params.value == 0 ? false : true;
    this.params = params;
  }

  refresh(params?: any): boolean {
    params.data.active = params.value ? 1 : 0;
    return true;
  }

  onClick($event) {
    if (this.params.onClick instanceof Function) {
      this.params.node.data.active = this.params.value ? "1" : "0";
      const params = {
        event: $event,
        rowData: this.params.node.data
      }
      this.params.onClick(params);

    }
  }
}