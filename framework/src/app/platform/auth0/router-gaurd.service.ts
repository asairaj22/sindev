import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import {Location} from '@angular/common';
import { ApiService } from '../util/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouterGaurdService implements CanActivate {
  privilegeMap: any;
  publicAccessPages: any;
  hasPublicAccess: boolean;
  routerUrl: any;
  constructor(public jwtHelper: JwtHelperService,
              public router: Router,
              public location: Location,
              public apiService: ApiService) {}

  private isTokenExpired(): boolean {
    const token = this.apiService['XSRF_TOKEN'];
    return this.jwtHelper.isTokenExpired(token);
  }

  canActivate(activatedRoute: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): boolean | Promise<boolean> {
    return this.checkEligibilityToRoute(activatedRoute, routerState);
  }

  private getResolvedUrl(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
        .map(v => v.url.map(segment => segment.toString()).join('/'))
        .join('/');
}

private getConfiguredUrl(route: ActivatedRouteSnapshot): string {
    return '/' + route.pathFromRoot
        .filter(v => v.routeConfig)
        .map(v => v.routeConfig!.path)
        .join('/');
}

  private isPublicAccessPage(activatedRoute: ActivatedRouteSnapshot) {
    if (typeof(this.publicAccessPages) === 'string') {
      this.publicAccessPages = JSON.parse(this.publicAccessPages);
    }
    let routerUrl = this.getConfiguredUrl(activatedRoute);
    console.log(routerUrl);
    this.routerUrl = routerUrl;
    return (this.publicAccessPages.indexOf(routerUrl) != -1);
  }

  private hasPermissionToRoute(activatedRoute: ActivatedRouteSnapshot) {
	  if (this.privilegeMap.isAccountOwner || this.privilegeMap.isAppFullAccess) { return true; }
	  let readPermission = (this.privilegeMap.READ || {});
	  if (typeof readPermission === 'string') {
		  readPermission = JSON.parse(readPermission);
	  }
	  const pagePermission = (readPermission.PAGE || {});
	  let routerUrl = this.getConfiguredUrl(activatedRoute);
    console.log(routerUrl);
	  const isValid = pagePermission.hasOwnProperty(routerUrl);
	  if (!isValid) {
		  this.router.navigate(['unauthorized']);
	  }
	  return isValid;
  }

  private async checkEligibilityToRoute (activatedRoute: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {
    if ((this.apiService['XSRF_TOKEN'] || '') === '') {
      if (!this.publicAccessPages) {
        const url = '/eportal/api/getPublicAccessPageListFromCache/' + this.apiService.accountName + '/' + (this.apiService.isTaskLevel ? this.apiService.userTaskId : this.apiService.appName);
        const data = await this.apiService.invokePortalApi(url, 'GET', '{}', null).toPromise();
        this.publicAccessPages = data.body;
      }
      if (this.isPublicAccessPage(activatedRoute)) {
        return true;
      } else {
        this.location.replaceState(this.routerUrl);
        location.reload();
        return false;
      }
    }else if (this.isTokenExpired()) {
      this.router.navigate(['unauthorized']);
      return false;
    } else if (!this.apiService.isTaskLevel) {
      if (!this.privilegeMap) {
        const data = await this.apiService.invokePortalApi('/eportal/api/getPrivilegeForUserFromCache', 'POST', '{}', null).toPromise();
        this.privilegeMap = data.body;
      } 
      return this.hasPermissionToRoute(activatedRoute);
    } else {
      return true;
    }
  }

}
