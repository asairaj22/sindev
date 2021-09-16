import {Component} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";
import {DocumentManagementService} from "./../service/document-management.service";

@Component({
    selector: 'child-cell',
    template: `<span class="col-1 pl-0" *ngIf="isFolder" title="{{params.value}}">
                    <i class='fa fa-folder mr-2' aria-hidden='true'></i>
                    <label class="label label-primary">
                    <i class='fa fa-share-square cur-pointer mr-1' (click)="invokeAction('select-folder')"></i>{{params.value}}
                    </label>
               </span>
               <a style='color:black;' href='javascript:void(0)' *ngIf="!isFolder && !isDownloadableFile" title="{{params.value}}">{{params.value}}</a>
               <a href='javascript:void(0)' class='cur-pointer' class="download-file-link" *ngIf="!isFolder && isDownloadableFile" (click)="invokeAction('download-file')" title="{{params.value}}">{{params.value}}</a>`,
    styles: []
})
export class DocumentLandingNamesActionComponent implements ICellRendererAngularComp {
    public params: any;
    isFolder: boolean;
    isDownloadableFile: boolean;

    constructor(private documentManagementService: DocumentManagementService) { }

    agInit(params: any): void {
        this.params = params;
        let data = this.params.node.data;
        if(data["ObjectType"] && data["ObjectType"] == "vFolder"){
            this.isFolder = true;
        }else if(!this.documentManagementService.hasFolderActionPrivilege(data['FolderId'],'View Document')){
            this.isFolder = false;
            this.isDownloadableFile = false;
        }else{
            this.isFolder = false;
            this.isDownloadableFile = true;
        }
    }

    public invokeAction(type: string) {
        this.params.context.componentParent.invokeAction({rowData: this.params.node.data, type});
    }

    refresh(): boolean {
        return false;
    }
}