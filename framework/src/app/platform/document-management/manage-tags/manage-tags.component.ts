import { Component, OnInit } from '@angular/core';
import { ApiService } from '@platform/util/api.service';
import { DocumentManagementService } from './../service/document-management.service';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-manage-tags',
  templateUrl: './manage-tags.component.html',
  styleUrls: ['./manage-tags.component.css']
})
export class ManageTagsComponent implements OnInit {
  private columnDefs: any;
  private context: any;
  private tag: any;
  private tagListOutput: object[];
  private tagNameList: string[];
  showCreateTagScreen = false;
  private createTagReq: object = {};
  deleteTagReq: any = {};

  constructor( private apiService: ApiService, private documentManagementService: DocumentManagementService ,private toastr: ToastrService ) { }

  initGridDetails(){
    this.context = { componentParent: this };
    this.columnDefs = [
      {headerName: 'Name', field: 'name', filter: "agTextColumnFilter", filterParams: { clearButton: true, applyButton: true }, sortable: true },
      {headerName: 'Description', field: 'description', filter: "agTextColumnFilter", filterParams: { clearButton: true, applyButton: true }, sortable: true },
      {headerName: 'Action', sortable: false }
    ];
  }

  initTagListDetails(){
    this.tag = {'Name': [], 'Description': []};
    this.tagListOutput = [];
    this.tagNameList = [];
  }

  getTagList(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.documentManagementService.getTagList('ADMIN',
      (res: any) => {
        let _this = this;
        let responseBody = res.body;
        if(typeof responseBody == 'object' && Object.keys(responseBody).length > 0){
          this.initTagListDetails();
          if (responseBody.hasOwnProperty('_embedded')) {
						var outputData = responseBody['_embedded'];
						if(outputData.hasOwnProperty('tags')){
              _this.tagListOutput = outputData['tags'];
              _this.tagListOutput.forEach((attr: object) => {
                if(attr['name'] == undefined){
                  const childName = attr['childName'];
                  if(childName != undefined && _this.tag.Name.indexOf(childName) == -1)
                    _this.tag.Name.push(childName);
                }else if(_this.tag.Name.indexOf(attr['name']) == -1) {
                  _this.tag.Name.push(attr['name']);
                  _this.tagNameList.push(attr['name']);
                }
                if(attr['description'] != undefined && attr['description'] != ''){
                  if(_this.tag.Description.indexOf(attr['description']) == -1)
                    _this.tag.Description.push(attr['description']);
                }else if(_this.tag.Description.indexOf('(Blanks)') == -1) {
                  _this.tag.Description.unshift('(Blanks)');
                }
              });
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

  tagCreate(){
    if((this.createTagReq['name'] || '').trim()  == ''){
      this.toastr.error('Name is Empty');
      return;
    }
    var regex = new RegExp('[<>()$#@!~%?+=;*{}\\\\^|:\\\\/]');	
    if (regex.test(this.createTagReq['name'])) {
    
      this.toastr.error('Special characters not allowed in the Name');
      return;
    }
    if(this.tagNameList.indexOf(this.createTagReq['name'].trim()) != -1){
      this.toastr.error('Tag already exists');
      return;
    }
    this.apiService.loaderShow('loader', ' Loading...');
    let createTagApiReq = JSON.parse(JSON.stringify(this.createTagReq));
    createTagApiReq.accountName = this.apiService.accountName;
    createTagApiReq.apptName = this.apiService.appName;
    let inputObj = {};
    createTagApiReq.input = JSON.stringify(inputObj);
    this.apiService.invokePlatformServiceApi('/dmsAdmin/createTag', 'POST', createTagApiReq).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        if((res.body || {})['tagId']){
          this.toastr.success('Tag created');
        }else{
          this.toastr.error('Tag creation Failed');
        }
        this.getTagList();
        this.showCreateTagScreen = false;
        // After creating, removed applied filter.
        //   vu.filterAttrData =[];
        //   if($('.filter-highlight ').length > 0 ){
        //     $('.filter-highlight ').removeClass('filter-highlight');
        //   }
        //   scope.searchedDataDT = '';
        //   //vu.filter_Doc_List_output = [];
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    );
  }

  showDeleteTagModal(rowData: any){
    this.deleteTagReq = rowData;
    $('#delete-tag-modal').modal('show');
  }

  deleteTag(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.apiService.invokePlatformServiceApi('/dmsAdmin/deleteTag/' + this.deleteTagReq['tagId'], 'DELETE').subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        const _resp = res.body || {};
        if(_resp){
          if(_resp['status'] == 'Success'){
           this.toastr.success('Tag Deleted');
           this.getTagList();
           //Screen will get refresh, (filter,activeFilter,filtered data will reset)
          //  vu.filterAttrData =[];
          //  if($('.filter-highlight ').length > 0 ){
          //    $('.filter-highlight ').removeClass('filter-highlight');
          //  }
          //  scope.searchedDataDT = '';
          //  vu.filter_Doc_List_output = [];
          }else{
            this.toastr.error('Tag Deletion Failed');
          }
        }
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    );
  }

  ngOnInit() {
    this.initTagListDetails();
    this.getTagList();
    this.initGridDetails();
  }

}
