import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@platform/util/api.service';

@Injectable({
  providedIn: 'root'
})
export class DomainService {
 
  constructor(private httpClient: HttpClient, private apiService: ApiService) { }
  getDomains(): Observable<any> {
    const result = this.apiService.invokePlatformServiceApi('/notificationAdmin/domains', 'GET');
    return result;
    // return this.httpClient.get('../assets/data/domain.json');
  }

  saveDomain(data: any): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/domain', 'POST', data);
  }

  updateDomain(data: any): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/domain', 'POST', data);
  }
}
