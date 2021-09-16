import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { ApiService } from '../../util/api.service';
@Injectable({
  providedIn: 'root'
})
export class ManageTempNotificationService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  getDomains(): Observable<any> {
    const result = this.apiService.invokePlatformApi('/domains', 'GET');
    return result;
  }

  getNodes(): Observable<any> {
    let reqObj = {
      projectName: this.apiService.appName
    }
    return this.apiService.invokePlatformApi('/eportal/api/object/getMetaData', 'POST',reqObj);
  }

  getActiveGridData(): Observable<any> { 
    const result = this.apiService.invokePlatformApi('/dmn/retrieveAll/'+this.apiService.accountName+'_DMN/Active', 'GET');
    return result;
  }

  getDraftGridData(): Observable<any> { 
    const result = this.apiService.invokePlatformApi('/dmn/retrieveAll/'+this.apiService.accountName+'_DMN/Draft', 'GET');
    return result;
  }
}
