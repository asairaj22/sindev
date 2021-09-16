import { Component, OnInit } from '@angular/core';
import { ApiService } from '@platform/util/api.service';
import { DocumentManagementService } from './../service/document-management.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dms-configuration',
  templateUrl: './dms-configuration.component.html',
  styleUrls: ['./dms-configuration.component.css']
})
export class DmsConfigurationComponent implements OnInit {
  GET_APP_DATA_output: Array<any> = [];
  private DMS_APP_CONFIGURED: object = {};
  private GET_DMSAPPMAPPED_output: Array<any> = [];

  constructor( private apiService: ApiService, private documentManagementService: DocumentManagementService, private toastr: ToastrService ) { }

  getAllApps(){
    this.apiService.loaderShow('loader', ' Loading...');
    let requestObject = {email: sessionStorage.getItem('ep-username'), isDefault: 'N', accountName: this.apiService.accountName};
    this.apiService.invokePlatformServiceApi('/dmsAdmin/getApplicationList/' + requestObject.accountName, 'POST', requestObject).subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        let obj: any = res.body || {};
        if(obj.status == 'hasData'){
          this.GET_APP_DATA_output = obj.applications;
        }else{
          this.GET_APP_DATA_output = [];
        }
        this.getConfiguredApp();
      },
      (err: any) => {
        this.apiService.loaderHide('loader');
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  getConfiguredApp(){
    this.DMS_APP_CONFIGURED = {};
    this.apiService.loaderShow('loader', ' Loading...');
    this.apiService.invokePlatformServiceApi('/dmsAdmin/dmsAppMapped', 'GET').subscribe(
      (res: any) => {
        this.apiService.loaderHide('loader');
        let output = res.body || [];
        
        this.GET_DMSAPPMAPPED_output = [];
        if (output.hasOwnProperty('_embedded')) {
          var outputData = output['_embedded'];
          if(outputData.hasOwnProperty('dmsAppMappings')){
            this.GET_DMSAPPMAPPED_output = outputData['dmsAppMappings'];
            if(this.GET_DMSAPPMAPPED_output.length > 0){
              this.DMS_APP_CONFIGURED = this.GET_DMSAPPMAPPED_output[0];
            }
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

  setConfiguredApp(selectedProj: any){
    if(this.DMS_APP_CONFIGURED['appName'] == selectedProj.contextPath){
      this.DMS_APP_CONFIGURED['appName'] = "";
    }else{
      this.DMS_APP_CONFIGURED['appName'] = selectedProj.contextPath
    }
  }

  saveDmsAppConfigure(){
    if(!this.DMS_APP_CONFIGURED['appName'] || this.DMS_APP_CONFIGURED['appName'].trim() == ""){
      this.toastr.error('No app selected');
      return;
    }else{
      this.DMS_APP_CONFIGURED['accountName'] = this.apiService.accountName;
      let reqObj =  JSON.stringify(this.DMS_APP_CONFIGURED);
      this.apiService.loaderShow('loader', ' Loading...');
      this.apiService.invokePlatformServiceApi('/dmsAdmin/updateDmsAppMapped', 'POST', reqObj).subscribe(
        (res: any) => {
          this.apiService.loaderHide('loader');
          if((res.body || {}).status == 'Success'){
            this.toastr.success('Updated Successfully');
          }else{
            this.toastr.error('Updated Failed');
          }
        },
        (err: any) => {
          this.apiService.loaderHide('loader');
          this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
          
        }
      );
    }
  };

  ngOnInit() {
    this.getAllApps();
  }

}
