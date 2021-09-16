import {Component} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'child-cell',
    template: `<a href="javascript:void(0)" (click)="onClick($event)" *ngIf="params.value">{{params.value}}</a>
                <a href="javascript:void(0)" (click)="onClick($event)" *ngIf="params.value == undefined">{{label}}</a>`,
    //template: `<a href="javascript:void(0)" data-toggle="popover" data-content="" (click)="sendRowData()">{{params.value == undefined ? 'models'}}</a>`,
    styles: [
        `span {
            cursor: pointer;
            color: #3174c7;
        }`
    ]
})
export class ProcessLogActionsComponent implements ICellRendererAngularComp {
    public params: any;
    label: string;

    agInit(params: any): void {
        this.params = params;
        this.label = this.params.label || null;
    }

    public sendRowData() {
        //console.error(this.params.node.data);
        this.params.context.componentParent.passCurrentRowData(this.params.node.data);
    }
    onClick($event) {
        if (this.params.onClick instanceof Function) {
          // put anything into params u want pass into parents component
          const params = {
            event: $event,
            rowData: this.params.node.data
            // ...something
          }
          this.params.onClick(params);
    
        }
      }

    refresh(): boolean {
        return false;
    }
}