import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiService } from '@platform/util/api.service';
import { DocumentManagementService } from './../service/document-management.service';
import { CustomSearchService } from './../service/custom-search.service';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-deleted-items',
  templateUrl: './deleted-items.component.html',
  styleUrls: ['./deleted-items.component.css', './../document-management.module.css'],
  encapsulation: ViewEncapsulation.None
})
export class DeletedItemsComponent implements OnInit {
  private DOCUMENTTYPE_LIST_output: Array<any> = [];
  DOCUMENTTYPE_LIST_Options: Array<any> = [];
  RESTORE_FOLDER: any;
  RESTORE_DOCUMENT: any;
  HD_FOLDER: any;
  HD_DOCUMENT: any;
  defaultDateTimeFormat: string = '';
  private dateFormat: any = {"moment":{"EEE":"ddd","EEEE":"dddd","d":"D","dd":"DD","M":"M","MM":"MM","MMM":"MMM","MMMM":"MMMM","yy":"YY","yyyy":"YYYY","h":"h","hh":"hh","H":"H","HH":"HH","a":"A","mm":"mm","ss":"ss","S":"ms"}};

  constructor( private apiService: ApiService, private documentManagementService: DocumentManagementService , public customSearchService: CustomSearchService, private toastr: ToastrService ) { }

  getDocumentTypeList(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.documentManagementService.getDocumentTypeList('DELETED-ITEMS',
      (res: any) => {
        let output = res.body || {};
        
        this.DOCUMENTTYPE_LIST_output = [];
        if (output.hasOwnProperty('_embedded')) {
          var outputData = output['_embedded'];
          if(outputData.hasOwnProperty('documentTypes')){
            this.DOCUMENTTYPE_LIST_output = outputData['documentTypes'];
            this.DOCUMENTTYPE_LIST_Options = [];
            for(let i=0; i < this.DOCUMENTTYPE_LIST_output.length; i++){
              let obj = {};
              obj['type'] = 'option';
              obj['value'] = this.DOCUMENTTYPE_LIST_output[i].docTypeId + '';
              obj['label'] = this.DOCUMENTTYPE_LIST_output[i].name;
              this.DOCUMENTTYPE_LIST_Options.push(obj);
            }
          }
        }
        this.apiService.loaderHide('loader');
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    );
  }

  showrestoreFolderDlg(data: any){
    this.RESTORE_FOLDER = { folderName: data.FolderName, folderId: data.FolderId, childId: data.ChildId, childName: data.ChildName, option: '0' };
    $("#restore-folder-dlg").modal("show");
  }

  restoreFolderConfirmed(){
    this.apiService.loaderShow('loader', ' Loading...');
    
    let reqObj = this.RESTORE_FOLDER;
    reqObj.input = JSON.stringify({});
    this.apiService.invokePlatformServiceApi('/dmsDelete/restoreFolder', 'POST', reqObj, this.customSearchService.getAdditionalHeaders()).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        let responseBody = res.body || {};
        
        if(responseBody["Sucessfully"]){
          this.toastr.success("Folder Restored Successfully");
          setTimeout(() => {
            this.invokeAdvancedSearchPagination();
          }, 300);
        }else{
          this.toastr.error("Folder Restoration Failed");
        }
        $("#restore-folder-dlg").modal("hide");
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((err.error || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  showrestoreDocumentDlg(data: any){
     
    this.RESTORE_DOCUMENT = { name: data._source.FileName, DocumentName: data._id, version: data._source.version, FolderId: data._source.FolderId };
    $("#RestoreModal").modal("show");
  }

  restoreDocumentConfirmed(){
    this.apiService.loaderShow('loader', ' Loading...');
    
    let reqObj = this.RESTORE_DOCUMENT;
    reqObj.input = JSON.stringify({});
    this.apiService.invokePlatformServiceApi('/dmsDelete/restoreDocument', 'POST', reqObj, this.customSearchService.getAdditionalHeaders()).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        let responseBody = res.body || {};
        
        if(responseBody["STATUS"] == true){
          this.toastr.success("Document Restored Successfully");
          setTimeout(() => {
            this.invokeAdvancedSearchPagination();
          }, 300);
        }else if(responseBody["STATUS"] == false){
          this.toastr.error(responseBody["ERROR"]);
        }else{
          this.toastr.error("Document Restoration Failed");
        }
        $("#RestoreModal").modal("hide");
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((err.error || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  };
  
  //Hard folder Delete
  showhdFolderDlg(data: any){
     
    this.HD_FOLDER = { name: data.ChildName, FolderId: data.ChildId };
    $("#folderHDModal").modal("show");
  }; 

  hdFolderConfirmed(){
    this.apiService.loaderShow('loader', ' Loading...');
    
    let reqObj = this.HD_FOLDER;
    reqObj.input = JSON.stringify({});
    this.apiService.invokePlatformServiceApi('/dmsDelete/hardDeleteFolder', 'POST', reqObj, this.customSearchService.getAdditionalHeaders()).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        let responseBody = res.body || {};
        
        if(responseBody["STATUS"] == true){
          this.toastr.success("Folder Permanent Deletion Successfully");
          setTimeout(() => {
            this.invokeAdvancedSearchPagination();
          }, 300);
        }else if(responseBody["STATUS"] == false){
          this.toastr.error(responseBody["ERROR"]);
        }else{
          this.toastr.error("Folder Permanent Deletion Failed");
        }
        $("#folderHDModal").modal("hide");
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((err.error || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }; 

  //Hard Delete Document
  showhdDocumentDlg(data: any){
     
    this.HD_DOCUMENT = { name: data._source.FileName, DocumentName: data._id, version: data._source.version, FolderId: data._source.FolderId };
    $("#documentHDModal").modal("show");
  }; 

  hdDocumentConfirmed(){
    this.apiService.loaderShow('loader', ' Loading...');
    
    let reqObj = this.HD_DOCUMENT;
    reqObj.input = JSON.stringify({});
    this.apiService.invokePlatformServiceApi('/dmsDelete/hardDeleteDocument', 'POST', reqObj, this.customSearchService.getAdditionalHeaders()).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        let responseBody = res.body || {};
        
        if(responseBody["STATUS"] == true){
          this.toastr.success("Document Permanent Deletion Successfully");
          setTimeout(() => {
            this.invokeAdvancedSearchPagination();
          }, 300);
        }else if(responseBody["STATUS"] == false){
          this.toastr.error(responseBody["ERROR"]);
        }else{
          this.toastr.error("Document Permanent Deletion Failed");
        }
        $("#documentHDModal").modal("hide");
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((err.error || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  };

  invokeAdvancedSearchPagination(){
    let from = this.customSearchService.AD_PAGINATION['FROM']; 
    let to =  this.customSearchService.AD_PAGINATION['TO']; 
    this.customSearchService.advancedSearchPagination(from,to);
  };
  
  setDefaultTimeFormat(){
    let format = (JSON.parse(sessionStorage.generalConfiguration || '{}')[this.apiService.accountName] || {}).defaultDateTimeFormat || '';
    if(format == ''){
      format = 'MM/DD/YYYY HH:mm:ss';
    }
    this.defaultDateTimeFormat = this.getMomentDateFormat(format);
  }

  getMomentDateFormat(format: string){
    return this.updateFormat(this.dateFormat.moment, format, '%')
  }

  updateFormat(dateFormatObj: any, format: string, additionKey: string){
    additionKey = additionKey || '';
    Object.keys(dateFormatObj).sort().reverse().forEach(function(key){
      const temp_format = format.replace(key, additionKey + dateFormatObj[key]);
      if(temp_format.indexOf('%%') == -1){
        format = temp_format;
      }
    });
    if(additionKey != ''){
      const reg = new RegExp(additionKey, 'g');
      format = format.replace(reg, '');			
    }
    if(format.indexOf('XXXXX') != -1){
      format = format.replace('XXXXX', 'SS');
    }
    return format;
  }

  ngOnInit() {
    this.customSearchService.goToAdvancedSearch('Deleted Items', 'deleted');
    this.getDocumentTypeList();
    this.setDefaultTimeFormat();
  }

}
