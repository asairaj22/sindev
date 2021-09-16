import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '@platform/util/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private httpClient: HttpClient, private apiService: ApiService) { }

  getEvents(): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/events', 'GET');
  }

  getEvent(id): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/event/' + id, 'GET');
  }
  getEventById(id): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/events/'+id, 'GET');
  }
  
  saveEvent(data: any): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/event', 'POST', data);
  }

  updateEvent(data: any): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/event', 'POST', data);
  }

  getSubdomain(id: any): Observable<any> {
    return this.apiService.invokePlatformServiceApi('/notificationAdmin/event/' + id , 'GET'); 
  }
}
