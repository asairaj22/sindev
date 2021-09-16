import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '@platform/util/api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationLogService {

  constructor(private httpClient: HttpClient, private apiService: ApiService) { }

  getNotifications(data:any){
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/notificationHistory', 'POST', data);
  }
  resendNotification(data:any){
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/notification', 'POST', data);
  }

}
