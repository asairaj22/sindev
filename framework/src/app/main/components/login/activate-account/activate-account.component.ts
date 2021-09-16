import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ActivateAccountService } from './activate-account.service';
import { ApiService } from '../../../../platform/util/api.service';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent implements OnInit {
  token: string = "";

  tokenRes: any;
  status: string = "";
  statusTitle: string = "";
  statusMessage: string = "";
  userName: string = "";

  constructor(private route: ActivatedRoute, private router: Router,
    private activateAccountService: ActivateAccountService, private apiService: ApiService) { }

  ngOnInit() {


    // if (this.route.snapshot.params['token']) {
    //   this.route.params.subscribe(param => {
    //     this.token = param['token'];

    //     this.onFetchTokenInfo();
    //   });
    // }
    // else {

      this.statusTitle = "Account Creation Success!";
      this.statusMessage = `Please, check your email and activate your Singtel Matrix Digital Service Platform account.`;
    // }


  }

  onFetchTokenInfo() {

    this.activateAccountService.fetchTokenInfo(this.token).subscribe((res) => {

      if (res.body !== null) {
        this.tokenRes = res.body;
        this.status = res.body.status;
        this.userName = res.body.firstName;

        switch (this.status) {
          case 'Active':
            this.statusTitle = "Account Activation Success!";
            this.statusMessage = `${this.userName}, Welcome to Singtel Matrix Digital Service Platform.`;
            break;
          case 'Active User':
            this.statusTitle = "Account Activation Success!";
            this.statusMessage = `${this.userName}, Welcome to Singtel Matrix Digital Service Platform.`;
            break;
          case 'Expired Token':
            this.statusTitle = "Sorry, your token expired!";
            this.statusMessage = `We'll need to re-send your activation link.`;
            break;
          case 'Invalid Token':
            this.statusTitle = "Sorry, your token is invalid!";
            this.statusMessage = `We can't proceed with this token.`;
            break;
          default:
            this.statusTitle = '';
            this.statusMessage = 'Something went wrong';
        }
      }
      else {
        this.status = '';
        this.statusTitle = '';
        this.statusMessage = 'Something went wrong';
      }


    }, (err) => {

      this.status = '';
      this.statusTitle = '';
      this.statusMessage = 'Something went wrong';
    });
  }

  onTryAgainExpiredToken() {
    if (this.tokenRes.Customer_id !== undefined) {
      this.activateAccountService.tryAgainExpiredToken(
        { "id": this.tokenRes.Customer_id }
      ).subscribe((res) => {

        this.status = '';
        this.statusTitle = '';
        this.statusMessage = `your Singtel Account activation link send to your email address. Please, verify it.`;
      },
        (err) => {

          this.status = '';
          this.statusTitle = '';
          this.statusMessage = `your Singtel Account activation failed.`;
        });
    }
    else {
      this.status = '';
      this.statusTitle = '';
      this.statusMessage = `Something went wrong`;
    }

  }

  onNavigateSetPassword() {
    let encryptObj = this.apiService.crypto.encrypt(JSON.stringify({ id: "", password: "" }));
    this.router.navigate(['/auth/set-password', encryptObj]);
  }

}