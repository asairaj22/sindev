import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { ApiService } from '../../platform/util/api.service';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  public accountName: string;
  public appName: string;
  public isTaskLevel: boolean;
  public taskName: string;
  public userTaskId: string;

  constructor(private http: HttpClient, private apiService :ApiService) {
    this.accountName = this.apiService.accountName;
    this.appName = this.apiService.appName;
    this.isTaskLevel = this.apiService.isTaskLevel;
    this.taskName = this.apiService.taskName;
    this.userTaskId = this.apiService.userTaskId;
  }

  invokeAPI(path: string, method: string, request?: any, requestHeader?: any, appName: string = (this.isTaskLevel ? this.userTaskId : this.appName), cache?: boolean): Observable<HttpResponse<Object>> {
    return this.apiService.invokeApplicationApi(path, method, request,requestHeader, appName, cache);
  }

  invokeDownloadApplicationApi(path: string, method: string, request?: any, requestHeader?: any, appName: string = (this.isTaskLevel ? this.userTaskId : this.appName)){
    this.apiService.invokeDownloadApplicationApi(path, method, request,requestHeader, appName);
  }

}