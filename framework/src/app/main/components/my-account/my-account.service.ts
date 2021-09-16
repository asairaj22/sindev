import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UtilService } from '../../../widgets/platform/util.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MyAccountService {
  constructor(private http: HttpClient, private utilService: UtilService) { }
  getAccountDetails(userid): Observable<any> {
    return this.utilService.invokeAPI(
      "/UserAccountDetails",
      "GET",
      userid,
      null,
      'cust'
    )
  }
  getIndustryDetails(individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/mp/getIndustry",
      "POST",
      individualObj,
      null,
      'cust'
    )
  }
  saveCompanyDetails(obj): Observable<any> {
    return this.utilService.invokeAPI(
      "/UserAccountDetails/create",
      "POST",
      obj,
      null,
      'cust'
    )
  }
  changePassword(inputObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/changePassword",
      "POST",
      inputObj,
      null,
      "cust"
    );
  }

  myAccDetails(id, individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      '/mp/Individual/' + id + '/myAccount',
      "POST",
      individualObj,
      null,
      "cust"
    );
  }

}