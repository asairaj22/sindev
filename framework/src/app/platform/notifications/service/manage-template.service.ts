import { Injectable } from '@angular/core';
import { ApiService } from '@platform/util/api.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ManageTemplateService {

  constructor(private httpClient: HttpClient, private apiService: ApiService) { }

  getTemplates(): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/templates', 'GET');
  }

  saveTemplate(data: any): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/template', 'POST', data);
  }
  getNodes(): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/object/getMetaData', 'POST', {projectName: this.apiService.appName});
  }
  getTemplateById(id): Observable<any>{
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/templates/' + id, 'GET');
  }
}
