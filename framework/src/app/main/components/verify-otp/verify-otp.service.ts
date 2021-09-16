import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { UtilService } from '../../../widgets/platform/util.service';

@Injectable({
    providedIn: 'root'
})
export class VerifyOtpService {

  constructor(private utilService: UtilService) {
  }

  getOtp(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/otp/get`,
      "POST",
      obj,
      null,
      'comapi'
    )
  }
}