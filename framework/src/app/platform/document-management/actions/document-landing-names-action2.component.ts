import {Component, Input, OnInit, Output, EventEmitter} from "@angular/core";
import {DocumentManagementService} from "./../service/document-management.service";

@Component({
    selector: 'app-names-action',
    template: `<span class="col-1 pl-0" *ngIf="isFolder" title="{{ rowData.childName }}">
                    <i class='fa fa-folder mr-2' aria-hidden='true'></i>
                    <label class="label label-primary mb-0">
                    <i class='fa fa-share-square cur-pointer mr-1' (click)="triggerCallback('select-folder')"></i>{{ rowData.childName }}
                    </label>
               </span>
               <a style='color:black;' href='javascript:void(0)' *ngIf="!isFolder && !isDownloadableFile" title="{{ rowData.childName }}">{{ rowData.childName }}</a>
               <a href='javascript:void(0)' class='cur-pointer' class="download-file-link" *ngIf="!isFolder && isDownloadableFile" (click)="triggerCallback('download-file')" title="{{ rowData.childName }}">{{ rowData.childName }}</a>`,
    styles: []
})
export class DocumentLandingNamesAction2Component implements OnInit{
    @Input() rowData: any;
    @Output() invokeAction = new EventEmitter<any>();
    isFolder: boolean;
    isDownloadableFile: boolean;

    constructor(private documentManagementService: DocumentManagementService) { }

    public triggerCallback(type: string) {
        this.invokeAction.emit({rowData: this.rowData, type});
    }

    ngOnInit(): void {
        let data = this.rowData;
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
}