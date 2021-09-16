import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UtilService } from '../../../widgets/platform/util.service';
import { BehaviorSubject, Subject } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class MyAppsService {
 
 constructor(private http: HttpClient, private utilService: UtilService) {
 }
 
  // getCustomerInventory(id): Observable<any> {
  //   return this.utilService.invokeAPI(
  //   "/mp/customer/getCustomerInventory/"+id,
  //   "GET",
  //   null,
  //   null,
  //   'cust'
  //   )
  // }

  getEcdmDetails(id): Observable<any> {
  
    return this.utilService.invokeAPI(
    "/ecdm_product_subscription/get",
    "POST",
    id,
    null,
    'cust'
    )
  }
 
}