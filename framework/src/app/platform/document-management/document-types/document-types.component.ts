import { Component, OnInit } from '@angular/core';
import { ApiService } from '@platform/util/api.service';
import { DocumentManagementService } from './../service/document-management.service';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-document-types',
  templateUrl: './document-types.component.html',
  styleUrls: ['./document-types.component.css']
})
export class DocumentTypesComponent implements OnInit {
  private columnDefs: any;
  private context: any;
  private docTypeOutput: object[];
  private doctype: any;
  private DOCTYPE_NAME_LIST: string[];
  showScreen: string;
  private createDocTypeReq: object = {};
  deleteDocTypeReq: any = {};
  private editDocTypeReq: object = {};
  private tempEditDocTypeReq: object = {};
  private enableUpdateButton: boolean = false;

  constructor( private apiService: ApiService, private documentManagementService: DocumentManagementService , private toastr: ToastrService ) { }

  initGridDetails(){
    this.context = { componentParent: this };
    this.columnDefs = [
      {headerName: 'Name', field: 'name', filter: "agTextColumnFilter", filterParams: { clearButton: true, applyButton: true }, sortable: true },
      {headerName: 'Description', field: 'description', filter: "agTextColumnFilter", filterParams: { clearButton: true, applyButton: true }, sortable: true },
      {headerName: 'Action', sortable: false }
    ];
  }

  initDocTypeDetails(){
    this.docTypeOutput = [];
    this.doctype = {'Name': [], 'Description': []};
    this.DOCTYPE_NAME_LIST = [];
  }

  getDocTypeList(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.documentManagementService.getDocumentTypeList('ADMIN',
      (res: any) => {
        let _this = this;
        let responseBody = res.body;
        if(typeof responseBody == 'object' && Object.keys(responseBody).length > 0){
          this.initDocTypeDetails();
          if (responseBody.hasOwnProperty('_embedded')) {
						var outputData = responseBody['_embedded'];
						if(outputData.hasOwnProperty('documentTypes')){
              this.docTypeOutput = outputData['documentTypes'];
              this.docTypeOutput.forEach((attr: any) => {
                if(attr.name == undefined){
                  var childName = attr.childName;
                  if(childName != undefined && _this.doctype['Name'].indexOf(childName) == -1){
                    _this.doctype['Name'].push(childName);
                  }
                }else if(_this.doctype['Name'].indexOf(attr.name) == -1){
                  _this.doctype['Name'].push(attr.name);
                }
                if((attr.description || '') != '' && _this.doctype['Description'].indexOf(attr.description) == -1){
                  _this.doctype['Description'].push(attr.description);
                }else if(_this.doctype['Description'].indexOf('(Blanks)') == -1){
                  _this.doctype['Description'].unshift('(Blanks)');
                }
              });
              for(var i=0; i< this.docTypeOutput.length; i++){
                this.DOCTYPE_NAME_LIST.push(this.docTypeOutput[i]['name']);
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
  };

  docTypeCreate(){
    if((this.createDocTypeReq['name'] || '').trim() == ''){
      this.toastr.error('Name is Empty');
      return;
    }
    if(this.DOCTYPE_NAME_LIST.indexOf(this.createDocTypeReq['name'].trim()) != -1){
      this.toastr.error('Document Type already exists');
      return;
    }
    this.apiService.loaderShow('loader', ' Loading...');
    let inputObj = {};
    let createDocTypeApiReq = JSON.parse(JSON.stringify(this.createDocTypeReq));
		createDocTypeApiReq.input = JSON.stringify(inputObj);
    this.createOrUpdateDocType(createDocTypeApiReq, 'Document Type created', 'Document Type creation Failed');
  }

  showEditDocTypeScreen(rowData: any){
    this.tempEditDocTypeReq = rowData;
    this.editDocTypeReq = JSON.parse(JSON.stringify(this.tempEditDocTypeReq));
    this.showScreen = 'doctype-edit';
    this.enableUpdateButton = false;
  }

  docTypeEdit(){
		if((this.editDocTypeReq['name'] || '') == ''){
			this.toastr.error('Name is Empty');
			return;
		}
		let dupData: boolean = false;
		let uniDuoData: boolean = false;
		this.docTypeOutput.forEach((tagObj: object) => {
      if((tagObj['name'] == this.editDocTypeReq['name'])){
        dupData= true;
      }
    });
		if(dupData){
			this.toastr.error('Name already Exist');
			return;
    }
    this.apiService.loaderShow('loader', ' Loading...');
		let editDocTypeApiReq = JSON.parse(JSON.stringify(this.editDocTypeReq));
		var inputObj = {};
    editDocTypeApiReq.input = JSON.stringify(inputObj);
    this.createOrUpdateDocType(editDocTypeApiReq, 'Document Type Updated', 'Document Type Update Failed');
  }

  createOrUpdateDocType(reqObj: object, successMessage: string, errorMessage: string){
    this.apiService.invokePlatformServiceApi('/dmsAdmin/createDocType', 'POST', reqObj).subscribe(
      res => {
        
        this.apiService.loaderHide('loader');
        if((res.body || {})['docTypeId']){
          this.toastr.success(successMessage);
        }else{
          this.toastr.error(errorMessage);
        }
        this.getDocTypeList();
        this.showScreen = 'doctype-table';
        // After creating, removed applied filter.
        // vu.filterAttrData =[];
        // if($('.filter-highlight ').length > 0 ){
        //   $('.filter-highlight ').removeClass('filter-highlight');
        // }
      },
      err => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    );
  }

  showDeleteDocTypeModal(rowData: any){
    this.deleteDocTypeReq = rowData;
    $('#delete-doc-type').modal('show');
  }

  deleteDocType(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.apiService.invokePlatformServiceApi('/dmsAdmin/deleteDocType/' + this.deleteDocTypeReq['docTypeId'], 'DELETE').subscribe(
      res => {
        this.apiService.loaderHide('loader');
        const _resp = res.body || {};
        if(_resp){
          if(_resp['status'] == 'Success'){
            this.toastr.success('Document Type Deleted');
            this.getDocTypeList();
          }else{
            this.toastr.error('Deletion Failed');
          }
        }
        //Screen will get refresh, (filter,activeFilter,filtered data will reset)
        // vu.filterAttrData =[];
        // if($('.filter-highlight ').length > 0 ){
        //   $('.filter-highlight ').removeClass('filter-highlight');
        // }
        // scope.searchedDataDT = "";
        // vu.filter_Doc_List_output = [];
      },
      err => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    );
  }

  isEditDataChanged(){
    if((this.tempEditDocTypeReq['name'] !== this.editDocTypeReq['name']) || (this.tempEditDocTypeReq['description'] !== this.editDocTypeReq['description'])){
      this.enableUpdateButton = true;
    }else{
      this.enableUpdateButton = false;
    }
  }

  ngOnInit() {
    this.showScreen = 'doctype-table';
    this.initDocTypeDetails();
    this.getDocTypeList();
    this.initGridDetails();
  }

}
