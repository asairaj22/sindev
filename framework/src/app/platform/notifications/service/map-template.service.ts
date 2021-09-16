import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '@platform/util/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapTemplateService {
  constructor(private httpClient: HttpClient, private apiService: ApiService) { }

  getTemplates(): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/notificationTemplates', 'GET');
  }

  saveMapTemplate(data: any): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/notificationTemplates', 'POST', data);
    // return null;
  }
  getTemplatesByEventId(data: any): Observable<any>{
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/notificationTemplates/'+data.eventId, 'GET');
  } 
}
