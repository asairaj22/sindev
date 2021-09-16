import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UtilService } from 'src/app/widgets/platform/util.service';
import { BehaviorSubject, Subject } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class FirstLoginWizardService {

  constructor(private http: HttpClient, private utilService: UtilService) {
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

  getCustDetails(id, individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/mp/customer_details/"+id,
      "POST",
      individualObj,
      null,
      'cust'
    )
  }

  getNewsLetter(individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/customernewsletters",
      "POST",
      individualObj,
      null,
      'cust'
    )
  }


  saveCustDetail(obj): Observable<any> {
    return this.utilService.invokeAPI(
      "/customer",
      "POST",
      obj,
      null,
      'cust'
    )
  }

  isFirstLogin(obj): Observable<any> {
    return this.utilService.invokeAPI(
      '/customer/update',
      "PUT",
      obj,
      null,
      "cust"
    );
  }


  saveDept(obj,id): Observable<any> {
    return this.utilService.invokeAPI(
      '/Customer/'+id+'/departments',
      "POST",
      obj,
      null,
      "cust"
    );
  }

  getCompanyId(obj): Observable<any> {
    return this.utilService.invokeAPI(
      '/Companydetails',
      "GET",
      obj,
      null,
      "cust"
    );
  }

  

}