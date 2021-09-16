import {Component} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'child-cell',
    template: `<div class="row pt-0 pb-0">
                    <select class="col-12 border-0 custom-select-sm f-s-08rem" *ngIf="!isFolder" [(ngModel)]="selectedAction" (change)="invokeAction()">
                        <option selected value="">-- Select Action  --</option>
                        <option value="approve" *ngIf="actionTypesList.indexOf('Approve') != -1"> Approve </option>
                        <option value="checkin" *ngIf="actionTypesList.indexOf('CheckIn') != -1"> Checkin </option>
                        <option value="checkout" *ngIf="actionTypesList.indexOf('CheckOut') != -1"> Checkout </option>
                        <option value="cancel-checkout" *ngIf="actionTypesList.indexOf('Cancel Check out') != -1"> Cancel Checkout </option>
                        <option value="reject" *ngIf="actionTypesList.indexOf('Reject') != -1"> Reject </option>
                        <option value="remove" *ngIf="actionTypesList.indexOf('Remove') != -1"> Remove </option>
                        <option value="restore" *ngIf="actionTypesList.indexOf('Restore') != -1"> Restore </option>
                        <option value="edit-properties" *ngIf="actionTypesList.indexOf('Edit Properties') != -1"> Edit Properties </option>
                        <option value="view-history" *ngIf="actionTypesList.indexOf('View History') != -1"> View History </option>
                    </select>
					<label class="label label-primary" *ngIf="isFolder">No Actions</label>
                </div>`,
    styles: []
})
export class DocumentLandingActionComponent implements ICellRendererAngularComp {
    public params: any;
    private selectedAction: string = '';
    isFolder = false;
    private actionTypesList: string[] = [];

    agInit(params: any): void {
        this.params = params;
        if(params.valueFormatted) this.actionTypesList = params.valueFormatted.split(",");
		let data = this.params.node.data;
        if(data["ObjectType"] && data["ObjectType"] == "vFolder"){
            this.isFolder = true;
        }
    }

    public invokeAction() {
        this.params.context.componentParent.invokeAction({rowData: this.params.node.data, type: this.selectedAction});
    }

    refresh(): boolean {
        return false;
    }
}
