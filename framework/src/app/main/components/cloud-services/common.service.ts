import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UtilService } from '../../../widgets/platform/util.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient, private utilService: UtilService) {
  }

  getProductDetails(id): Observable<any> {
    return this.utilService.invokeAPI(
      "/productoffering/getBundleDetNew",
      "POST",
      id,
      null,
      'pom',
      true //custom cache
    )
  }

  getProductCategory(data): Observable<any> {
    return this.utilService.invokeAPI(
      "/productsearchfilter/getmarketplacedetailsnew",
      "POST",
      data,
      null,
      'pom'
    )
  }

  addtoCartFromPO(shoppingSession_id, productObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/mp/shoppingcart/" + shoppingSession_id + "/addToCartNew",
      "POST",
      productObj,
      null,
      'cartapi'
    );
  }

  fetchTempSessionUuid(): Observable<any> {
    return this.utilService.invokeAPI(
      "/temporarysession/create",
      "POST",
     {"loginDestinationPage": "Cart_Customization"},
      null,
      'cust'
    );
  }

  



}