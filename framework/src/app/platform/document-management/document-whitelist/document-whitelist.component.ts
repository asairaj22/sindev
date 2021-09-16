import { Component, OnInit } from '@angular/core';
import { ApiService } from '@platform/util/api.service';
import { DocumentManagementService } from './../service/document-management.service';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-document-whitelist',
  templateUrl: './document-whitelist.component.html',
  styleUrls: ['./document-whitelist.component.css']
})
export class DocumentWhitelistComponent implements OnInit {
  private columnDefs: any;
  private context: any;
  private mime: object;
  private docWhiteListOutput: object[];
  private GET_DOC_WHITELIST_EXTENSION: string[];
  private GET_DOC_WHITELIST_EXTTYPE_MAP: object;
  showScreen: string;
  private addMimeTypeReq: object = {};
  deleteMimeTypeReq: any = {};
  private editMimeTypeReq: object = {};
  private tempEditMimeTypeReq: object = {};
  private enableUpdateButton: boolean = false;


  constructor( private apiService: ApiService, private documentManagementService: DocumentManagementService , private toastr: ToastrService ) { }

  initGridDetails(){
    this.context = { componentParent: this };
    this.columnDefs = [
        {headerName: 'MIME Type', field: 'mineType', filter: "agTextColumnFilter", filterParams: { clearButton: true, applyButton: true }, sortable: true },
        {headerName: 'Extension', field: 'extension', filter: "agTextColumnFilter", filterParams: { clearButton: true, applyButton: true }, sortable: true },
        {headerName: 'Allowed', field: 'allowed', filter: "agTextColumnFilter",
            filterParams: { clearButton: true, applyButton: true, 
              textCustomComparator: function(filterType: string, cellvalue: string, filterValue: string) {
                let status: boolean;
                cellvalue = (cellvalue == 'true' ? 'yes' : 'no');
                filterValue = filterValue.toLowerCase();
                switch (filterType) {
                  case 'contains':
                    status = cellvalue.includes(filterValue);
                    break;
                  case 'notContains':
                    status = !cellvalue.includes(filterValue);
                    break;
                  case 'equals':
                    status = (cellvalue == filterValue);
                    break;
                  case 'notEqual':
                    status = (cellvalue != filterValue);
                    break;
                  case 'startsWith':
                    status = cellvalue.startsWith(filterValue);
                    break;
                  case 'endsWith':
                    status = cellvalue.endsWith(filterValue);
                    break;
                  default:
                    break;
                }
                return status;
              }, suppressAndOrCondition: true },
            sortable: true },
        {headerName: 'Action', sortable: true },

    ];
  }

  initWhiteListDetails(){
    this.mime = {'MimeType': [], 'Extension': [], 'Allowed': []};
    this.docWhiteListOutput = [];
    this.GET_DOC_WHITELIST_EXTENSION = [];
    this. GET_DOC_WHITELIST_EXTTYPE_MAP = {};
  }

  getDocumentWhiteList(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.documentManagementService.getDocumentWhiteList('ADMIN',
      (res: any) => {
        let _this = this;
        let responseBody = res.body;
        if(typeof responseBody == 'object' && Object.keys(responseBody).length > 0){
          this.initWhiteListDetails();
          if (responseBody.hasOwnProperty('_embedded')) {
						var outputData = responseBody['_embedded'];
						if(outputData.hasOwnProperty('documentWhiteLists')){
              _this.docWhiteListOutput = outputData['documentWhiteLists'];
              _this.docWhiteListOutput.forEach((attr: object) => {
                if((attr['mineType'] || '') != '' && _this.mime['MimeType'].indexOf(attr['mineType']) == -1){
                  _this.mime['MimeType'].push(attr['mineType']);
                }
                let val: string;
                if(attr['allowed'] === true){
                  val = "YES";
                }else if(attr['allowed'] === false){
                  val = "NO";
                }
                if(_this.mime['Allowed'].indexOf(val) == -1){
                  _this.mime['Allowed'].push(val);
                }
                if((attr['extension'] || '') != '' && _this.mime['Extension'].indexOf(attr['extension']) == -1){
                  _this.mime['Extension'].push(attr['extension']);
                }
              });
							for(var i=0;i<this.docWhiteListOutput.length;i++){
								this.GET_DOC_WHITELIST_EXTENSION.push(this.docWhiteListOutput[i]['extension']);
								this.GET_DOC_WHITELIST_EXTTYPE_MAP[this.docWhiteListOutput[i]['extension']] = this.docWhiteListOutput[i]['mineType'];
							}
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
  
  addMimeType(){
    if((this.addMimeTypeReq['mineType'] || '').trim() == '' || (this.addMimeTypeReq['extension'] || '').trim() == ''){
      this.toastr.error('MimeType/Extension is Empty');
      return;
    }
    if(this.GET_DOC_WHITELIST_EXTENSION.indexOf(this.addMimeTypeReq['extension'].trim()) != -1){
      this.toastr.error('Extension already Exist');
      return;
    }
    this.apiService.loaderShow('loader', ' Loading...');
    if(!this.addMimeTypeReq['allowed']){
      this.addMimeTypeReq['allowed'] = false;
    }
    let addMimeTypeApiReq = JSON.parse(JSON.stringify(this.addMimeTypeReq));
    addMimeTypeApiReq.accountName = this.apiService.accountName;
    addMimeTypeApiReq.apptName = this.apiService.appName;
    var inputObj = {};
    addMimeTypeApiReq.input = JSON.stringify(inputObj);
    this.createOrUpdateMimeType(addMimeTypeApiReq, 'MimeType Added', 'Add MimeType Failed');
  };

  showEditMimeTypeScreen(rowData: any){
    this.tempEditMimeTypeReq = rowData;
    this.editMimeTypeReq = JSON.parse(JSON.stringify(this.tempEditMimeTypeReq));
    this.showScreen = 'whitelist-edit';
    this.enableUpdateButton = false;
  }

  editMimeType(){
    let _this = this
    if((this.editMimeTypeReq['mineType'] || '').trim == '' ||  (this.editMimeTypeReq['extension'] || '').trim() == ''){
      this.toastr.error('MimeType/Extension is Empty');
      return;
    }
    var filtered = this.GET_DOC_WHITELIST_EXTENSION.filter(function(value){
        return value === _this.editMimeTypeReq['extension'];
    });
    var dupMineName = false;
    this.docWhiteListOutput.forEach((objectsVal: any) => {
      if(_this.editMimeTypeReq['mineType'].trim() == objectsVal.mineType && _this.editMimeTypeReq['id'] != objectsVal.id){
        dupMineName = true;
      }
    });
    if(filtered.length > 0 && dupMineName){
      this.toastr.error('MimeType/Extension already Exist');
      return;
    }
    this.apiService.loaderShow('loader', ' Loading...');
    let editMimeTypeApiReq = JSON.parse(JSON.stringify(this.editMimeTypeReq));
    let inputObj = {};
    editMimeTypeApiReq.input = JSON.stringify(inputObj);
    this.createOrUpdateMimeType(editMimeTypeApiReq, 'MimeType Updated', 'MimeType Update Failed');
  };

  createOrUpdateMimeType(reqObj: object, successMessage: string, errorMessage: string){
    this.apiService.invokePlatformServiceApi('/dmsAdmin/addMimeType', 'POST', reqObj).subscribe(
      (res: any) => {
        
        this.apiService.loaderHide('loader');
        if((res.body || {}).id){
          this.toastr.success(successMessage);
        }else{
          this.toastr.error(errorMessage);
        }
        this.getDocumentWhiteList();
        this.showScreen = 'whitelist-table';
        //Screen will get refresh, (filter,activeFilter,filtered data will reset)
        // vu.filterAttrData =[];
        // if($('.filter-highlight ').length > 0 ){
        //   $('.filter-highlight ').removeClass('filter-highlight');
        // }
        // scope.searchedDataDT = "";
        // vu.filter_Doc_List_output = [];
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    );
  };

  showDeleteMimeTypeModal(rowData: any){
    this.deleteMimeTypeReq = rowData;
    $('#delete-mime-type').modal('show');
  }

  deleteMimeType(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.apiService.invokePlatformServiceApi('/dmsAdmin/deleteMimeType/' + this.deleteMimeTypeReq['id'], 'DELETE').subscribe(
      res => {
        this.apiService.loaderHide('loader');
        const _resp = res.body || {};
        if(_resp){
          if(_resp['status'] == 'Success'){
            this.toastr.success('MimeType Deleted');
            this.getDocumentWhiteList();
            //Screen will get refresh, (filter,activeFilter,filtered data will reset)
            // vu.filterAttrData =[];
            // if($('.filter-highlight ').length > 0 ){
            //   $('.filter-highlight ').removeClass('filter-highlight');
            // }
            // scope.searchedDataDT = "";
            // vu.filter_Doc_List_output = [];
          }else{
            this.toastr.error('MimeType Deletion Failed');
          }
        }
      },
      err => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    );
  };

  convertMimeToLowerCase = function(event: any){
    event.target.value = event.target.value.toLowerCase();
  };

  isEditDataChanged(){
    if((this.tempEditMimeTypeReq['mineType'] !== this.editMimeTypeReq['mineType']) 
          || (this.tempEditMimeTypeReq['extension'] !== this.editMimeTypeReq['extension']) 
          || (this.tempEditMimeTypeReq['allowed'] !== this.editMimeTypeReq['allowed'])){
      this.enableUpdateButton = true;
    }else{
      this.enableUpdateButton = false;
    }
  }

  ngOnInit() {
    this.showScreen = 'whitelist-table';
    this.initWhiteListDetails();
    this.getDocumentWhiteList();
    this.initGridDetails();
  }

}
