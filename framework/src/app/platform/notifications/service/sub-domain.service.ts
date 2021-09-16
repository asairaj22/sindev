import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@platform/util/api.service';

@Injectable({
  providedIn: 'root'
})
export class SubDomainService {

  constructor(private httpClient: HttpClient, private apiService: ApiService) { }

  getSubDomains(): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/subdomains', 'GET');
  }

  getSubdomain(id): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/subdomains/' + id, 'GET');
  }

  getDomain(id): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/subdomain/' + id, 'GET');
  }

  saveSubDomain(data: any): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/subdomain', 'POST', data);
  }

  updateSubDomain(data: any): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/subdomain', 'POST', data);
  }

  getDomains(id) {
    return this.apiService.invokePlatformServiceApi;
  }

}
