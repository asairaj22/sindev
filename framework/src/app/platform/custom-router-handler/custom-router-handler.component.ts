import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from "src/app/app.service";

@Component({
  selector: 'app-custom-router-handler',
  templateUrl: './custom-router-handler.component.html',
  styleUrls: ['./custom-router-handler.component.css']
})
export class CustomRouterHandlerComponent {

  constructor(private router: Router, private customerService: AppService, private route: ActivatedRoute) {
    let queryParamMap: any;
    this.route.queryParams.subscribe(params => {
      queryParamMap = params;
    });
    let urlSplit = location.pathname.split("/");
    urlSplit.pop();
    let accountName = urlSplit[1];
    if (document.cookie.match('(^|;)\\s*X-XSRF-TOKEN\\s*=\\s*([^;]+)') && (sessionStorage.getItem("ep-username") == null || accountName != sessionStorage.getItem("ep-accountname"))) {
      location.href = "/validate/authorization?accountName=" + accountName + "&state=" + encodeURIComponent(urlSplit.join("/") + (queryParamMap.route || ""));
    } else {
      let userObj = { loginid: sessionStorage.getItem('ep-username') };
      if(sessionStorage.getItem('ep-username')){
        this.customerService.getuserDetails(userObj).subscribe((res) => {
        var userAccountDetails = res.body;
        if(userAccountDetails && userAccountDetails.isFirstLogin && userAccountDetails.isFirstLogin == true){
          this.router.navigateByUrl("/dashboard" || '').then((navigateSuccess: boolean) => {
            if (!navigateSuccess) {
              console.error('Navigation has failed');
            }
          });
        } else {
          if(sessionStorage.getItem('productDetail') == "true"){
            this.router.navigateByUrl(sessionStorage.getItem('routeURL') || '').then((navigateSuccess: boolean) => {
              sessionStorage.setItem('productDetail', "false");
              if (!navigateSuccess) {
                console.error('Navigation has failed');
              }
            });
          } else {
            this.router.navigateByUrl(queryParamMap.route || '').then((navigateSuccess: boolean) => {
              if (!navigateSuccess) {
                console.error('Navigation has failed');
              }
            });
          }
        }
        })
      } else{
        if(sessionStorage.getItem('productDetail') == "true"){
            this.router.navigateByUrl(sessionStorage.getItem('routeURL') || '').then((navigateSuccess: boolean) => {
              sessionStorage.setItem('productDetail', "false");
              if (!navigateSuccess) {
                console.error('Navigation has failed');
              }
            });
          } else {
            this.router.navigateByUrl(queryParamMap.route || '').then((navigateSuccess: boolean) => {
              if (!navigateSuccess) {
                console.error('Navigation has failed');
              }
            });
          }
      }
    }
  }

}