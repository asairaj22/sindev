import { Component, OnInit, OnChanges, DoCheck, SimpleChanges,HostListener,Input } from '@angular/core';
import { timer, interval } from 'rxjs';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';

import { EpSessionService } from './service/ep-session.service';
@Component({
  selector: 'ep-session',
  templateUrl: './eportal-session.component.html',
  styleUrls: ['./eportal-session.component.css']
})
export class EportalSessionComponent implements OnInit, DoCheck,OnChanges {

  show: boolean = false;
  isSessionEnabled:boolean=true;
  isActive = true
  countdown_value: string
  isLogoutConfirmationRequired: boolean = false;

  @Input() redirectUrl: string;
 
  constructor(private epSessionService: EpSessionService) {
   //console.log("ep-session",this.redirectURL);
  }
  ngDoCheck() {
    this.show = this.epSessionService.show;
    this.isActive = this.epSessionService.isActive;
    this.countdown_value = this.epSessionService.countdown_value


  }

  @HostListener("window:storage", ['$event'])
  onListenAllBrowserTab(e) {
  this.epSessionService.onListenAllBrowserTab(e);
  }

  
  @HostListener('window:click', ['$event'])
  @HostListener('window:keypress', ['$event'])
  @HostListener('window:scroll', ['$event'])
  onListenActiveSession(event) {
      // console.log("onListenActiveSession",event)
      this.epSessionService.onListenActiveSession(event);
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes) 
  }
  ngOnInit() {
    console.log("",this.redirectUrl);
    this.epSessionService.onStartUp();
    this.epSessionService.redirectUrl=this.redirectUrl;
    this.show = this.epSessionService.show;
    this.isActive = this.epSessionService.isActive;
    this.isLogoutConfirmationRequired = this.epSessionService.isLogoutConfirmationRequired;
    // viewChild is set after the view has been initialized
    //console.log("after init")
  }

  onResetSession() {
    //console.log("onClick onResetSession", sessionStorage.getItem("generalConfiguration"));
    this.epSessionService.onResetSession(false); 
  }


}
