import {Component} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'child-cell',
    template: `<span class="col-1 pl-0"><i class="fa fa-lg fa-pencil-square-o cur-pointer" aria-hidden="true" title="Edit" (click)="invokeAction('edit')"></i></span>
               <span class="col-1 pl-0"><i class="fa fa-lg fa-trash cur-pointer"  title="Delete" aria-hidden="true" (click)="invokeAction('delete')"></i></span>`,
    styles: []
})
export class DocumentAdminActionComponent implements ICellRendererAngularComp {
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }

    public invokeAction(type: string) {
        this.params.context.componentParent.invokeAction({rowData: this.params.node.data, type});
    }

    refresh(): boolean {
        return false;
    }
}