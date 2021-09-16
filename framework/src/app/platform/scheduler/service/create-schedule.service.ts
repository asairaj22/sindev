import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@platform/util/api.service';

@Injectable({
  providedIn: 'root'
})
export class CreateScheduleService {

  constructor(private httpClient: HttpClient, private apiService: ApiService) { }

  getActiveWokflowList(): Observable<any> {
    return this.apiService.invokePlatformApi('/getActiveWorkflowList', 'GET');
  }

  createSchedule(schedulerReq: any) : Observable<any> {
    return this.apiService.invokePlatformApi('/schedulejob/create', 'POST', schedulerReq);
  }

  updateSchedule(schedulerReq: any) : Observable<any> {
    return this.apiService.invokePlatformApi('/schedulejob/update', 'PUT', schedulerReq);
  }

}
