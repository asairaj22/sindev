import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '@platform/util/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManageSubscriptionService {

  constructor(private httpClient: HttpClient, private apiService: ApiService) { }

  getSubscriptions(): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/subscriptions', 'GET');
  }

  saveSubscription(reqObj):Observable<any>{
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/subscription', 'POST', reqObj);
  }
  getSubscriptionById(id): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/subscription/'+id, 'GET');
  }
  
}
