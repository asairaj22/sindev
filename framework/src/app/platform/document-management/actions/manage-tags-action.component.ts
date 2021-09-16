import {Component} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'child-cell',
    template: `<span class="col-1 pl-0"><i class="fa fa-trash fa-lg cur-pointer"  title="Delete" aria-hidden="true" (click)="invokeAction()"></i></span>`,
    styles: []
})
export class ManageTagsActionComponent implements ICellRendererAngularComp {
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }

    public invokeAction() {
        this.params.context.componentParent.invokeAction({rowData: this.params.node.data, type: 'delete-tags'});
    }

    refresh(): boolean {
        return false;
    }
}