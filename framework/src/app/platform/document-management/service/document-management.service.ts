import { Injectable } from '@angular/core';
import { ApiService } from '@platform/util/api.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentManagementService {

  constructor( private apiService: ApiService ) { }

  getVirtualDirectories(callFor: string, successCallback: any, errorCallback: any){
    this.apiService.invokePlatformServiceApi(this.getApiURL(callFor) + '/virtualDirectories', 'GET').subscribe(
      (res: any) => successCallback(res),
      (err: any) => errorCallback(err)
    );
  }

  getTagList(callFor: string, successCallback: any, errorCallback: any){
    this.apiService.invokePlatformServiceApi(this.getApiURL(callFor) + '/loadTag', 'GET').subscribe(
      (res: any) => successCallback(res),
      (err: any) => errorCallback(err)
    );
  }

  getDocumentWhiteList(callFor: string, successCallback: any, errorCallback: any){
    this.apiService.invokePlatformServiceApi(this.getApiURL(callFor) + '/getMimeType', 'GET').subscribe(
      (res: any) => successCallback(res),
      (err: any) => errorCallback(err)
    );
  }

  getFolderConent(pathParamObj: any, requestObject: any, requestHeaders: any, successCallback: any, errorCallback: any){
    this.apiService.invokePlatformServiceApi('/dmsLanding/virtualDirectories/folderContent/' + pathParamObj.folderId + '/' + pathParamObj.from + '/' + pathParamObj.size, 'POST', requestObject, requestHeaders).subscribe(
      (res: any) => successCallback(res),
      (err: any) => errorCallback(err)
    );
  }

  getDocumentTypeList(callFor: string, successCallback: any, errorCallback: any){
    this.apiService.invokePlatformServiceApi(this.getApiURL(callFor) + '/loadDocumentType', 'GET').subscribe(
      (res: any) => successCallback(res),
      (err: any) => errorCallback(err)
    );
  }

  getAdvanceSearchDocResults(requestObject: any, requestHeaders: any, successCallback: any, errorCallback: any){
    let callFor: string = '';
    if(requestObject.pageMode == 'search'){
      callFor = 'LANDING';
    }else if(requestObject.pageMode == 'deleted'){
      callFor = 'DELETED-ITEMS';
    }
    this.apiService.invokePlatformServiceApi(this.getApiURL(callFor) + '/advanceSearch', 'POST', requestObject, requestHeaders).subscribe(
      (res: any) => successCallback(res),
      (err: any) => errorCallback(err)
    );
  }

  hasFolderActionPrivilege(folderId: string, actionValue: string){
    if(sessionStorage.getItem("isAdminUser")=="true"){
      return true;
    }else if(sessionStorage.getItem("FOLDER_PRIVILEGE") && sessionStorage.getItem("FOLDER_PRIVILEGE") != null){
      var privilegeJson = JSON.parse(sessionStorage.getItem("FOLDER_PRIVILEGE"));
      var currentId = folderId;
      var permissionList = privilegeJson[currentId];
      var permission: string;
      if(actionValue == 'Approve'){
        permission = 'Approve';
      }
      else if(actionValue == 'Cancel Check out'){
        permission = 'Cancel Check Out';
      }
      else if(actionValue == 'CheckOut'){
        permission = 'Check Out';
      }
      else if(actionValue == 'Reject'){
        permission = 'Reject';
      }
      else if(actionValue == 'Remove'){
        permission = 'Remove';
      }
      else if(actionValue == 'Restore'){
        permission = 'Restore';
      }
      else if(actionValue == 'Edit Properties'){
        permission = 'Update';
      }
      else if(actionValue == 'View History'){
        permission = 'View History';
      }
      else if(actionValue == 'CheckIn'){
        permission = 'Check In';
      }
      else if(actionValue == 'View Document') {
        permission = "View Document";
      }
      if(permissionList && permissionList.indexOf(permission) != -1){
        return true;
      }else{
        return false;
      }
    }
  }

  getApiURL(callFor: string) {
    switch (callFor) {
      case 'LANDING': return '/dmsLanding';
      case 'ADMIN': return '/dmsAdmin';
      case 'DELETED-ITEMS': return '/dmsDelete';
      default: throw "API key not available";
    }
  }
}