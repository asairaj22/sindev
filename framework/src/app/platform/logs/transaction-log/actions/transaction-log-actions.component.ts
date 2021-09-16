import {Component} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'child-cell',
    template: `<span (click)="sendRowData()"> View Details </span>`,
    styles: [
        `span {
            cursor: pointer;
            color: #3174c7;
        }`
    ]
})
export class TransactionLogActionsComponent implements ICellRendererAngularComp {
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }

    public sendRowData() {
        this.params.context.componentParent.passCurrentRowData(this.params.node.data);
    }

    refresh(): boolean {
        return false;
    }
}