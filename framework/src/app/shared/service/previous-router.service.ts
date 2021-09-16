import { Injectable } from '@angular/core';
// import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class PreviousRouteService {

  private previousUrl: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public previousUrl$: Observable<string> = this.previousUrl.asObservable();

  constructor() { }

  setPreviousUrl(previousUrl: string) {
    this.previousUrl.next(previousUrl);
  }

  // private previousUrl: string;
  // private currentUrl: string;

  // constructor(private router: Router) {
  //   this.currentUrl = this.router.url;
  //   router.events.subscribe(event => {
  //     if (event instanceof NavigationEnd) {        
  //       this.previousUrl = this.currentUrl;
  //       this.currentUrl = event.url;
  //     };
  //   });
  // }

  // public getPreviousUrl() {
  //   return this.previousUrl;
  // }    
}