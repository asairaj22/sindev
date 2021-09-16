import { Injectable, ViewChild } from '@angular/core';
import { ApiService } from '@platform/util/api.service';
import { DocumentManagementService } from './../service/document-management.service';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class CustomSearchService {
  isShowAdvSearchResultsForCont: boolean = false;
  ADVANCED_DOC_SEARCH: any = {};
  ADVANCED_DOC_SEARCH_RESULTS: any = [];
  advanceSearchTotalRecords: number;
  isAdvSrchTtlRecCountAvail: boolean = false;
  advanceSearchScreen: string = 'search-screen';
  AD_PAGINATION: object = {};
  isEnableclearAdvSearch: boolean = false;
  advSearchResultsFilterObject: object = {};

  constructor( private apiService: ApiService, private documentManagementService: DocumentManagementService, private toastr: ToastrService ) { }

  advancedSearch(){
    this.apiService.loaderShow('loader', ' Loading...');
    document.getElementById('adv-search-no-result-cont').style.display = 'none';
    this.isShowAdvSearchResultsForCont = false;
    this.collapseAllAdvSearchFilterByAccordion();
    this.clearSearchFilter();
    //bu.angular.pageScope.ADVANCED_DOC_SEARCH = {};
    let obj: any = this.ADVANCED_DOC_SEARCH;
    //obj.folderId = folderId;//$scope.SELECTED_FOLDER.original.value+"";
    obj.from = "0";
    obj.size = "1";
    obj.mode = this.ADVANCED_DOC_SEARCH['pageMode']; 

    if(this.ADVANCED_DOC_SEARCH['value']){
      obj.content = this.ADVANCED_DOC_SEARCH['value'];
    }

    if ((this.ADVANCED_DOC_SEARCH['keywords'] || '').trim() != '') {
      obj.keywords = this.ADVANCED_DOC_SEARCH['keywords'].split(",");
      this.isShowAdvSearchResultsForCont = true;
    } else {
      delete obj.keywords;
    }

    if ((this.ADVANCED_DOC_SEARCH['name'] || '').trim() != '') {
      obj.name = this.ADVANCED_DOC_SEARCH['name'].split(",");
      this.isShowAdvSearchResultsForCont = true;
    } else {
      delete obj.name;
    }

    if ((this.ADVANCED_DOC_SEARCH['title'] || '').trim() != '') {
      obj.title = this.ADVANCED_DOC_SEARCH['title'].split(",");
      this.isShowAdvSearchResultsForCont = true;
    } else {
        delete obj.title;
    }

    if ((this.ADVANCED_DOC_SEARCH['description'] || '').trim() != '') {
      obj.description = this.ADVANCED_DOC_SEARCH['description'].split(",");
      this.isShowAdvSearchResultsForCont = true;
    } else {
      delete obj.description;
    }

    /*if(bu.angular.pageScope.ADVANCED_DOC_SEARCH.mime){
      obj.mimeType = bu.angular.pageScope.ADVANCED_DOC_SEARCH.mime.split(",");
    }*/

    if(this.ADVANCED_DOC_SEARCH['fromDate']){
      obj.modifiedFromDate = this.ADVANCED_DOC_SEARCH['fromDate'];
      this.isShowAdvSearchResultsForCont = true;
    }

    if(this.ADVANCED_DOC_SEARCH['toDate']){
      obj.modifiedToDate = this.ADVANCED_DOC_SEARCH['toDate'];
      this.isShowAdvSearchResultsForCont = true;
    }

    if ((this.ADVANCED_DOC_SEARCH['modifiedBy'] || '').trim() != '') {
      obj.modifer = this.ADVANCED_DOC_SEARCH['modifiedBy'].split(",");
      this.isShowAdvSearchResultsForCont = true;
    } else {
      delete obj.modifer;
    }

    if ((this.ADVANCED_DOC_SEARCH['DocStatus'] || '').trim() != '') {
      obj.DocStatus = this.ADVANCED_DOC_SEARCH['DocStatus'].split(",");
      this.isShowAdvSearchResultsForCont = true;
    } else {
      delete obj.DocStatus;
    }
    
    if ((this.ADVANCED_DOC_SEARCH['DocumentType'] || '').trim() != '') {
      obj.DocumentType = this.ADVANCED_DOC_SEARCH['DocumentType'].split(",");
      this.isShowAdvSearchResultsForCont = true;
    } else {
      delete obj.DocumentType;
    }
    this.ADVANCED_DOC_SEARCH = obj;
    let inputObj = {};
    this.ADVANCED_DOC_SEARCH['input'] = JSON.stringify(inputObj);
    this.ADVANCED_DOC_SEARCH_RESULTS = [];
    this.ADVANCED_DOC_SEARCH_RESULTS['CREATORS'] = [];
    this.documentManagementService.getAdvanceSearchDocResults(this.ADVANCED_DOC_SEARCH, this.getAdditionalHeaders(), 
      (res: any) => {
        this.apiService.loaderHide('loader');
        let output =  res.body || {};
        if(output.hasOwnProperty("hits")){
          var outputData = output["hits"];
          if(outputData.hasOwnProperty("hits")){
            this.advanceSearchTotalRecords = outputData["total"];
            console.log(this.advanceSearchTotalRecords);
            if(this.advanceSearchTotalRecords == 0) document.getElementById('adv-search-no-result-cont').style.display = 'block';
            this.isAdvSrchTtlRecCountAvail = true;
          }
        }
      }, 
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  advancedSearchPagination(from: number, size: number){
    this.apiService.loaderShow('loader', ' Loading...');
    //this.ADVANCED_DOC_SEARCH = {};
    let obj: any = this.ADVANCED_DOC_SEARCH;
    //obj.folderId = folderId;//$scope.SELECTED_FOLDER.original.value+"";
    obj.from = from.toString(); 
    obj.size = size.toString(); 
    obj.mode = this.ADVANCED_DOC_SEARCH['pageMode'];

    if(this.ADVANCED_DOC_SEARCH['value']){
      obj.content = this.ADVANCED_DOC_SEARCH['value'];
    }

    if(Array.isArray(this.ADVANCED_DOC_SEARCH['keywords'])){
      obj.keywords = this.ADVANCED_DOC_SEARCH['keywords'].slice(0, this.ADVANCED_DOC_SEARCH['keywords'].length); 
    }else if(this.ADVANCED_DOC_SEARCH['keywords']){
      obj.keywords = this.ADVANCED_DOC_SEARCH['keywords'].split(",");
    }

    if(Array.isArray(this.ADVANCED_DOC_SEARCH['name'])){
      obj.name = this.ADVANCED_DOC_SEARCH['name'].slice(0,this.ADVANCED_DOC_SEARCH['name'].length); 
    }else if(this.ADVANCED_DOC_SEARCH['name']){
      obj.name = this.ADVANCED_DOC_SEARCH['name'];
    }


    if(Array.isArray(this.ADVANCED_DOC_SEARCH['title']) ){
      obj.title = this.ADVANCED_DOC_SEARCH['title'].slice(0,this.ADVANCED_DOC_SEARCH['title'].length); 

    } else if(this.ADVANCED_DOC_SEARCH['title']){
      obj.title = this.ADVANCED_DOC_SEARCH['title'].split(",");
    }

    if(Array.isArray(this.ADVANCED_DOC_SEARCH['description'])){
      obj.description = this.ADVANCED_DOC_SEARCH['description'].slice(0,this.ADVANCED_DOC_SEARCH['description'].length); 
    }else if(this.ADVANCED_DOC_SEARCH['description']){
      obj.description = this.ADVANCED_DOC_SEARCH['description'].split(",");
    }

    /*if(this.ADVANCED_DOC_SEARCH.mime){
      obj.mimeType = this.ADVANCED_DOC_SEARCH.mime.split(",");
    }*/
    if(this.ADVANCED_DOC_SEARCH['fromDate']){
      obj.modifiedFromDate = this.ADVANCED_DOC_SEARCH['fromDate'];
    }
    if(this.ADVANCED_DOC_SEARCH['toDate']){
      obj.modifiedToDate = this.ADVANCED_DOC_SEARCH['toDate'];
    }

    if(Array.isArray(this.ADVANCED_DOC_SEARCH['modifiedBy'])){
      obj.modifer = this.ADVANCED_DOC_SEARCH['modifiedBy'].slice(0,this.ADVANCED_DOC_SEARCH['modifiedBy'].length); 

    } else if(this.ADVANCED_DOC_SEARCH['modifiedBy']){
      obj.modifer = this.ADVANCED_DOC_SEARCH['modifiedBy'].split(",");
    }
    
    //TW 9-12-2019 The following become arrays do not use split
    if(this.ADVANCED_DOC_SEARCH['DocStatus']){
      obj.DocStatus = this.ADVANCED_DOC_SEARCH['DocStatus'];
    }
    if(this.ADVANCED_DOC_SEARCH['DocumentType']){
      obj.DocumentType = this.ADVANCED_DOC_SEARCH['DocumentType'];
    }
    this.ADVANCED_DOC_SEARCH = obj;
    var inputObj = {};
    this.ADVANCED_DOC_SEARCH.input = JSON.stringify(inputObj);
    this.ADVANCED_DOC_SEARCH_RESULTS = [];
    this.ADVANCED_DOC_SEARCH_RESULTS.CREATORS = [];
    this.documentManagementService.getAdvanceSearchDocResults(this.ADVANCED_DOC_SEARCH, this.getAdditionalHeaders(),
      (res: any) => {
        let output =  res.body || {};
        console.log(output);
        this.ADVANCED_DOC_SEARCH_RESULTS = [];
        if (output.hasOwnProperty("hits")) {
          var outputData = output["hits"];
          
          if(outputData.hasOwnProperty("hits")){
            this.ADVANCED_DOC_SEARCH_RESULTS = outputData["hits"];
            this.ADVANCED_DOC_SEARCH_RESULTS.CREATORS = [];
            this.ADVANCED_DOC_SEARCH_RESULTS.FILETYPE = [];
            this.ADVANCED_DOC_SEARCH_RESULTS.CREATED = [];
            this.ADVANCED_DOC_SEARCH_RESULTS.SIZE=[];
            this.ADVANCED_DOC_SEARCH_RESULTS.UPDATEDBY=[];
            this.ADVANCED_DOC_SEARCH_RESULTS.UPDATEDON = [];

            for(var i=0;i<this.ADVANCED_DOC_SEARCH_RESULTS.length;i++){
              var item = this.ADVANCED_DOC_SEARCH_RESULTS[i];
              if(item['_source']['ObjectType'] != undefined && item['_source']['ObjectType'] == 'vFolder'){
                var creator = item['_source']['userName'];
                if(creator){
                  item.creator = creator;
                  if(this.ADVANCED_DOC_SEARCH_RESULTS.CREATORS.indexOf(creator) == -1){
                    this.ADVANCED_DOC_SEARCH_RESULTS.CREATORS.push(creator);
                  }
                }
                var created = item['_source']['CreatedDate'];
                if(created){
                  var currentDate = new Date();
                  var createdDate = new Date(parseInt(created));
                  var diff = this.numDaysBetween(currentDate,createdDate);
                  if(diff <= 365 ){
                    item.CREATED_THIS_YEAR = "THIS_YEAR";
                  }
                  if(diff <= 31){
                    item.CREATED_THIS_MONTH = "THIS_MONTH";
                  }
                  if(diff <= 183){
                    item.CREATED_LAST_SIX_MONTH = "LAST_SIX_MONTH";
                  }
                }
                var updateBy = item['_source']['LastUpdatedBy'];
                if(updateBy){
                  item.updateBy = updateBy;
                  if(this.ADVANCED_DOC_SEARCH_RESULTS.UPDATEDBY.indexOf(updateBy) == -1){
                    this.ADVANCED_DOC_SEARCH_RESULTS.UPDATEDBY.push(updateBy);
                  }
                }
                var updated = item['_source']['LastUpdated'];
                if(updated){
                  var currentDate = new Date();
                  var updatedDate = new Date(parseInt(updated));
                  var diff = this.numDaysBetween(currentDate,updatedDate);
                  if(diff <= 365 ){
                    item.MODIFIED_THIS_YEAR = "THIS_YEAR";
                  }
                  if(diff <= 31){
                    item.MODIFIED_THIS_MONTH = "THIS_MONTH";
                  }
                  if(diff <= 183){
                    item.MODIFIED_LAST_SIX_MONTH = "LAST_SIX_MONTH";
                  }
                }
              }else if(item['_source']['ObjectType'] != undefined && item['_source']['ObjectType'] == 'Documents'){
                var creator = item['_source']['UploadedBy'];
                if(creator){
                  item.creator = creator;
                  if(this.ADVANCED_DOC_SEARCH_RESULTS.CREATORS.indexOf(creator) == -1){
                    this.ADVANCED_DOC_SEARCH_RESULTS.CREATORS.push(creator);
                  }
                }
                var att = item['_source']['attachment'];
                if(att){
                  //var fileType = att['content_type'];
                  var fileType = item['_source']['DocumentType'];
                  if(fileType){
                    item.fileType = fileType;
                    if(this.ADVANCED_DOC_SEARCH_RESULTS.FILETYPE.indexOf(fileType) == -1){
                      this.ADVANCED_DOC_SEARCH_RESULTS.FILETYPE.push(fileType);
                    }
                  }
                  var created = item['_source']['CreatedDate'];
                  if(created){
                    var currentDate = new Date();
                    var createdDate = new Date(parseInt(created));
                    var diff = this.numDaysBetween(currentDate,createdDate);
                    if(diff <= 365 ){
                      item.CREATED_THIS_YEAR = "THIS_YEAR";
                    }
                    if(diff <= 31){
                      item.CREATED_THIS_MONTH = "THIS_MONTH";
                    }
                    if(diff <= 183){
                      item.CREATED_LAST_SIX_MONTH = "LAST_SIX_MONTH";
                    }
                  }
                  var size = item['_source']['size'];
                  if(size){
                    item.size = size;
                    if(this.ADVANCED_DOC_SEARCH_RESULTS.SIZE.indexOf(size) == -1){
                      this.ADVANCED_DOC_SEARCH_RESULTS.SIZE.push(size);
                    }
                  }
                  var updateBy = item['_source']['LastUpdatedBy'];
                  if(updateBy){
                    item.updateBy = updateBy;
                    if(this.ADVANCED_DOC_SEARCH_RESULTS.UPDATEDBY.indexOf(updateBy) == -1){
                      this.ADVANCED_DOC_SEARCH_RESULTS.UPDATEDBY.push(updateBy);
                    }
                  }
                  var updated = item['_source']['LastUpdated'];
                  if(updated){
                    var currentDate = new Date();
                    var updatedDate = new Date(parseInt(updated));
                    var diff = this.numDaysBetween(currentDate,updatedDate);
                    if(diff <= 365 ){
                      item.MODIFIED_THIS_YEAR = "THIS_YEAR";
                    }
                    if(diff <= 31){
                      item.MODIFIED_THIS_MONTH = "THIS_MONTH";
                    }
                    if(diff <= 183){
                      item.MODIFIED_LAST_SIX_MONTH = "LAST_SIX_MONTH";
                    }
                  }
                }
              }
            }
          }
        }
        this.clearSearchFilter();
        setTimeout(() => {
          this.apiService.loaderHide('loader');
        }, 100);
      }, 
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
    this.initAdvSearchResultScreen(this.ADVANCED_DOC_SEARCH.pageMode);
  }

  onAdvSearchChangePage(pageObj: any){
    let totalItems = pageObj.totalItems;
    let startIndex = pageObj.startIndex;
    let endIndex = pageObj.endIndex + 1;
    this.AD_PAGINATION = {}; 
    this.AD_PAGINATION['FROM'] = startIndex;
    this.AD_PAGINATION['TO'] = endIndex;
    document.getElementById("advSearchOutput").innerHTML = ("Showing " + ( (Math.sign(startIndex) == -1 ? 0 : (startIndex + 1)) ) + " - " + endIndex + " of " + totalItems);
    this.advancedSearchPagination(startIndex, endIndex);                 			   
  }

  goToAdvancedSearch(pageTitle: string, pageMode: string){
    this.ADVANCED_DOC_SEARCH = { pageTitle, pageMode };
    if(this.ADVANCED_DOC_SEARCH_RESULTS && this.ADVANCED_DOC_SEARCH_RESULTS.length > 0 && pageMode == 'search'){
      $('#advanced-search-dlg').modal('show');
      this.initAdvSearchResultScreen(pageMode);
    }else{
      this.ADVANCED_DOC_SEARCH = { label: 'Content', value: 'All', pageTitle, pageMode, DocStatus: '', DocumentType: '' };
      this.ADVANCED_DOC_SEARCH_RESULTS = [];
      this.advanceSearchScreen = 'search-screen';
      this.isAdvSrchTtlRecCountAvail = false;	
      if(pageMode == 'search') $('#advanced-search-dlg').modal('show');
      this.resetAdvSearchDateTimePickers();
    }
  }

  clearSearchFilter(){
    this.isEnableclearAdvSearch = false;
    this.advSearchResultsFilterObject = {};
  }

  resetAdvSearchDateTimePickers(){
    $('#advanceSearchDatePickFrom .wc-date-container span').text('Start Time');
    $('#advanceSearchDatePickTo .wc-date-container span').text('End Time');
  }

  backToAdvSearchScreen(){
    let mode = this.ADVANCED_DOC_SEARCH.pageMode; 
    this.ADVANCED_DOC_SEARCH = {};

    if(mode == "search"){
      this.ADVANCED_DOC_SEARCH.pageTitle = "Advanced Search";
      this.ADVANCED_DOC_SEARCH.pageMode = "search"; 			
    }else if (mode == "deleted"){
      this.ADVANCED_DOC_SEARCH.pageTitle = "Deleted Items";
      this.ADVANCED_DOC_SEARCH.pageMode = "deleted"; 
    }
    this.ADVANCED_DOC_SEARCH.label = "Content";
    this.ADVANCED_DOC_SEARCH.value = "All";
    this.ADVANCED_DOC_SEARCH.DocStatus = '';
    this.ADVANCED_DOC_SEARCH.DocumentType = '';
    this.ADVANCED_DOC_SEARCH_RESULTS = [];
    this.resetAdvSearchDateTimePickers();
    this.isAdvSrchTtlRecCountAvail = false;
    this.advanceSearchScreen = 'search-screen';
  }

  initAdvSearchResultScreen(pageMode: string){
    this.ADVANCED_DOC_SEARCH['pageTitle'] = 'Advanced Search Results';
    this.advanceSearchScreen = 'result-screen';
    if(pageMode == 'search') document.getElementById("advanced-search-dlg").scrollTop = 0;
  }

  collapseAllAdvSearchFilterByAccordion(){
    let cardBody: any = document.querySelectorAll("#adv-search-filter-accordion .collapse.show");
    let cardHeader: any = document.querySelectorAll('#adv-search-filter-accordion .card-header button[aria-expanded="true"]');
    (cardBody || []).forEach((element: any) => {
      element.classList.remove('show');
    });
    (cardHeader || []).forEach((element: any) => {
      element.classList.add('collapsed');
    });
  }

  getAdditionalHeaders(){
    return {
      'ep-username': sessionStorage.getItem('ep-username'),
      'ep-appid': (JSON.parse(sessionStorage.getItem('ep-proj-active') || '{}').applicationId || '') + '',
      'ep-userid': sessionStorage.getItem('ep-userid')
    };
  }

  numDaysBetween(d1: Date, d2: Date) {
    var diff = Math.abs(d1.getTime() - d2.getTime());
    return diff / (1000 * 60 * 60 * 24);
  }

}
