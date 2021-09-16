import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UtilService } from '../../../../widgets/platform/util.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SignUpService {

  constructor(private http: HttpClient, private utilService: UtilService) { }

  createUser(user): Observable<any> {
    
    return this.utilService.invokeAPI(
      `/Customer/signUp`,
      "POST",
      user,
      null,
      "cust"
    );
  }

}