import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { DataGridComponent } from './../data-grid/data-grid.component';
import { PaginationComponent } from './../pagination/pagination.component';
import { ApiService } from '@platform/util/api.service';
import { DocumentManagementService } from './../service/document-management.service';
import { CustomSearchService } from './../service/custom-search.service';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import moment from 'moment';
declare var $: any;

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'app-document-landing2',
  templateUrl: './document-landing2.component.html',
  styleUrls: ['./document-landing2.component.css', './../document-management.module.css'],
  encapsulation: ViewEncapsulation.None
})
export class DocumentLanding2Component implements AfterViewInit, OnDestroy, OnInit{
  @ViewChild(DataTableDirective, {static: false}) private datatableElement: DataTableDirective;
  @ViewChild(DataGridComponent, {static: false}) dataGridComponent: DataGridComponent;
  @ViewChild(PaginationComponent, {static: false}) paginationComponent: PaginationComponent;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtInstance: any;
  isDtInstanceInitialized: boolean = false;
  // Private variables for storing the cache
  conf: any;
  cacheLower = -1;
  cacheUpper = null;
  cacheLastRequest = null;
  cacheLastJson = null;
  private context: any;
  private columnDefs: any;
  private viewHistoryColumnDefs: any;
  private VIRTUALDIRECTORIES_output: object[] = [];
  FOLDER_CONTENT_OUTPUT: object[];
  private DOCUMENT_LIST_output: object[] = [];
  private DOCUMENTTYPE_LIST_output: object[] = [];
  DOCUMENTTYPE_LIST_Options: object[] = [];
  private TAG_LIST_output: object[] = [];
  private TAG_LIST_Options: object[] = [];
  private TAG_NAME_LIST: string[] = [];
  private GET_DOC_WHITELIST_output: object[] = [];
  private GET_DOC_WHITELIST_EXTENSION: string[];
  private GET_DOC_WHITELIST_EXTTYPE_MAP: object = {};
  private treeObj: any;
  private dirJsTreeInstance: any;
  SELECTED_FOLDER: any;
  private GET_DOCUMENTLIST_BYTAGORTYPE: object = {};
  private SELECTED_FOLDER_FOLDERID: string;
  searchedDataDT: string; 
  searchedDataScope: string;
  private dms: any;
  private hasViewPermission: boolean;
  private dataTableTranslationInfo: any;
  private GET_FOLDER_DETAILS: any;
  private isCreateFolder: boolean;
  private isCreatedFolderId: any;
  ADD_FOLDER: object;
  UPLOAD_DOC: object = {}
  private CLEARFILES: boolean;
  private selectTagOptions: object[] = [];
  defaultDateTimeFormat: string = '';
  private dateFormat: any = {"moment":{"EEE":"ddd","EEEE":"dddd","d":"D","dd":"DD","M":"M","MM":"MM","MMM":"MMM","MMMM":"MMMM","yy":"YY","yyyy":"YYYY","h":"h","hh":"hh","H":"H","HH":"HH","a":"A","mm":"mm","ss":"ss","S":"ms"}};
  private ROW_SELECTED: any;
  SELECTED_DOC: any;
  SELECTED_DOCUMENT: any = {};
  VIEW_DOC_HISTORY_output: object[] = [];
  private isRep: boolean;
  private isDocumentLoaded: boolean = false;
  private itemsPerPage: number = 10;
  private landingTableTotalRecords: number;
  private totalRecordObject: any = {};
  DELETE_FOLDER: any;
  private selectedGridAction: string = '';

  constructor( private apiService: ApiService, private documentManagementService: DocumentManagementService, private toastr: ToastrService, public customSearchService: CustomSearchService ) { }

  initDocumentLandingDetails(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.apiService.invokePlatformApi('/virtualDirectories/init', 'POST', {}).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        this.loadLibrary();
        this.getDocumentTypeList();
        this.getTagList();
        this.getDocumentWhiteList();
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  getAdditionalHeaders(){
    return {
      'ep-folderid': this.SELECTED_FOLDER_FOLDERID,
      'ep-username': sessionStorage.getItem('ep-username'),
      'ep-appid': (JSON.parse(sessionStorage.getItem('ep-proj-active') || '{}').applicationId || '') + '',
      'ep-userid': sessionStorage.getItem('ep-userid')
    };
  }

  loadLibrary(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.documentManagementService.getVirtualDirectories('LANDING',
      (res: any) => {
        this.apiService.loaderHide('loader');
        var libraryData = res.body;
        //harcoded library data
        //libraryData = {"_embedded":{"virtualDirectories":[{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4456"},"self":{"href":"http://localhost:8084/virtualDirectories/4456"}},"id":4456,"folderName":"Documents","lft":8,"apptName":"dms","softDeleted":null,"rgt":87,"parentId":1},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/5096"},"self":{"href":"http://localhost:8084/virtualDirectories/5096"}},"id":5096,"folderName":"Sanity 210","lft":9,"apptName":"dms","softDeleted":null,"rgt":12,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/5097"},"self":{"href":"http://localhost:8084/virtualDirectories/5097"}},"id":5097,"folderName":"Dummy sanity","lft":10,"apptName":"dms","softDeleted":null,"rgt":11,"parentId":5096},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/5076"},"self":{"href":"http://localhost:8084/virtualDirectories/5076"}},"id":5076,"folderName":"DeleteFolder","lft":13,"apptName":"dms","softDeleted":null,"rgt":14,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/5036"},"self":{"href":"http://localhost:8084/virtualDirectories/5036"}},"id":5036,"folderName":"new dummy","lft":15,"apptName":"dms","softDeleted":null,"rgt":16,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/5016"},"self":{"href":"http://localhost:8084/virtualDirectories/5016"}},"id":5016,"folderName":"dhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhsjjjjjjjjjjjjjjjjjjjjjjjjahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh","lft":17,"apptName":"dms","softDeleted":null,"rgt":18,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4976"},"self":{"href":"http://localhost:8084/virtualDirectories/4976"}},"id":4976,"folderName":"WCS Telus","lft":19,"apptName":"dms","softDeleted":null,"rgt":20,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4936"},"self":{"href":"http://localhost:8084/virtualDirectories/4936"}},"id":4936,"folderName":"newdummyy11","lft":21,"apptName":"dms","softDeleted":null,"rgt":24,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4956"},"self":{"href":"http://localhost:8084/virtualDirectories/4956"}},"id":4956,"folderName":"dummydelete","lft":22,"apptName":"dms","softDeleted":null,"rgt":23,"parentId":4936},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4916"},"self":{"href":"http://localhost:8084/virtualDirectories/4916"}},"id":4916,"folderName":"cdc1","lft":25,"apptName":"dms","softDeleted":null,"rgt":30,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4996"},"self":{"href":"http://localhost:8084/virtualDirectories/4996"}},"id":4996,"folderName":"cdc3","lft":26,"apptName":"dms","softDeleted":null,"rgt":27,"parentId":4916},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4917"},"self":{"href":"http://localhost:8084/virtualDirectories/4917"}},"id":4917,"folderName":"cdc2","lft":28,"apptName":"dms","softDeleted":null,"rgt":29,"parentId":4916},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4876"},"self":{"href":"http://localhost:8084/virtualDirectories/4876"}},"id":4876,"folderName":"new","lft":31,"apptName":"dms","softDeleted":null,"rgt":32,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4856"},"self":{"href":"http://localhost:8084/virtualDirectories/4856"}},"id":4856,"folderName":"nirmal","lft":33,"apptName":"dms","softDeleted":null,"rgt":34,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4776"},"self":{"href":"http://localhost:8084/virtualDirectories/4776"}},"id":4776,"folderName":"testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest","lft":35,"apptName":"dms","softDeleted":null,"rgt":36,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4736"},"self":{"href":"http://localhost:8084/virtualDirectories/4736"}},"id":4736,"folderName":"newdummy","lft":39,"apptName":"dms","softDeleted":null,"rgt":40,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4717"},"self":{"href":"http://localhost:8084/virtualDirectories/4717"}},"id":4717,"folderName":"AdvanceSearch","lft":41,"apptName":"dms","softDeleted":null,"rgt":42,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4596"},"self":{"href":"http://localhost:8084/virtualDirectories/4596"}},"id":4596,"folderName":"Delete1","lft":45,"apptName":"dms","softDeleted":null,"rgt":46,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4576"},"self":{"href":"http://localhost:8084/virtualDirectories/4576"}},"id":4576,"folderName":"Dummy1","lft":47,"apptName":"dms","softDeleted":null,"rgt":70,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4796"},"self":{"href":"http://localhost:8084/virtualDirectories/4796"}},"id":4796,"folderName":"Usercredentials","lft":48,"apptName":"dms","softDeleted":null,"rgt":69,"parentId":4576},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4843"},"self":{"href":"http://localhost:8084/virtualDirectories/4843"}},"id":4843,"folderName":"qwredfa","lft":49,"apptName":"dms","softDeleted":null,"rgt":50,"parentId":4796},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4842"},"self":{"href":"http://localhost:8084/virtualDirectories/4842"}},"id":4842,"folderName":"swdsadsaaaaaaaaaaaaaaaaasddddddddddddddd","lft":51,"apptName":"dms","softDeleted":null,"rgt":52,"parentId":4796},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4841"},"self":{"href":"http://localhost:8084/virtualDirectories/4841"}},"id":4841,"folderName":"vcdcvd","lft":53,"apptName":"dms","softDeleted":null,"rgt":54,"parentId":4796},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4840"},"self":{"href":"http://localhost:8084/virtualDirectories/4840"}},"id":4840,"folderName":"sdsd","lft":55,"apptName":"dms","softDeleted":null,"rgt":56,"parentId":4796},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4839"},"self":{"href":"http://localhost:8084/virtualDirectories/4839"}},"id":4839,"folderName":"wdwed","lft":57,"apptName":"dms","softDeleted":null,"rgt":58,"parentId":4796},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4838"},"self":{"href":"http://localhost:8084/virtualDirectories/4838"}},"id":4838,"folderName":"654","lft":59,"apptName":"dms","softDeleted":null,"rgt":60,"parentId":4796},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4837"},"self":{"href":"http://localhost:8084/virtualDirectories/4837"}},"id":4837,"folderName":"234","lft":61,"apptName":"dms","softDeleted":null,"rgt":62,"parentId":4796},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4836"},"self":{"href":"http://localhost:8084/virtualDirectories/4836"}},"id":4836,"folderName":"122","lft":63,"apptName":"dms","softDeleted":null,"rgt":64,"parentId":4796},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4817"},"self":{"href":"http://localhost:8084/virtualDirectories/4817"}},"id":4817,"folderName":"User2","lft":65,"apptName":"dms","softDeleted":null,"rgt":66,"parentId":4796},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4816"},"self":{"href":"http://localhost:8084/virtualDirectories/4816"}},"id":4816,"folderName":"User1","lft":67,"apptName":"dms","softDeleted":null,"rgt":68,"parentId":4796},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4457"},"self":{"href":"http://localhost:8084/virtualDirectories/4457"}},"id":4457,"folderName":"TW Folder","lft":79,"apptName":"dms","softDeleted":null,"rgt":86,"parentId":4456},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4896"},"self":{"href":"http://localhost:8084/virtualDirectories/4896"}},"id":4896,"folderName":"Gamma Folder","lft":80,"apptName":"dms","softDeleted":null,"rgt":81,"parentId":4457},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4636"},"self":{"href":"http://localhost:8084/virtualDirectories/4636"}},"id":4636,"folderName":"Beta Folder","lft":82,"apptName":"dms","softDeleted":null,"rgt":83,"parentId":4457},{"accountName":"wcs","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/4556"},"self":{"href":"http://localhost:8084/virtualDirectories/4556"}},"id":4556,"folderName":"Alpha Folder","lft":84,"apptName":"dms","softDeleted":null,"rgt":85,"parentId":4457}]},"_links":{"self":{"href":"http://localhost:8084/virtualDirectories/search/findAllByAccountNameAndApptNameOrderByLftAsc?accountName=wcs&apptName=dms"}}};
        if (libraryData && libraryData.hasOwnProperty("_embedded")) {
          var virtualDirectoriesData = libraryData["_embedded"];
          if(virtualDirectoriesData.hasOwnProperty("virtualDirectories")){
            var directoryTreeJson = {};
            var directoryArray = virtualDirectoriesData["virtualDirectories"];
            this.VIRTUALDIRECTORIES_output = directoryArray;
            var mainParent = [];
            var currentParent = [];
            var j = 0;
            var currentInx = 0;
            for(var i=0;i<directoryArray.length;i++){
              var leftOffset = directoryArray[i].lft;
              var rightOffset = directoryArray[i].rgt;
              if(i == 0){
                //directoryTreeJson["text"] = "Documents";
                directoryTreeJson["text"] = directoryArray[i]["folderName"];
                directoryTreeJson["value"] = directoryArray[i]["id"];
                directoryTreeJson["children"] = [];
                directoryTreeJson["lft"] = directoryArray[i]["lft"];
                directoryTreeJson["rgt"] = directoryArray[i]["rgt"];
                directoryTreeJson["label"] = directoryArray[i]["folderName"];
                //directoryTreeJson["state"] = {"opened": true,"selected":true}; 
                mainParent = directoryTreeJson["children"];
              }else{
                var subJson = {};
                subJson["text"] = directoryArray[i]["folderName"];
                subJson["value"] = directoryArray[i]["id"];
                subJson["label"] = directoryArray[i]["folderName"];
                subJson["lft"] = directoryArray[i]["lft"];
                subJson["rgt"] = directoryArray[i]["rgt"];
                subJson["children"] = [];
                var leftOffset = directoryArray[i].lft;
                var rightOffset = directoryArray[i].rgt;
                if(i == 1){
                  mainParent.push(subJson);
                }else{
                  var childAdded = false;
                  for(var j=0;j<mainParent.length;j++){
                    var innerChild = mainParent[j];
                    if((innerChild.lft < leftOffset )&& (innerChild.rgt > rightOffset)){
                      this.loopThroughChildren(innerChild,subJson);
                      childAdded = true;
                    }
                  }
                  if(!childAdded){
                    mainParent.push(subJson);
                  }
                }
              }
            }
          }
          this.populate(directoryTreeJson);
        }
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  loopThroughChildren(innerChild: any, subJson: any){
		var children = innerChild.children;
		var childAdded = false;
		for(var j=0;j<children.length;j++){
			var child = children[j];
			if((child.lft < subJson.lft)&&(child.rgt > subJson.rgt)){
				this.loopThroughChildren(child,subJson);
				childAdded = true;
			}
		}
		if(!childAdded){
			innerChild.children.push(subJson);
		}
  }
  
  populate(directoryTreeJson: object){
    const _this = this;
    this.dirJsTreeInstance =  $( '#jstree1' );
    try {
      this.dirJsTreeInstance.jstree( 'destroy' );
    } catch ( ex ) { }
    const plugins=["types","sort"];
    this.treeObj = this.dirJsTreeInstance.jstree({
      plugins,
      core: {
          data: directoryTreeJson,
          animation: 100,
          themes: { name: 'proton', responsive: true, icons: false }
      },
      check_callback: true,
			themes: {
				name: 'proton',
				responsive: true
			},
			types: {
				default : {
					"icon" : "fa fa-folder highlight"
				}
			}
    });
    this.dirJsTreeInstance.on('hover_node.jstree', function(e: Event, data: any) {
      var $node = $("#" + data.node.id);
      var target=data.instance.element.find('#'+data.node.id).children('.jstree-anchor');
      if(data.node.parent !="#"){
        if(target.attr('data-toggle')!='tooltip'){
          target.attr('data-toggle','tooltip');
          target.attr('data-placement','top');
          target.attr('title',data.node.text);//target.text()
          target.tooltip('show');
        }
      }
    })
    this.dirJsTreeInstance.on('dehover_node.jstree', function(e: Event, data: any) {
      if(data.node){
        var target = data.instance.element.find('#'+data.node.id).children('.jstree-anchor');
        target.tooltip('hide');
      }
    })
    this.dirJsTreeInstance.on('changed.jstree', function (e: Event, data: any) {
      if(data.node){
        data.instance.toggle_node(data.node);
        _this.SELECTED_FOLDER = data.node;
        _this.GET_DOCUMENTLIST_BYTAGORTYPE = {};
        var folderId = _this.SELECTED_FOLDER.original.value + "";
        _this.SELECTED_FOLDER_FOLDERID = folderId;
        _this.searchedDataDT = ""; 
        _this.searchedDataScope = "1"; 
        _this.getSelectedFolderDetails(folderId);
        var parentKeyArr = data.node.parents;
        _this.SELECTED_FOLDER.PARENTS = [];
        if(parentKeyArr.length>1){
          if(parentKeyArr[0] != "#"){
            parentKeyArr = parentKeyArr.reverse();
          }
          $.each(parentKeyArr,function(parentIndex: number, parentKey: string){
              var parentObj= _this.dirJsTreeInstance.jstree().get_node(parentKey);
              if(parentObj.original!=undefined){
                var originalData=parentObj;
                _this.SELECTED_FOLDER.PARENTS.push(originalData);
              }
          });
        }
      }
    });
    this.dirJsTreeInstance.jstree().hide_dots();
		var folderId = this.getParameterByName('folderId', null);
		this.dirJsTreeInstance.on('loaded.jstree', function (e: Event, data: any) {
			var id = $("#jstree1 .jstree-node")[0].id;
			if(_this.isCreateFolder && _this.isCreatedFolderId != undefined) {
				_this.setTreeSelected(_this.isCreatedFolderId);
				_this.isCreateFolder = false;
        _this.isCreatedFolderId = undefined;
			}else if(folderId != null && folderId.trim() != ''){
				_this.setTreeSelected(folderId);
			}else{
				_this.dirJsTreeInstance.jstree(true).select_node(id);
			}
		});
  }

  getSelectedFolderDetails(folderId: string){
    this.apiService.loaderShow('loader', ' Loading...');
    this.DOCUMENT_LIST_output = [];
    this.dms = {};
    this.dms.Columns = []; 
    this.dms.Columns.Filter = [];
    this.dms.Columns.Filter.Name =[];
    this.dms.Columns.Filter.LastUpdated = []; 
    this.dms.Columns.Filter.Tags = []; 
    this.dms.Columns.Filter.Description = []; 
    this.dms.Columns.Filter.Status = []; 
    this.dms.Columns.Filter.SelectionOrder =[]; //ESD-3078
    this.dms.RANDOM_TEXT_SEARCH = [];
    this.dms.Columns.Filter.SelectionOrder =[]; 
    this.dms.RANDOM_TEXT_SEARCH.randomTextSearch = ""; 
    this.dms.ContentSearch = false; 
    if(!this.hasFolderPrivilege('View Folder')){
      this.dms.Name = [];
      this.dms.LastUpdated = [];
      this.dms.Tags = [];
      this.dms.Description = [];
      this.dms.Status = [];
      this.dms.tempTags = [];
      
      this.hasViewPermission = false;
      if(this.dataTableTranslationInfo == undefined){
        setTimeout(() => {
          this.loadDocuments(-1, 0, 10); 
        }, 500);
      }else{
        this.loadDocuments(-1, 0, 10); 
      }
      return;
    }
    this.hasViewPermission = true;				
    this.GET_FOLDER_DETAILS = {};
    let obj: any = {};
    obj.folderId = folderId;
    obj.from = 0;
    obj.size = 10;
    this.loadDocuments(obj.folderId ,obj.from ,obj.size);
  }

  hasFolderPrivilege(permission: string){
    let hasPrivilege: boolean = false;
    if(sessionStorage.getItem("isAdminUser") == "true"){
      hasPrivilege = true;
    }else if(sessionStorage.getItem("FOLDER_PRIVILEGE") && sessionStorage.getItem("FOLDER_PRIVILEGE") != null){
      var privilegeJson = JSON.parse(sessionStorage.getItem("FOLDER_PRIVILEGE")) || {};
      var currentId = this.SELECTED_FOLDER_FOLDERID || '';
      var permissionList = privilegeJson[currentId];
      if(permissionList && permissionList.indexOf(permission) != -1){
        hasPrivilege = true;
      }
    }
    return hasPrivilege;
  }

  pipeline(){
    return (request: any, drawCallback: any, settings: any) => {
      if(!this.isDtInstanceInitialized){
        this.FOLDER_CONTENT_OUTPUT = [];
        drawCallback({
          recordsTotal: 0,
          recordsFiltered: 0,
          data: []
        });
      }else{
        var ajax = false;
        var requestStart = request.start;
        var drawStart = request.start;
        var requestLength = request.length;
        var requestEnd = requestStart + requestLength;

        if (settings.clearCache) {
          // API requested that the cache be cleared
          ajax = true;
          settings.clearCache = false;
        }
        else if (this.cacheLower < 0 || requestStart < this.cacheLower || requestEnd > this.cacheUpper) {
          // outside cached data - need to make a request
          ajax = true;
        }
        else if (JSON.stringify(request.order) !== JSON.stringify(this.cacheLastRequest.order) ||
          JSON.stringify(request.columns) !== JSON.stringify(this.cacheLastRequest.columns) ||
          JSON.stringify(request.search) !== JSON.stringify(this.cacheLastRequest.search)
        ) {
          // properties changed (ordering, columns, searching)
          ajax = true;
        }

        // Store the request for checking next time around
        this.cacheLastRequest = $.extend(true, {}, request);

        if (ajax) {
          // Need data from the server
          if (requestStart < this.cacheLower) {
            requestStart = requestStart - (requestLength * (this.conf.pages - 1));

            if (requestStart < 0) {
              requestStart = 0;
            }
          }

          this.cacheLower = requestStart;
          this.cacheUpper = requestStart + (requestLength * this.conf.pages);

          request.start = requestStart;
          request.length = requestLength * this.conf.pages;

          // Provide the same `data` options as DataTables.
          if (typeof this.conf.data === 'function') {
            // As a function it is executed with the data object as an arg
            // for manipulation. If an object is returned, it is used as the
            // data object to submit
            var d = this.conf.data(request);
            if (d) {
              $.extend(request, d);
            }
          }
          else if ($.isPlainObject(this.conf.data)) {
            // As an object, the data given extends the default
            $.extend(request, this.conf.data);
          }
          try {
            let requestBody: any = {
                                      start: request.start, 
                                      length: request.length,
                                      dtSearchText: encodeURI(this.searchedDataDT),
                                      dtSearchScope: this.searchedDataScope
                                  };
            if(this.conf.folderId == ''){
              this.FOLDER_CONTENT_OUTPUT = [];
              drawCallback({
                recordsTotal: 0,
                recordsFiltered: 0,
                data: []
              });
            }else{
              this.documentManagementService.getFolderConent({ folderId: this.conf.folderId, from: this.conf.from, size: this.conf.size }, requestBody, this.getAdditionalHeaders(),
                (res: any) => {
                  this.cacheLastJson = $.extend(true, {}, res);
                  var responseBody = (res.body || {});
                  if (responseBody.data) {
                    responseBody.draw = request.draw; // Update the echo for each response
                    if (this.cacheLower != drawStart) {
                      responseBody.data.splice(0, drawStart - this.cacheLower);
                    }
                    if (requestLength >= -1) {
                      responseBody.data.splice(requestLength, responseBody.data.length);
                    }
                    // if (this.searchedDataDT) {
                    //   $('input[type="search"]').val(this.searchedDataDT);
                    // }
                    // if (scope.searchedDataScope) {
                    //   $('#epSearchScope').val(scope.searchedDataScope);
                    // }
                    
                    this.dms.Name = [];
                    this.dms.LastUpdated = [];
                    this.dms.Tags = [];
                    this.dms.Description = [];
                    this.dms.Status = [];
                    this.dms.tempTags = [];
                    var folderContentList = responseBody.data || [];
                    this.DOCUMENT_LIST_output = JSON.parse(JSON.stringify(folderContentList));
                    this.FOLDER_CONTENT_OUTPUT = JSON.parse(JSON.stringify(folderContentList));
                    this.updateGridActionList();
                    drawCallback({
                      recordsTotal: responseBody.recordsTotal,
                      recordsFiltered: responseBody.recordsFiltered,
                      data: []
                    });
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
          } catch (err) {
            this.apiService.loaderHide('loader');
            this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
            console.error( err );
          }
        }else {
          let json = $.extend(true, {}, (this.cacheLastJson.body || {}));
          json.draw = request.draw; // Update the echo for each response
          json.data.splice(0, requestStart - this.cacheLower);
          json.data.splice(requestLength, json.data.length);
          this.FOLDER_CONTENT_OUTPUT = JSON.parse(JSON.stringify(json.data));
          this.updateGridActionList();
          drawCallback({
            recordsTotal: json.recordsTotal,
            recordsFiltered: json.recordsFiltered,
            data: [],
            draw: json.draw
          });
        }
      }
    }
  }

  initGrid(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: false,
      searching: false,
      ajax: this.pipeline(),
      columns: [{ data: 'childName' }, { data: 'LastUpdated' }, { data: 'Tags' }, { data: 'Comments' }, { data: 'DocStatus' }, { data: 'Action' }]
    };
  }

  initDtCacheVariables(opts: any){
    this.conf = $.extend( {
        pages: 10,     // number of pages to cache
        url: '',      // script url
        data: null,   // function or object with parameters to send to the server
                      // matching how `ajax.data` works in DataTables
        method: 'POST' // Ajax HTTP method
    }, opts );
    this.cacheLower = -1;
    this.cacheUpper = null;
    this.cacheLastRequest = null;
    this.cacheLastJson = null;
  }

  renderLandingGrid(opts: object): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.isDtInstanceInitialized = true;
      // clear the table first
      dtInstance.clear();
      // Destroy the table first
      dtInstance.destroy();
      this.initDtCacheVariables(opts);
      this.initGrid();
      this.dtTrigger.next();
    });
  }

  updateGridActionList(){
    (this.FOLDER_CONTENT_OUTPUT || []).forEach((element: any) => {
      if((element.Actions || []).length > 0) element.actionsTypeList = element.Actions[0].split(",");
    });
  }

  loadDocuments(folderId: any, from: any, size: any){
    this.apiService.loaderShow('loader', ' Loading...');
    if(this.dms == undefined) this.dms = {};
    this.dms.currentFolder = folderId;
    this.renderLandingGrid( { folderId, from, size } );
  }
  
  loadDocumentsClone(folderId: any, from: any, size: any){
    if(this.dms == undefined) this.dms = {};
    this.dms.currentFolder = folderId; 
    this.apiService.loaderShow('loader', ' Loading...');
    let requestBody: any = {
                              start: from, 
                              length: size,
                              dtSearchText: this.searchedDataDT,
                              dtSearchScope: this.searchedDataScope
                          };
    this.documentManagementService.getFolderConent({folderId, from, size}, requestBody, this.getAdditionalHeaders(), 
      (res: any) => {
        const _this = this;
        this.isDocumentLoaded = true;
        this.dms.Name = [];
        this.dms.LastUpdated = [];
        this.dms.Tags = [];
        this.dms.Description = [];
        this.dms.Status = [];
        this.dms.tempTags = [];	
        var responseBody =  (res.body || {});
        
        var folderContentList = responseBody.data || [];	
        this.DOCUMENT_LIST_output = JSON.parse(JSON.stringify(folderContentList));
        this.FOLDER_CONTENT_OUTPUT = JSON.parse(JSON.stringify(folderContentList));
        this.apiService.loaderHide('loader');
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    ); 
  }

  getParameterByName(name: string, url: string) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  setTreeSelected(folderId: any){
    const _this = this;
    var targetModelObj= this.dirJsTreeInstance.jstree(true)._model.data;
    $.each(targetModelObj,function(key_jsTree: any, tempNode: any){
      var tempTargetMapToCheck=tempNode.original;
      if(tempTargetMapToCheck && tempTargetMapToCheck.value ==  parseInt(folderId)){
        _this.dirJsTreeInstance.jstree(true).deselect_all(true)
        _this.dirJsTreeInstance.jstree(true).select_node(key_jsTree);
        _this.dirJsTreeInstance.jstree(true).open_node(key_jsTree); 
      }
    });
  }

  getDocumentTypeList(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.documentManagementService.getDocumentTypeList('LANDING',
      (res: any) => {
        this.apiService.loaderHide('loader');
        this.DOCUMENTTYPE_LIST_output = [];
        let output = res.body;
				if (output.hasOwnProperty('_embedded')) {
					var outputData = output['_embedded'];
					if(outputData.hasOwnProperty('documentTypes')){
						this.DOCUMENTTYPE_LIST_output = outputData['documentTypes'];
						this.DOCUMENTTYPE_LIST_Options = [];
						for(let i=0; i < this.DOCUMENTTYPE_LIST_output.length; i++){
							let obj: any = {};
							obj["type"] = "option";
							obj["value"] = this.DOCUMENTTYPE_LIST_output[i]['docTypeId'] + '';
							obj["label"] = this.DOCUMENTTYPE_LIST_output[i]['name'];
							this.DOCUMENTTYPE_LIST_Options.push(obj);
						}
					}
				}
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  getTagList(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.documentManagementService.getTagList('LANDING',
      (res: any) => {
        this.apiService.loaderHide('loader');
	      
				let output = res.body
				this.TAG_LIST_output = [];
				if (output.hasOwnProperty("_embedded")) {
					var outputData = output["_embedded"];
					if(outputData.hasOwnProperty("tags")){
						this.TAG_LIST_output = outputData["tags"];
						this.TAG_LIST_Options = [];
						for(var i=0; i < this.TAG_LIST_output.length; i++){
							let obj: any = {};
							obj["type"] = "option";
							obj["value"] = this.TAG_LIST_output[i]['name'];
							obj["label"] = this.TAG_LIST_output[i]['name'];
							this.TAG_LIST_Options.push(obj);
							this.TAG_NAME_LIST.push(this.TAG_LIST_output[i]['name']);
						}
					}
				}
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  getDocumentWhiteList(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.documentManagementService.getDocumentWhiteList('LANDING',
      (res: any) => {
        this.apiService.loaderHide('loader');
		    
					var output = res.body;
					this.GET_DOC_WHITELIST_output = [];
					if (output.hasOwnProperty("_embedded")) {
						var outputData = output["_embedded"];
						if(outputData.hasOwnProperty("documentWhiteLists")){
							this.GET_DOC_WHITELIST_output = outputData["documentWhiteLists"];
              this.GET_DOC_WHITELIST_EXTENSION = [];
              this.GET_DOC_WHITELIST_EXTTYPE_MAP = {};
							for(var i=0; i < this.GET_DOC_WHITELIST_output.length; i++){
								this.GET_DOC_WHITELIST_EXTENSION.push(this.GET_DOC_WHITELIST_output[i]['extension']);
								this.GET_DOC_WHITELIST_EXTTYPE_MAP[this.GET_DOC_WHITELIST_output[i]['extension']] = this.GET_DOC_WHITELIST_output[i]['mineType'];
							}
						}
					}
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  showCreateFolderDlg(){
    //vu.filters.hideFilterPopup();
    this.ADD_FOLDER = {};
    if(!this.SELECTED_FOLDER || this.SELECTED_FOLDER == null){
      this.toastr.error('Select a parent folder');
      return;
    }
    this.ADD_FOLDER['parent'] = this.SELECTED_FOLDER.original.label;
    this.ADD_FOLDER['child'] = '';
    $("#create-folder-dlg").modal("show");
  }
  
  createFolder(){
    const _this = this;
    var regex = new RegExp("[<>()$#@!~%?+=;*{}\\\\^|:\\\\/]");
    if (regex.test(this.ADD_FOLDER['child']) ) {
     
      this.toastr.error("Special characters not allowed in the Folder Name");
      return; 
    }
    
    if((this.ADD_FOLDER['child'] || '').trim() == '' || !this.ADD_FOLDER['parent'] ){
      this.toastr.error('Folder Name/Parent Empty');
      return;
    }
    //ESD-3057 Folder names must be at three characters
    var l = this.ADD_FOLDER['child'].length; 
    if(l <= 2){
      this.toastr.error('Folder Name must be at least three characters or greater');
      return;
    }
    this.apiService.loaderShow('loader', ' Loading...');
    this.ADD_FOLDER = this.ADD_FOLDER;
    var inputObj = {};
    var addFolderReq = JSON.parse(JSON.stringify(this.ADD_FOLDER));
    addFolderReq.input = JSON.stringify(inputObj);
    this.apiService.invokePlatformApi('/virtualDirectories/' + this.ADD_FOLDER['parent']  + '/' + this.ADD_FOLDER['child'], 'POST', addFolderReq, this.getAdditionalHeaders()).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        var responseBody = (res.body || {});
        
        if(responseBody['Sucessfully']){
          this.toastr.success("Folder Created Successfully");
        }else if(responseBody['Info']){
          this.toastr.error(responseBody['Info']);
        }else{
          this.toastr.error("Create Folder Failed");
        }
        this.updateFolderPrivilegeToSession();
        $("#create-folder-dlg").modal("hide");
        setTimeout(() => {
          if(responseBody["ChildId"]){
            _this.isCreateFolder = true;
            _this.isCreatedFolderId = responseBody["ChildId"];
          }
          _this.loadLibrary();
          _this.searchedDataDT = "";
          _this.searchedDataScope = "1"; 
          // vu.filterAttrData =[];
          // if($('.filter-highlight ').length > 0 ){
          //   $('.filter-highlight ').removeClass('filter-highlight');
          // }
          //vu.filter_Doc_List_output = [];
        }, 300);
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    );
  }
    
  updateFolderPrivilegeToSession(){
    this.apiService.invokePlatformApi('/folderPrivilege', 'GET').subscribe(
      (res: any) => {
        sessionStorage.setItem("FOLDER_PRIVILEGE", JSON.stringify(res.body));
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    );
  }

  redirectToUpload(){
    const _this = this;
		this.UPLOAD_DOC = {selectedTagsList: []};
		this.UPLOAD_DOC['author'] = JSON.parse(sessionStorage.getItem("userDetails") || '{}')['name'] || ''; 
		var fileInput = document.getElementById('file');
    this.clearFiles(fileInput);
    $("#doc_name").text("Choose file");
		if(this.GET_DOC_WHITELIST_EXTENSION){
			fileInput.setAttribute("accept", this.GET_DOC_WHITELIST_EXTENSION.join());
    }
    this.selectTagOptions = [];
    this.TAG_LIST_Options.sort(this.dynamicSort("value")).forEach(function(val,indx){
      _this.selectTagOptions.push(val);
    });
		$("#document-upload-dlg").modal("show");
  }

  setMimeType(){
    const _this = this;
    let fileInput: any = document.getElementById('file');
    var file = fileInput.files[0];
    
    
    var filename = file.name;
    var filesName = file.name.split('.');
    var ext = '.' + filesName[filesName.length-1].toLowerCase();
    
    //AE-7120 To prevent unsupported special characters in the file name that 
    //prevent file download. 
    //var pattern = "[:\\\\\\\\/*?|<>]"; 
    var regex = new RegExp("[<>()$#@!~%?+=;*{}\\\\^|:\\\\/]");
    //if(filesName[0].match(pattern)){
    if( regex.test(filesName[0])){
      this.toastr.error("Unsupported special characters in the file name");
      document.getElementById("file")['value'] = '';
      this.UPLOAD_DOC['docType'] = '';
      this.UPLOAD_DOC['name'] = '';
      return;
    }
    
    if(fileInput.files.length == 0){
      $("#doc_name").text("Choose file");
    }else{
      $("#doc_name").text(fileInput.files[0].name);
    }
    if(!file && this.CLEARFILES == false){
      this.toastr.error("Select a file");
      return;
    }

    if(this.GET_DOC_WHITELIST_EXTENSION.indexOf(ext) == -1){
      //TW 3-12-2019 $scope was not defined and was throwing a uncaught ref error
      this.toastr.error("File not supported");
      //$("#doc_name").text("File not supported");
      document.getElementById("file")['value'] = '';
      this.UPLOAD_DOC['docType'] = "";
      this.UPLOAD_DOC['name'] = "";
      return;
    }else{
      this.UPLOAD_DOC['name'] = filename;
      this.UPLOAD_DOC['mimeType'] = this.GET_DOC_WHITELIST_EXTTYPE_MAP[ext];
      var filtered = this.DOCUMENTTYPE_LIST_Options.filter(function(value: any){
          return value.label === _this.GET_DOC_WHITELIST_EXTTYPE_MAP[ext];
      });
      if(filtered.length > 0){
        this.UPLOAD_DOC['docType'] = filtered[0]['value'];
      }
    }
  }

  setCheckinMimeType(){
    const _this = this;
    let fileInput: any = document.getElementById('checkInFile');
    let file = fileInput.files[0];
    if(fileInput.files.length == 0){
      $("#checkin_doc_name").text("No File Choosen");
    }else{
      $("#checkin_doc_name").text(fileInput.files[0].name);
    }
    if(!file && this.CLEARFILES == false){
      this.toastr.error("Select a file");
      return;
    }
    
    let filesName = file.name.split(".");
    let ext = "."+filesName[filesName.length-1];
    if(this.GET_DOC_WHITELIST_EXTENSION.indexOf(ext) == -1){
      this.toastr.error("File not supported");
      document.getElementById("checkInFile")['value'] = '';
      this.SELECTED_DOCUMENT.DocumentTypeId = "";
      this.SELECTED_DOCUMENT.fileName = "";
      return;
    }else{
      //bu.angular.pageScope.SELECTED_DOCUMENT.fileName = file.name;
      this.SELECTED_DOCUMENT.mimeType = this.GET_DOC_WHITELIST_EXTTYPE_MAP[ext];
      let filtered: any = this.DOCUMENTTYPE_LIST_Options.filter(function(value: any){
          return value.label === _this.GET_DOC_WHITELIST_EXTTYPE_MAP[ext];
      });
      if(filtered.length > 0){
        this.SELECTED_DOCUMENT.DocumentTypeId = filtered[0].value;
      }
    }
  }
  
  documentUpload(){
		var selectedClientList = [], selectedTagList = [];

		// for (var i = 0; i < asInputs.length; i++) {
		// 	selectdObj = $(asInputs[i]).data('sol-item');

		// 	selectedClientList.push(selectdObj.value);
    // }
		selectedTagList = this.UPLOAD_DOC['selectedTagsList'];

		if(this.SELECTED_FOLDER_FOLDERID == undefined){
			this.toastr.error('Select a parent folder');
			return;
		}
		var selectedFolder = JSON.parse(JSON.stringify(this.SELECTED_FOLDER_FOLDERID));
		var clients = selectedClientList.join();
		if(selectedTagList == null){
			selectedTagList = [];
		}
		var tags = selectedTagList.join();
		//var documentTypes = selectedDocumentList.join();

		var fileInput = document.getElementById('file');
		var file = fileInput['files'][0];
		if(!file){
			this.toastr.error("Select a file");
			return;
		}
		
		var filesName = file.name.split(".");
		var ext = "." + filesName[filesName.length-1].toLowerCase();
		if(this.GET_DOC_WHITELIST_EXTENSION.indexOf(ext) == -1){
			this.toastr.error("File not supported");
			document.getElementById("file")['value'] = '';
			return;
    }
    
    //AE-7120 To prevent unsupported special characters in the file name that 
    //prevent file download. 
    // var pattern = "[:\\\\\\\\/*?|<>]"; 
    // if(filesName[0].match(pattern)){
    // 	$scope.toastr.error("Unsupported special characters in the file name");
    // 	document.getElementById("file").value = '';
    // 	return; 
    // }
    
    var regex = new RegExp("[<>()$#@!~%?+=;*{}\\\\^|:\\\\/]");
    if (regex.test(filesName[0])) {
      
      this.toastr.error("Special characters not allowed in the  file name");
      document.getElementById("file")['value'] = '';
      return; 
    }


		if(!this.UPLOAD_DOC['name'] || this.UPLOAD_DOC['name'].trim()==""){
			this.UPLOAD_DOC['name'] = file.name;
		}

		var formData = new FormData();
		//formData.append('files', file);
		//formData.append('files', file,file.name);
		var filename = file.name;
		var actualFileName =  filename.substring(0, filename.lastIndexOf('.')) || filename;
		var fileNameUpdated = actualFileName + new Date().getTime()+ext;
		formData.append('files', file,window.btoa(unescape(encodeURIComponent(fileNameUpdated))));
		//formData.append('files', file,window.btoa(unescape(encodeURIComponent(file.name))));
		var request = {};
		request["departmentClient"] = clients;
		request["tag"] = tags;
		//request["docType"] = documentTypes;
		request["folderId"] = selectedFolder;
		
		request["fileName"] = this.UPLOAD_DOC['name'];
    
    
    var regex = new RegExp("[<>()$#@!~%?+=;*{}\\\\^|:\\\\/]");
    if (regex.test(this.UPLOAD_DOC['title'])) {
     
      this.toastr.error("Special characters not allowed in the Title"); 
      return; 
    }
    
    
    if (regex.test(this.UPLOAD_DOC['comment'])) {
     
      this.toastr.error("Special characters not allowed in the Comments");
      return; 
    }
    this.apiService.loaderShow('loader', ' Loading...');
    request["title"] = this.UPLOAD_DOC['title'];
		request["comment"] = this.UPLOAD_DOC['comment'];
		request["author"] = this.UPLOAD_DOC['author'];
		//request["mimeType"] = $scope.UPLOAD_DOC.mimeType;
		request["docType"] = this.UPLOAD_DOC['docType'];
		
		formData.append('docUploadRequest', JSON.stringify(request));
		//formData.append("departmentList", clients);
		//formData.append("tagsList", tags);
    //formData.append("docTypeList", tags);
    this.searchedDataDT = "";
		this.searchedDataScope = "1"; 
		this.callUpload(formData);
		// vu.filters.hideFilterPopup();
		// //clear Filtered data from scope
		// vu.filter_Doc_List_output = [];
  }

  callUpload(requestData: any){
    const _this = this;
    
    var l_app_name = "", l_app_id = "", l_contxt_path = "";
    if (sessionStorage.hasOwnProperty("ep-proj-active") == true) {
      var activeProjData = JSON.parse(sessionStorage
        .getItem("ep-proj-active"));
        l_app_name = activeProjData.name;
        l_app_id = activeProjData.applicationId;
        l_contxt_path = activeProjData.contextPath;
      }
      
      $.ajax({
        type : 'POST',
        url : this.apiService.serviceURL + '/uploadController',
        enctype : 'multipart/form-data',
        processData : false, //prevent jQuery from automatically transforming the data into a query string
        contentType : false,
        cache : false,
        data : requestData,
        headers : {
          'XSRF-TOKEN' : this.getCookieValue("XSRF-TOKEN"),
          'X-XSRF-TOKEN' : this.getCookieValue("X-XSRF-TOKEN"),
          'ep-sessionid' : this.getCookieValue("X-XSRF-TOKEN"),
          'ep-username' : sessionStorage.getItem("ep-username"),
          'ep-author' : sessionStorage.getItem("ep-author"),
          'ep-client' : 'eportal-web-ui-service',
          'accessedTimezone' : new Date() + '',
          'ep-accountname' : sessionStorage.getItem("ep-accountname"),
          'ep-accountid' : sessionStorage.getItem("ep-acct-id"),
          'ep-launched-appName' : l_app_name,
          'ep-appname' : l_contxt_path,
          'ep-appid' : l_app_id,
          'ep-userid' : sessionStorage.getItem("ep-userid"),
          'ep-folderid' : this.SELECTED_FOLDER_FOLDERID || ""
        },
        success : function(data: any) {
          _this.apiService.loaderHide('loader');
          if(data.error){
            _this.toastr.error(data.error);
          }else{
            _this.toastr.success('File Uploaded Successfully');
          }
          // Clear selected val
          $("#document-upload-dlg").modal("hide");
          setTimeout(function(){ 
            _this.getDocuments();
            // After creating, removed applied filter.
            // vu.filterAttrData =[];
            // scope.$digest();
            // if($('.filter-highlight ').length > 0 ){
            // 	$('.filter-highlight ').removeClass('filter-highlight');
            // }
          }, 500);
          
        },
        error : function(data: any) {
          _this.apiService.loaderHide('loader');
          _this.toastr.error('File Upload Failed');
          $("#document-upload-dlg").modal("hide");
          _this.searchedDataDT = "";
          _this.searchedDataScope = "1"; 
          _this.getDocuments();
          //vu.filters.hideFilterPopup();
        }
      });
  }

  checkInDoc(){
    const _this = this;
    let fileInput: any = document.getElementById('checkInFile');
    var file = fileInput.files[0];
    if(!file){
      this.toastr.error("Select a file");
      return;
    }
    var filesName = file.name.split(".");
    var ext = "."+filesName[filesName.length-1];
    if(this.GET_DOC_WHITELIST_EXTENSION.indexOf(ext) == -1){
      this.toastr.error("File not supported");
      document.getElementById("checkInFile")['value'] = '';
      return;
    }


      //AE-7120 To prevent unsupported special characters in the file name that 
    //prevent file download. 
    //var pattern = "[:\\\\\\\\/*?|<>]"; 
    var regex = new RegExp("[<>()$#@!~%?+=;*{}\\\\^|:\\\\/]");
    //if(filesName[0].match(pattern)){
    if(regex.test(filesName[0])){
      this.toastr.error("Unsupported special characters in the file name");
      document.getElementById("checkInFile")['value'] = '';
      return; 
    }
    
    var formData = new FormData();
    var filename = file.name;
    var actualFileName =  filename.substring(0, filename.lastIndexOf('.')) || filename;
    var fileNameUpdated = actualFileName + new Date().getTime()+ext;
    formData.append('files', file,window.btoa(unescape(encodeURIComponent(fileNameUpdated))));
    
    if(!this.SELECTED_DOCUMENT.fileName || this.SELECTED_DOCUMENT.fileName.trim()==""){
      this.SELECTED_DOCUMENT.fileName = file.name;
    }
    this.SELECTED_DOCUMENT.Tags = this.SELECTED_DOCUMENT.Tags.join();
    this.SELECTED_DOCUMENT.Departments = this.SELECTED_DOCUMENT.Departments.join();
    if(Array.isArray(this.SELECTED_DOCUMENT.DocumentType)){
      this.SELECTED_DOCUMENT.DocumentType = this.SELECTED_DOCUMENT.DocumentType.join();
    }
    
    this.SELECTED_DOCUMENT.name = this.SELECTED_DOCUMENT.Parent;
    this.SELECTED_DOCUMENT.GUID = this.SELECTED_DOCUMENT.DocumentName;
    formData.append('docCheckInRequest', JSON.stringify(this.SELECTED_DOCUMENT));
    this.apiService.loaderShow('loader', ' Loading...');
    var l_app_name = "", l_app_id = "", l_contxt_path = "";
    if (sessionStorage.hasOwnProperty("ep-proj-active") == true) {
      var activeProjData = JSON.parse(sessionStorage.getItem("ep-proj-active"));
      l_app_name = activeProjData.name;
      l_app_id = activeProjData.applicationId;
      l_contxt_path = activeProjData.contextPath;
    }

    $.ajax({
      type : 'POST',
      url : this.apiService.serviceURL + '/checkInDocument',
      enctype : 'multipart/form-data',
      processData : false, //prevent jQuery from automatically transforming the data into a query string
      contentType : false,
      cache : false,
      data : formData,
      headers : {
        'XSRF-TOKEN' : this.getCookieValue("XSRF-TOKEN"),
        'X-XSRF-TOKEN' : this.getCookieValue("X-XSRF-TOKEN"),
        'ep-sessionid' : this.getCookieValue("X-XSRF-TOKEN"),
        'ep-username' : sessionStorage.getItem("ep-username"),
        'ep-author' : sessionStorage.getItem("ep-author"),
        'ep-client' : 'eportal-web-ui-service',
        'accessedTimezone' : new Date() + '',
        'ep-accountname' : sessionStorage.getItem("ep-accountname"),
        'ep-accountid' : sessionStorage.getItem("ep-acct-id"),
        'ep-launched-appName' : l_app_name,
        'ep-appname' : l_contxt_path,
        'ep-appid' : l_app_id,
        'ep-userid' : sessionStorage.getItem("ep-userid"),
        'ep-folderid' : this.SELECTED_FOLDER_FOLDERID || ""
      },
      success : function(data: any) {
        _this.apiService.loaderHide('loader');
        if(data.error){
          _this.toastr.error(data.error);
        }else{
          _this.toastr.success('Checked In succcessfully');
        }
        $("#CheckInModal").modal("hide");
        setTimeout(() => {
          _this.getDocuments();
        }, 500);
        
      },
      error : function(data: any) {
        _this.apiService.loaderHide('loader');
        _this.toastr.error('Check In Failed');
        $("#CheckInModal").modal("hide");
        _this.getDocuments();
      }
    });
  }

  getDocuments(){
    if(this.GET_DOCUMENTLIST_BYTAGORTYPE && this.GET_DOCUMENTLIST_BYTAGORTYPE['criteria']){
			this.getDocs(this.GET_DOCUMENTLIST_BYTAGORTYPE['criteria'], this.GET_DOCUMENTLIST_BYTAGORTYPE['value']);
		}else{
			if(this.SELECTED_FOLDER && this.SELECTED_FOLDER_FOLDERID){
				this.getSelectedFolderDetails(this.SELECTED_FOLDER_FOLDERID);
			}
		}
  }

  getDocs(type: any, value: any){
		this.apiService.loaderShow('loader', ' Loading...');
		this.DOCUMENT_LIST_output = [];
		this.GET_DOCUMENTLIST_BYTAGORTYPE = {};
		var obj: any = {};
		obj.criteria = type;
		obj.value = value;
		this.GET_DOCUMENTLIST_BYTAGORTYPE = obj;
		var inputObj = {};
    this.GET_DOCUMENTLIST_BYTAGORTYPE['input'] = JSON.stringify(inputObj);
    this.apiService.invokePlatformApi('/documentList/' + this.GET_DOCUMENTLIST_BYTAGORTYPE['criteria'] + '/' + this.GET_DOCUMENTLIST_BYTAGORTYPE['value'], 'GET').subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        if(res.body){
          this.DOCUMENT_LIST_output = res.body;
        }
        //$scope.loadDocuments($scope.DOCUMENT_LIST_output);
        this.loadDocuments(this.dms.currentFolder, 0, 10); 
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    );
  }
  
  getApiDetails(type: string){
    let apiDetails: any;
    switch (type) {
      case 'VIEW_DOCUMENT':
        apiDetails = {apiPath: 'viewDocument', apiMethod: 'GET'};
        break;
      case 'CHECKOUT_DOCUMENT':
        apiDetails = {apiPath: 'checkOutDocument', apiMethod: 'GET'};
        break;
      default:
        break;
    }
    return apiDetails;
  }

  clickDataTableFolder(rowData: any){
    this.SELECTED_FOLDER_FOLDERID = rowData.ChildId;
		this.setTreeSelected(rowData.ChildId);
  }

  downloadFile(rowData: any){
    if(this.isRep != true){
      this.checkOut('VIEW_DOCUMENT', rowData);
    }
  }

  checkOut(type: string, data?: any){
    data = data || this.SELECTED_DOCUMENT;
    var l_app_name = "", l_app_id = "", l_contxt_path = "";
    if(sessionStorage.hasOwnProperty("ep-proj-active") == true){
      var activeProjData = JSON.parse(sessionStorage.getItem("ep-proj-active"));
      l_app_name = activeProjData.name;
      l_app_id = activeProjData.applicationId;
      l_contxt_path = activeProjData.contextPath;
    }
    var checkOutHeaders =  {
      'XSRF-TOKEN' : this.getCookieValue("XSRF-TOKEN"),
      'X-XSRF-TOKEN' : this.getCookieValue("X-XSRF-TOKEN"),
      'ep-sessionid' : this.getCookieValue("X-XSRF-TOKEN"),
      'ep-username' : sessionStorage.getItem("ep-username"),
      'ep-userid' : sessionStorage.getItem("ep-userid"),
      'ep-author' : sessionStorage.getItem("ep-author"),
      'ep-client' : 'eportal-web-ui-service',
      'accessedTimezone' : new Date()+'',
      'ep-accountname' : sessionStorage.getItem("ep-accountname"),
      'ep-accountid' : sessionStorage.getItem("ep-acct-id"),
      'ep-launched-appName': l_app_name,
      'ep-appname': l_contxt_path,
      'ep-appid': l_app_id,
      'ep-userInfo': sessionStorage.getItem("userDetails"),
      'documentName': data.Parent,
      'documentUUID':data.DocumentName,
      'ep-ApplicationName': l_contxt_path,
      'ep-folderid' : data.FolderId || ""
    };
    let apiRequest = {};
    let apiDetails = this.getApiDetails(type);
    this.downloadFormSubmit(apiDetails, checkOutHeaders, apiRequest, type);
  }

  downloadFormSubmit(apiDetails: object, checkOutHeaders: any, apiRequest: object, type: string){
    const _this = this;
    if(document.getElementById("dms_download_file_form")){
      document.getElementById("dms_download_file_form").remove();
    }
    let my_form: any = document.createElement("FORM");
    my_form.id = "dms_download_file_form";
    my_form.style.display = "none !important";
    my_form.method = "POST";
    my_form.setAttribute("accept-charset", "UTF-8");
    my_form.enctype = "application/x-www-form-urlencoded";
    my_form.action = location.origin + "/dmsDownloadFile";
  
    //var apiPath = apiDetails.apiPath.split("/")[3];
    var apiPath = apiDetails['apiPath'];
  
    my_form.appendChild(this.createElement("hidden", "API", apiPath));
    my_form.appendChild(this.createElement("hidden", "METHOD", apiDetails['apiMethod']));
    my_form.appendChild(this.createElement("hidden", "HEADER", JSON.stringify(checkOutHeaders)));
    my_form.appendChild(this.createElement("hidden", "REQUEST", typeof(apiRequest) == "object" ? JSON.stringify(apiRequest) : apiRequest));
  
    document.body.appendChild(my_form);
    my_form.submit();
    this.isRep = true;
    setTimeout(() => {
      if(type != "VIEW_DOCUMENT") this.getDocuments();
      this.isRep = false;
    }, 1000);
  }

  clearFiles(fileInput: any){
    this.CLEARFILES = true;
    fileInput.value = '';
    this.CLEARFILES = false;
  }

  createElement(type: string, name: string, value: string){
    let domObj: any = document.createElement("INPUT");
    domObj.type = type; domObj.name = name; domObj.value = value;
    return domObj;
  }

  callDocumentEdit(rowData: any){
    this.ROW_SELECTED = JSON.parse(JSON.stringify(rowData));
    this.SELECTED_DOC = rowData;
    this.SELECTED_DOC.name = rowData.Parent;
    var tagsData = rowData.Tags;
    tagsData = tagsData[0] || "[]";
    var tags = [];
    if(tagsData){
      if(tagsData.startsWith("[") && tagsData.endsWith("]")){
        try {
          tags = JSON.parse(tagsData)
        } catch (e) {}
      }else if(tagsData.includes(",")){
        try{
          tags = tagsData.split(",").filter(function(obj){return (obj && obj.trim().length > 0)});
        }catch (e) {}
      }else if(tagsData.length > 0){
        tags.push(tagsData);
      }
    }
    var tagsArray = [];
    this.SELECTED_DOC.selectedTagsList = [];
    //ESD 1989 need to check if the tags length is greater than or equal to zero (if no Tags were selected) tw 11-2-2018
    //if(tags.length > 0){
    for(var i=0; i < this.TAG_LIST_Options.length;i++){
      var obj = JSON.parse(JSON.stringify(this.TAG_LIST_Options[i]));
      if(tags.indexOf(this.TAG_LIST_Options[i]['value']) != -1){
        this.SELECTED_DOC.selectedTagsList.push(obj.value);
      }
      tagsArray.push(obj);
    }
    //} 

    //deleted tag pushed to tagArray to show in dropdown 
    var alltag =[];
    tagsArray.forEach(function(data){
      alltag.push(data.label);
    });
    var deletedtag = tags.filter(function(data){
      return alltag.indexOf(data) == -1;
    });

    if(deletedtag.length != 0){
      for(var i =0; i< deletedtag.length; i++){
        var obj: any = {};
        var labelname = deletedtag[i];
        if(labelname != undefined && labelname != ""){
          obj.type = "option";
          obj.label = labelname;
          obj.value = labelname;
          obj.selected = true;
          tagsArray.push(obj);
        }
      }
    }
    try{
      tagsArray = tagsArray.sort(this.dynamicSort("value"));
    }catch(e){}
    this.selectTagOptions = tagsArray;
     
     //$scope.SELECTED_DOC.ALSDocumentType = rowData.ALSDocumentType.join();
     //$scope.SELECTED_DOC.Departments = rowData.Departments.join();
     if(typeof rowData.Departments == "object"){
       this.SELECTED_DOC.Departments = rowData.Departments.join();
     }else{
       this.SELECTED_DOC.Departments = rowData.Departments;
     }
     if(Array.isArray(this.SELECTED_DOCUMENT.DocumentType)){
        this.SELECTED_DOCUMENT.DocumentType = this.SELECTED_DOCUMENT.DocumentType.join();
    }
    $('#edit-properties-dlg').modal('show');
  }
  
  updateDocument(){
    const _this = this;
    if(!this.SELECTED_DOC.fileName || this.SELECTED_DOC.fileName.trim()==""){
      this.SELECTED_DOC.fileName = this.ROW_SELECTED.fileName;
    }
    let selectedTagList = [];
    selectedTagList = JSON.parse(JSON.stringify(this.SELECTED_DOC['selectedTagsList']));

    if(this.SELECTED_DOC.Comments != undefined && this.SELECTED_DOC.Comments.length > 0){
      var regex = new RegExp("[<>()$#@!~%?+=;*{}\\\\^|:\\\\/]");	
      if (regex.test(this.SELECTED_DOC.Comments)) {
      
        this.toastr.error("Special characters not allowed in the Comments");
        return; 
      }
    }
    
    if(this.SELECTED_DOC.title != undefined && this.SELECTED_DOC.title.length > 0){
      var regex = new RegExp("[<>()$#@!~%?+=;*{}\\\\^|:\\\\/]"); 
      if (regex.test(this.SELECTED_DOC.title)) {
       
        this.toastr.error("Special characters not allowed in the Title");
        return; 
      }
    }
    
    this.apiService.loaderShow('loader', ' Loading...');
    //ESD1986 need to use the join to create the common delimited string for Tags or an empty string tw 11-2-2018
    this.SELECTED_DOC.Tags = selectedTagList.join();
    this.SELECTED_DOC.name = this.SELECTED_DOC.fileName;
    this.apiService.invokePlatformApi('/udpateDocument', 'POST', JSON.parse(JSON.stringify(this.SELECTED_DOC)), this.getAdditionalHeaders()).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        if((res.body || {})['STATUS'] == true){
          this.toastr.success('Updated successfully');
          setTimeout(function(){ 
            _this.getDocuments();
          }, 200);
          $('#edit-properties-dlg').modal('hide');
        }else{
          this.toastr.error("Update Failed");
        }
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  invokeNameColAction(params: any){
    this.selectedGridAction = params.type;
    this.invokeActions(params.rowData);
  }

  invokeActions(rowData: any){
    let actionType: string = this.selectedGridAction || '';
    this.SELECTED_DOCUMENT = JSON.parse(JSON.stringify(rowData));
    switch (actionType) {
      case 'download-file':
        this.downloadFile(rowData);
        break;
      case 'select-folder':
        this.clickDataTableFolder(rowData);
        break;
      case 'approve':
        $('#ApproveModal').modal('show');
        break;
      case 'checkin':
        this.SELECTED_DOCUMENT.author = JSON.parse(sessionStorage.getItem("userDetails") || '{}')['name'] || '';
        var fileInput = document.getElementById('checkInFile');
        this.clearFiles(fileInput);
        $("#checkin_doc_name").text("Choose file");
        if(this.GET_DOC_WHITELIST_EXTENSION){
          fileInput.setAttribute("accept", this.GET_DOC_WHITELIST_EXTENSION.join());
        }
        $('#CheckInModal').modal('show');
        break;
      case 'checkout':
        $('#CheckOutModal').modal('show');
        break;
      case 'cancel-checkout':
        $('#CancelCheckOutModal').modal('show');
        break;
      case 'reject':
        $("#RejectModal").modal("show");
        break;
      case 'remove':
        $("#RemoveModal").modal("show");
        break;
      case 'restore':
        alert('restore clicked');
        break;
      case 'edit-properties':
        this.callDocumentEdit(rowData);
        break;
      case 'view-history':
        this.getDocHistory(rowData);
        break;
      default:
        break;
    }
    event.target['value'] = '';
    this.selectedGridAction = '';
  }

  invokeSearchOverGrid(){
    //var regex = new RegExp("[<>()$#@!~%?+=;]+$");
    var regex = new RegExp("[<>()$#@!~%?+=;*{}\\\\^|:\\\\/]");
    var key = this.searchedDataDT;
    
    if (regex.test(key) && key != "") {
      
      this.toastr.error('Special characters not allowed in the search term"');
      return; 
    }
    
    var l = this.searchedDataDT.length; 
    if(l == 1 || l == 2){
      this.toastr.error('Search Term must be at least three characters or greater');
      return;
    }
    
    if(l == 0 && Number(this.searchedDataScope) == 0){
      this.toastr.error('Search Term must be at least three characters or greater, and is a required field with All Folders');
      return;
    }
    
    //scope.searchOption = searchOption; 
    //$scope.getSelectedFolderDetails(scope.SELECTED_FOLDER_FOLDERID); 
    this.totalRecordObject = {};
    this.loadDocuments(this.dms.currentFolder, 0, 10); 
    //scope.searchedDataDT = ""; 
    //scope.searchOption = ""; 
  }

  getDocHistory(rowData: any){
    this.apiService.loaderShow('loader', ' Loading...');
    this.VIEW_DOC_HISTORY_output = [];
    const name = encodeURIComponent(rowData.Parent);
    const id = encodeURIComponent(rowData.DocumentName);
    const folderId = encodeURIComponent(rowData.FolderId);
    this.apiService.invokePlatformApi('/viewHistory/' + name + '/' + id + '/' + folderId, 'GET', null, this.getAdditionalHeaders()).subscribe(
      (res: any) => {
        $("#view-history-dlg").modal("show");
        if((res.body).length>0 && res.body[0] != ""){
          this.VIEW_DOC_HISTORY_output = res.body;
        }
        setTimeout(() => this.apiService.loaderHide('loader'), 100);
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  submitApprove(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.SELECTED_DOCUMENT.Tags = this.SELECTED_DOCUMENT.Tags.join();
    this.SELECTED_DOCUMENT.Departments = this.SELECTED_DOCUMENT.Departments.join();
    if(Array.isArray(this.SELECTED_DOCUMENT.DocumentType)){
      this.SELECTED_DOCUMENT.DocumentType = this.SELECTED_DOCUMENT.DocumentType.join();
    }
    this.SELECTED_DOCUMENT.name = this.SELECTED_DOCUMENT.Parent;
    const reqObj = JSON.stringify(this.SELECTED_DOCUMENT);
    this.apiService.invokePlatformApi('/approveDocument', 'POST', reqObj, this.getAdditionalHeaders()).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        if((res.body || {}).STATUS == true){
          this.toastr.success('File Approved');
          $('#ApproveModal').modal('hide');
        }
        else{
          this.toastr.error('File Approve Failed');
        }
        setTimeout(() => this.getDocuments(), 200);
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  cancelCheckOut(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.SELECTED_DOCUMENT.Tags = this.SELECTED_DOCUMENT.Tags.join();
    this.SELECTED_DOCUMENT.Departments = this.SELECTED_DOCUMENT.Departments.join();
    this.SELECTED_DOCUMENT.name = this.SELECTED_DOCUMENT.Parent;
    if(Array.isArray(this.SELECTED_DOCUMENT.DocumentType)){
      this.SELECTED_DOCUMENT.DocumentType = this.SELECTED_DOCUMENT.DocumentType.join();
    }

    let reqObj = JSON.stringify(this.SELECTED_DOCUMENT);
    this.apiService.invokePlatformApi('/cancelCheckout', 'POST', reqObj, this.getAdditionalHeaders()).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        if((res.body || {}).STATUS == true){
          this.toastr.success('Cancel CheckOut Success');
          $('#CancelCheckOutModal').modal('hide');
        }
        else{
          this.toastr.error('Cancel CheckOut Failed');
        }
        setTimeout(() => this.getDocuments(), 200);
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  submitReject(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.SELECTED_DOCUMENT.Tags = this.SELECTED_DOCUMENT.Tags.join();
    this.SELECTED_DOCUMENT.Departments = this.SELECTED_DOCUMENT.Departments.join();
    if(Array.isArray(this.SELECTED_DOCUMENT.DocumentType)){
      this.SELECTED_DOCUMENT.DocumentType = this.SELECTED_DOCUMENT.DocumentType.join();
    }
    this.SELECTED_DOCUMENT.name = this.SELECTED_DOCUMENT.Parent;

    let reqObj = JSON.stringify(this.SELECTED_DOCUMENT);
    this.apiService.invokePlatformApi('/rejectDocument', 'POST', reqObj, this.getAdditionalHeaders()).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        if((res.body || {}).STATUS == true){
          this.toastr.success('File Rejected');
          $('#RejectModal').modal('hide');
        }
        else{
          this.toastr.error('File Reject Failed');
        }
        setTimeout(() => this.getDocuments(), 200);
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  submitComfirmRemove(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.SELECTED_DOCUMENT.Tags = this.SELECTED_DOCUMENT.Tags.join();
    this.SELECTED_DOCUMENT.Departments = this.SELECTED_DOCUMENT.Departments.join();
    if(Array.isArray(this.SELECTED_DOCUMENT.DocumentType)){
      this.SELECTED_DOCUMENT.DocumentType = this.SELECTED_DOCUMENT.DocumentType.join();
    }
    this.SELECTED_DOCUMENT.name = this.SELECTED_DOCUMENT.Parent;
    if(Array.isArray(this.SELECTED_DOCUMENT.DocumentType)){
      this.SELECTED_DOCUMENT.DocumentType = this.SELECTED_DOCUMENT.DocumentType.join();
    }

    let reqObj = JSON.stringify(this.SELECTED_DOCUMENT);
    this.apiService.invokePlatformApi('/removeDocument', 'POST', reqObj, this.getAdditionalHeaders()).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        if((res.body || {}).STATUS == true){
          this.toastr.success('File Removed');
          $('#RemoveModal').modal('hide');
        }
        else{
          this.toastr.error('File Remove Failed');
        }
        setTimeout(() => this.getDocuments(), 200);
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  showInLanding(result: any){
    if(result['_source']['ObjectType'] != undefined && result['_source']['ObjectType'] == 'vFolder'){
      this.setTreeSelected(result['_source']["ChildId"]);
      $('#advanced-search-dlg').modal('hide');
    }else if(result['_source']['ObjectType'] != undefined && result['_source']['ObjectType'] == 'Documents'){
      //$scope.setTreeSelected(result['_source']["FolderId"]);
      var filePath = result['_source']["filePath"];
      var paths = filePath.split("/");
      var docData = paths[paths.length-1];
      var guid = docData.split(".")[0];
      var data = result['_source'];
      data.DocumentName = guid;
      this.checkOut('VIEW_DOCUMENT', data);
    }
  }

  showDeleteFolderDlg(){
    this.DELETE_FOLDER = {};
    if(!this.SELECTED_FOLDER || this.SELECTED_FOLDER == null){
      this.toastr.error('Select a parent folder');
      return;
    }
    if(this.SELECTED_FOLDER.original.label == 'Documents'){
      this.toastr.error('Documents folder can not be deleted');
      return;
    }
    this.DELETE_FOLDER.folderName = this.SELECTED_FOLDER.original.label;
    this.DELETE_FOLDER.folderId = this.SELECTED_FOLDER.original.value;
    this.DELETE_FOLDER.folderLeft = this.SELECTED_FOLDER.original.lft;  
    this.DELETE_FOLDER.folderRight = this.SELECTED_FOLDER.original.rgt;   
    $('#delete-folder-dlg').modal('show');
  }

  deleteFolderConfirmed(){
    this.apiService.loaderShow('loader', ' Loading...');
  
    let reqObj = this.DELETE_FOLDER;
    reqObj.input = JSON.stringify({});
    this.apiService.invokePlatformApi('/virtualDirectories/' + reqObj.folderId + '/' + reqObj.folderName + '/' + reqObj.folderLeft + '/' + reqObj.folderRight, 'POST', reqObj, this.getAdditionalHeaders()).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        let responseBody = res.body || {};
        
        if(responseBody['Sucessfully']){
          this.toastr.success('Folder Deleted Successfully');
        }else if (responseBody['ERROR']){
          this.toastr.error('Folder Deletion Failed: ' + responseBody['ERROR']);
        }else{
          this.toastr.error('Folder Deletion Failed');
        }
        this.updateFolderPrivilegeToSession();
        $('#delete-folder-dlg').modal('hide');
        setTimeout(() => {
          this.loadLibrary();
          this.searchedDataDT = "";
          this.searchedDataScope="1"; 
        }, 300);
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  getFomattedDateValue(value: any){
    try {
      if(typeof value == 'string') value = parseInt(value);
    } catch (error) { }
    const data: any = value;
    return data != undefined && data != null ? this.escapeHtml(moment(data).format(this.defaultDateTimeFormat)) : 'N/A';
  }

  escapeHtml(source: any) {
    if (typeof(source) == 'string') {
      source = source
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
    }
    return source;
  }

  dynamicSort(property: any) {
    var sortOrder = 1;
    
    if(property[0] === '-') {
      sortOrder = -1;
      property = property.substr(1);
    }
    
    return function (a: any,b: any) {
      if(sortOrder == -1){
        return b[property].localeCompare(a[property]);
      }else{
        return a[property].localeCompare(b[property]);
      }        
    }
  }

  getCookieValue(key: string): string {
    let b = document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
  }

  validateShowDocumentTypeBreadCrumb(){
    return this.GET_DOCUMENTLIST_BYTAGORTYPE && this.GET_DOCUMENTLIST_BYTAGORTYPE['criteria'];
  }

  validateShowVirDirBreadCrumb(){
    return this.GET_DOCUMENTLIST_BYTAGORTYPE && Object.keys(this.GET_DOCUMENTLIST_BYTAGORTYPE).length === 0;
  }

  initGridDetails(){
    this.context = { componentParent: this };
    this.columnDefs = [
        {headerName: 'Name', field: 'childName', filter: "agTextColumnFilter", filterParams: { clearButton: true, applyButton: true } , sortable: true },
        {headerName: 'Last Updated', field: 'LastUpdated', filter: "agDateColumnFilter", filterParams: { clearButton: true, applyButton: true, suppressAndOrCondition: true }, sortable: true },
        {headerName: 'Tag', field: 'Tags', filter: "agTextColumnFilter", filterParams: { clearButton: true, applyButton: true }, sortable: true },
        {headerName: 'Description', field: 'Comments', filter: "agTextColumnFilter", filterParams: { clearButton: true, applyButton: true }, sortable: true },
        {headerName: 'Status', field: 'DocStatus', filter: "agTextColumnFilter", filterParams: { clearButton: true, applyButton: true }, sortable: true },
        {headerName: 'Action', field: 'Actions', sortable: false }
    ];
    this.viewHistoryColumnDefs = [
      {headerName: 'Name', field: 'fileName', sortable: true },
      {headerName: 'Description', field: 'Comments', sortable: true },
      {headerName: 'Tag', field: 'Tags', sortable: true },
      {headerName: 'Last Updated', field: 'eventOccurred', sortable: true },
      {headerName: 'Updated By', field: 'LastUpdatedBy', sortable: true },
      {headerName: 'Event', field: 'eventName', sortable: true },
      {headerName: 'Title', field: 'title', sortable: true },
      {headerName: 'Version', field: 'version', sortable: true }
    ];
  }

  setDefaultTimeFormat(){
		let format = (JSON.parse(sessionStorage.generalConfiguration || '{}')[this.apiService.accountName] || {}).defaultDateTimeFormat || '';
		if(format == ''){
			format = 'MM/DD/YYYY HH:mm:ss';
    }
    this.defaultDateTimeFormat = this.getMomentDateFormat(format);
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

  getMomentDateFormat(format: string){
		return this.updateFormat(this.dateFormat.moment, format, '%')
  }

  ngOnInit() {
    this.initGrid();
    this.initGridDetails();
    this.setDefaultTimeFormat();
    //AE-7120 attempt to get the folder privileges if not avaiable 
    if(sessionStorage.getItem('FOLDER_PRIVILEGE') == null || sessionStorage.getItem("FOLDER_PRIVILEGE") == "undefined" || sessionStorage.getItem("FOLDER_PRIVILEGE") == undefined){
      this.updateFolderPrivilegeToSession();
    }
    
    //AE-7120 Document Download Dialog -- Start-- 
    //TODO:
    //AE-7120 Document Download Dialog -- End -- 

    this.initDocumentLandingDetails();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

}
