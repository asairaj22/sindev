import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@platform/util/api.service';

@Injectable({
  providedIn: 'root'
})
export class SchedulerDashboardService {
  constructor(private httpClient: HttpClient, private apiService: ApiService) { }

  getWorklowRunningList(): Observable<any> {
    return this.apiService.invokePlatformApi('/getScheduleList', 'GET');
  }

  getWorkflowHistoryList(schedulerType : string): Observable<any> {
    return this.apiService.invokePlatformApi('/schedulejob/'+schedulerType, 'GET');
  }

  getWorkflowHistoryListWithCondition(request : any): Observable<any> {
    return this.apiService.invokePlatformApi('/getscheduler/searchhistory', 'POST', request);
  }

  stopSchedule(POST_STOP_SCHEDULER : any): Observable<any> {
    return this.apiService.invokePlatformApi('/stop/'+POST_STOP_SCHEDULER.jobId, 'POST', POST_STOP_SCHEDULER);
  }

  restartSchedule(POST_RESTART_SCHEDULER : any): Observable<any> {
    return this.apiService.invokePlatformApi('/restartSchedular', 'POST', POST_RESTART_SCHEDULER);
  }

  deleteSchedule(DELETE_JOB_SCHEDULER : any): Observable<any> {
    return this.apiService.invokePlatformApi('/schedulejob/delete/'+DELETE_JOB_SCHEDULER.jobId, 'DELETE', DELETE_JOB_SCHEDULER);
  }
 
}
