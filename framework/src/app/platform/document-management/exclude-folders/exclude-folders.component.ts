import { Component, OnInit } from '@angular/core';
import { ApiService } from '@platform/util/api.service';
import { ToastrService } from 'ngx-toastr';
import { DocumentManagementService } from './../service/document-management.service';
declare var $: any;

@Component({
  selector: 'app-exclude-folders',
  templateUrl: './exclude-folders.component.html',
  styleUrls: ['./exclude-folders.component.css']
})
export class ExcludeFoldersComponent implements OnInit {
  private directories: object[] = [];
  private selectedExcludedFolderMap: object = {};
  private excludedFolderList: object[] = [];
  private existingExcludedFolderList: object[] = [];
  private excludeFolderTree: any;
  treeSearchInput: string = '';
  private dirJsTreeInstance: any;

  constructor( private apiService: ApiService, private toastr: ToastrService, private documentManagementService:  DocumentManagementService ) { }

  getFoldersList(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.directories = [];
    this.documentManagementService.getVirtualDirectories('ADMIN',
      (res: any) => {
        let responseBody = res.body;
        //responseBody = {"_embedded":{"virtualDirectories":[{"accountName":"bonito","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/938"},"self":{"href":"http://localhost:8084/virtualDirectories/938"}},"id":938,"folderName":"Documents","lft":1404,"apptName":"dms","softDeleted":null,"rgt":1411,"parentId":1},{"accountName":"bonito","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/939"},"self":{"href":"http://localhost:8084/virtualDirectories/939"}},"id":939,"folderName":"écrire le premier test de rapporteur","lft":1405,"apptName":"dms","softDeleted":null,"rgt":1410,"parentId":938},{"accountName":"bonito","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/941"},"self":{"href":"http://localhost:8084/virtualDirectories/941"}},"id":941,"folderName":"Traduire l'anglais vers le français avec SDL","lft":1406,"apptName":"dms","softDeleted":null,"rgt":1407,"parentId":939},{"accountName":"bonito","_links":{"virtualDirectory":{"href":"http://localhost:8084/virtualDirectories/940"},"self":{"href":"http://localhost:8084/virtualDirectories/940"}},"id":940,"folderName":"Traduire l'anglais vers le français avec SDL FreeTranslation","lft":1408,"apptName":"dms","softDeleted":null,"rgt":1409,"parentId":939}]},"_links":{"self":{"href":"http://localhost:8084/virtualDirectories/search/findAllByAccountNameAndApptNameOrderByLftAsc?accountName=bonito&apptName=dms"}}};
        
        if (responseBody && responseBody.hasOwnProperty('_embedded')) {
          var virtualDirectoriesData = responseBody['_embedded'];
          if(virtualDirectoriesData.hasOwnProperty('virtualDirectories')){
            var directoryTreeJson = {};
            let directoryArray = virtualDirectoriesData['virtualDirectories'];
            this.directories = directoryArray;
            let mainParent = [];
            var currentParent = [];
            var currentInx = 0;
            for(let i=0; i < directoryArray.length; i++){
              let leftOffset = directoryArray[i].lft;
              let rightOffset = directoryArray[i].rgt;
              if(i == 0){
                //directoryTreeJson['text'] = 'Documents';
                directoryTreeJson['text'] = directoryArray[i]['folderName'];
                directoryTreeJson['value'] = directoryArray[i]['id'];
                directoryTreeJson['children'] = [];
                directoryTreeJson['lft'] = directoryArray[i]['lft'];
                directoryTreeJson['rgt'] = directoryArray[i]['rgt'];
                directoryTreeJson['label'] = directoryArray[i]['folderName'];
                //directoryTreeJson['state'] = {'opened': true,'selected':true}; 
                mainParent = directoryTreeJson['children'];
              }else{
                var subJson = {};
                subJson['text'] = directoryArray[i]['folderName'];
                subJson['value'] = directoryArray[i]['id'];
                subJson['label'] = directoryArray[i]['folderName'];
                subJson['lft'] = directoryArray[i]['lft'];
                subJson['rgt'] = directoryArray[i]['rgt'];
                subJson['children'] = [];
                let leftOffset = directoryArray[i].lft;
                let rightOffset = directoryArray[i].rgt;
                if(i == 1){
                  mainParent.push(subJson);
                }else{
                  let childAdded: boolean = false;
                  for(let j=0; j < mainParent.length; j++){
                    let innerChild = mainParent[j];
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
          this.getExcludedFoldersList();
        }else{
          this.apiService.loaderHide('loader');
        }
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    );
  }

  loopThroughChildren(innerChild: object, subJson: object){
    let children = innerChild['children'];
    let childAdded = false;
    for(let j=0;j<children.length;j++){
      let child = children[j];
      if((child.lft < subJson['lft'])&&(child.rgt > subJson['rgt'])){
        this.loopThroughChildren(child,subJson);
        childAdded = true;
      }
    }
    if(!childAdded){
      innerChild['children'].push(subJson);
    }
  }

  getExcludedFoldersList(){
		this.excludedFolderList = [];
    this.existingExcludedFolderList = [];
    this.apiService.invokePlatformServiceApi('/dmsAdmin/excludedFolders', 'GET').subscribe(
      res => {
        let responseBody = res.body;
        //responseBody = {"_embedded":{"excludedFolders":[{"accountName":"bonito","_links":{"excludedFolder":{"href":"http://localhost:8084/excludedFolders/335"},"self":{"href":"http://localhost:8084/excludedFolders/335"}},"appName":"dms","folderName":"écrire le premier test de rapporteur","folderId":"939"},{"accountName":"bonito","_links":{"excludedFolder":{"href":"http://localhost:8084/excludedFolders/336"},"self":{"href":"http://localhost:8084/excludedFolders/336"}},"appName":"dms","folderName":"Traduire l'anglais vers le français avec SDL","folderId":"941"}]},"_links":{"self":{"href":"http://localhost:8084/excludedFolders/search/findAllByAccountNameAndAppName?accountName=bonito&appName=dms"}}};
        
        this.dirJsTreeInstance.jstree(true).uncheck_all(true);
        if (responseBody.hasOwnProperty('_embedded')) {
          let outputData = responseBody['_embedded'];
          if(outputData.hasOwnProperty('excludedFolders')){
            let excludedFolderList = outputData['excludedFolders'];
            for(let i=0;i<excludedFolderList.length;i++){
              this.setTreeChecked(excludedFolderList[i].folderId);
            }
          }
        }
        this.apiService.loaderHide('loader');
      },
      err => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    );
  }

  populate(directoryTreeJson: object){
    const _this = this;
    this.dirJsTreeInstance =  $( '#jstree2' );
    try {
      this.dirJsTreeInstance.jstree( 'destroy' );
    } catch ( ex ) { }
    const plugins=['types', 'checkbox', 'search'];
    this.excludeFolderTree = this.dirJsTreeInstance.jstree({
      plugins,
      core: {
          data: directoryTreeJson,
          animation: 100,
          themes: { name: 'proton', responsive: true, icons: false }
      },
      check_callback: true,
      themes: {
        'name': 'proton',
        'responsive': true
      },
      checkbox: {
        three_state: false
      },
      types : {
        "default" : {
          "icon" : "fa fa-folder highlight"
        }
      },
      search: {
          show_only_matches: true,
          show_only_matches_children: true,
          search_leaves_only: false
      }
    });
    this.dirJsTreeInstance.on('changed.jstree', function (e: Event, data: any) {
      if(data.action && data.action == "deselect_node"){
        if(_this.selectedExcludedFolderMap[data.node.id]){
          delete _this.selectedExcludedFolderMap[data.node.id];
        }
      }else if(data.action && data.action == "select_node"){
        if(!_this.selectedExcludedFolderMap[data.node.id]){
          _this.selectedExcludedFolderMap[data.node.id] = data.node.original;
        }
      }
    });
    this.dirJsTreeInstance.bind('ready.jstree', function() {
      _this.dirJsTreeInstance.jstree("open_all");          
    });
  }

  setTreeChecked(folderId: any) {
    const _this = this;
    var targetModelObj= this.dirJsTreeInstance.jstree(true)._model.data;
    $.each(targetModelObj,function(key_jsTree: any,tempNode: any){
      var tempTargetMapToCheck=tempNode.original;
      if(tempTargetMapToCheck && tempTargetMapToCheck.value ==  parseInt(folderId)){
        _this.dirJsTreeInstance.jstree(true).select_node(key_jsTree);
        _this.dirJsTreeInstance.jstree(true).check_node(key_jsTree);
      }
    });
  }

  saveExcludedFolder(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.excludedFolderList = [];
		let accountName = this.apiService.accountName;
		let appName = this.apiService.appName;
		for(let keys in this.selectedExcludedFolderMap){
			let obj = this.selectedExcludedFolderMap[keys];
			let newObj: any = {};
			newObj.folderId = ""+obj.value;
			newObj.folderName = obj.text;
			newObj.accountName = accountName;
			newObj.appName = appName;
		  this.excludedFolderList.push(newObj);
		}
		let obj: any = {};
		obj.excludedFolderList = this.excludedFolderList; 
    this.apiService.invokePlatformServiceApi('/dmsAdmin/excludedFolders', 'POST', obj).subscribe(
      res => {
        this.apiService.loaderHide('loader');
        if((res.body || {})['status'] == 'Success'){
          this.toastr.success('Updated Successfully');
        }
        else{
          this.toastr.error('Updated Failed');
        }
      },
      err => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        console.error( err );
      }
    );
  }

  invokeTreeSearch(){
    this.dirJsTreeInstance.jstree('search', this.treeSearchInput);
  }

  ngOnInit() {
    this.getFoldersList();
  }

}
