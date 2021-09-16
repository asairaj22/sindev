import {Component} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'child-cell',
    template: `<span> <input type='checkbox' (change)="checkBoxChanged($event)"/> </span>`,
    styles: [
        `span {
            cursor: pointer;
            color: #3174c7;
        }`
    ]
})
export class AuditLogCheckboxComponent implements ICellRendererAngularComp {
    public params: any;
    count: number = 0;
    rowDatas:any = [];
    agInit(params: any): void {
        this.params = params;
    }

    public checkBoxChanged(event: any) {
        if(event.target.checked){
            this.params.context.componentParent.passCurrentRowCheckboxData(this.params.node.data);
        }else{
            this.params.context.componentParent.passCurrentRowCheckboxData(this.params.node.data.id);   
        }
    }

    refresh(): boolean {
        return false;
    }

}