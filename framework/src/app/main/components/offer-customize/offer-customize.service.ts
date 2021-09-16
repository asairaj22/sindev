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

  getShoppingCartDetails(shoppingSession_id, individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/mp/shoppingSession/" + shoppingSession_id + "/getAll",
      "POST",
      individualObj,
      null,
      'cartapi'
      //'MTMjY2FydGFwaSNmaXJzdC10YXNrLWNhcnQteGw='
    );
  }

  getProductDetails(id): Observable<any> {
    return this.utilService.invokeAPI(
      "/productoffering/getBundleDetNew",
      "POST",
      id,
      null,
      'pom'
    )
  }

  getCartcustomization(obj): Observable<any> {
    return this.utilService.invokeAPI(
      "/mp/cart_customization",
      "POST",
      obj,
      null,
      'cartapi'
    )
  }

  createOrder(orderObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/mp/ordermanagement/order",
      "POST",
      orderObj,
      null,
      'om'
    );
  }

  sendOtp(obj): Observable<any> {
    return this.utilService.invokeAPI(
      "/customer/sendOTP",
      "POST",
      obj,
      null,
      'om'
    );
  }

  verifyOtp(obj): Observable<any> {
    return this.utilService.invokeAPI(
      "/communication/OTP/Validate",
      "POST",
      obj,
      null,
      'comapi'
    );
  }

  billingOrder(obj): Observable<any> {
    return this.utilService.invokeAPI(
      "/mp/billingaccountvalidation/validate",
      "POST",
      obj,
      null,
      'om'
    );
  }

  sendBillMobileOtp(obj): Observable<any> {
    return this.utilService.invokeAPI(
      "/billingaccountvalidation/sendOtp",
      "POST",
      obj,
      null,
      'om'
    );
  }

  verifyBillMobileOtp(obj): Observable<any> {
    return this.utilService.invokeAPI(
      "/billingaccountvalidation/validateViaOtp",
      "POST",
      obj,
      null,
      'om'
    );
  }

  mapTemporaryShoppingSession(inputObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/shoppingsessionref/mapTemporarySession",
      "POST",
      inputObj,
      null,
      'cust'
    );
  }

  verifyDomainAvailability(obj): Observable<any> {
    return this.utilService.invokeAPI(
      "/verifyDomainAvailability",
      "POST",
      obj,
      null,
      'mpproser'
    );
  }

}