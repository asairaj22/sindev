import { Component } from '@angular/core';
import { VerifyOtpService } from './verify-otp.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent {
  otpRequestId: string = '';
  otpValue: any = '';

  constructor(private verifyOtpService: VerifyOtpService, private toastr: ToastrService) { }

  getOTP() {
    if(this.otpRequestId) {
      let individualObj = {"id": this.otpRequestId, "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''}
      this.verifyOtpService.getOtp(individualObj).subscribe(
        (res: any) => {
          if(res && res.body && res.body.length > 0 && res.body[0].otp) {
            this.otpValue = res.body[0].otp;
          } else {
            this.otpValue = '';
            this.toastr.error("Enter valid Request ID");
          }
        },
        (err: any) => {  }
      );
    } else {
      this.toastr.error("Enter Request ID");
    }    
  }

}