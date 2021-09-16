import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UtilService } from '../../../../widgets/platform/util.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ActivateAccountService {

  constructor(private http: HttpClient, private utilService: UtilService) { }

  fetchTokenInfo(token): Observable<any> {
    let dummyToken="ZmE3LTc3MzEtZDVmNC1hYmNkLWVhYTY=";
    // token = dummyToken;
    return this.utilService.invokeAPI(
      `/individual/${token}/activate`,
      "GET",
      null,
      null,
      "cust"
    );
  }

  tryAgainExpiredToken(id): Observable<any> {
    return this.utilService.invokeAPI(
      `/customer/triggerMail`,
      "POST",
      id,
      null,
      "cust"
    );
  }
}