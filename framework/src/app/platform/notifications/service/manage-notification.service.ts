import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '@platform/util/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManageNotificationService {

  constructor(private httpClient: HttpClient, private apiService: ApiService) { }

  /*getSubscriptions(data): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/dmn/retrieveAll/ESDTEST_DMN/Active', 'GET', data);
  }*/
getSubscriptionsDraft(data): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationLanding/retrieveAll/'+this.apiService.accountName+'_DMN/Draft', 'GET', data);
  }


  getSubscriptionsActive(data): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationLanding/retrieveAll/'+this.apiService.accountName+'_DMN/Active', 'GET', data);
  }

  createNewRule(data): Observable<any> {
    // if(action == "edit"){
    //   return this.apiService.invokePlatformServiceApi('/dmn/update/'+data.id+'/'+this.apiService.accountName+'_DMN', 'PUT', data);
    // }else{
      return this.apiService.invokePlatformServiceApi('/notificationLanding/rule/'+this.apiService.accountName+'_DMN', 'POST', data);
    // }
  }

  updateRule(data): Observable<any>{
    return this.apiService.invokePlatformServiceApi('/notificationLanding/update/'+data.id+'/'+this.apiService.accountName+'_DMN', 'PUT', data);
  }
 

  getDraftDataToEdit(data): Observable<any>{
    return this.apiService.invokePlatformServiceApi('/notificationLanding/dmnDissemination/'+data.ruleId, 'GET', data);
  }
  createDmnDissemination(data): Observable<any>{
    return this.apiService.invokePlatformServiceApi('/notificationLanding/dmnDissemination', 'POST', data);
  
  }

  activateRule(data): Observable<any>{
    return this.apiService.invokePlatformServiceApi('/notificationLanding/activation/'+data.id+'/'+data.dmnLabel, 'PUT', data);
  }

  retriveRuleById(data): Observable<any>{
    return this.apiService.invokePlatformServiceApi('/notificationLanding/retrieve/'+this.apiService.accountName+'_DMN'+'/'+data.id+'/'+data.status, 'GET', data);
  }

  deleteRule(data) : Observable <any>{
    return this.apiService.invokePlatformServiceApi('/notificationLanding/delete/'+data.id, 'DELETE', data);
  }
  archiveData(data) : Observable <any>{
    return this.apiService.invokePlatformServiceApi('/notificationLanding/archive/'+data.id+'/'+data.dmnLabel, 'PUT', data);
  }
  getDomains(): Observable<any> {
    // let httpParams: HttpParams = new HttpParams();
    // httpParams = httpParams.append('domainId', domain.id);
    const result = this.apiService.invokePlatformServiceApi('/notificationLanding/domains', 'GET');
    return result;
  }

  getNodes(): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationLanding/object/getMetaData'+this.apiService.accountName+'_DMN/Active', 'POST', {projectName: this.apiService.appName});
  }


}
