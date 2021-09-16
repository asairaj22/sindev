import { Injectable } from '@angular/core';
import { Observable, timer, interval } from 'rxjs';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { ApiService } from '@platform/util/api.service';


@Injectable({
    providedIn: 'root'
})
export class EpSessionService {

    show: boolean = false;
    lastTime: number = 0;
    autoRefreshInverval: number = 15 * 60;
    countdown_ref: any;
    session_ref: any;
    countdown_format: string = "MM:SS";
    countdown_value: string;
    maxTimeOut = 1800 //In Seconds
    reduceInterval = 30 //In Seconds
    isActive = true
    countdown = 60
    isLogoutConfirmationRequired: boolean = false;
    templateURL = ""
    redirectUrl=null;
    constructor(private apiService: ApiService, private http: HttpClient) {

    }
    onListenActiveSession(event) {
        var _this = this;

        if (_this.isActive && !_this.show) {
            // console.log("inside Listen Active Session")
            this.onResetSession(false);


        }
    }

    onStartUp() {
        if (this.getDefaultValues()) {
         //   this.redirectURL=redirectURL;
            // console.log("ng default value intitated")
            this.onStartMonitorSession();
            this.lastTime = new Date().getTime();
            this.validateSession();
        }

        // viewChild is set after the view has been initialized

    }

    onUpdateCountdownValue(currentCountdown) {
        let min = Math.floor(currentCountdown / 60);
        let sec = currentCountdown % 60;
        let minute = min < 10 ? "0" + min : "" + min;
        let second = sec < 10 ? "0" + sec : "" + sec; 
        this.countdown_value = this.countdown_format.replace("MM", minute).replace("SS", second);
    }

    onResetSession(skipBrowserTabSync) {
        var _this = this;
        this.show = false;
        this.lastTime = new Date().getTime(); 
        if(this.countdown_ref) clearInterval(this.countdown_ref);
        if(this.session_ref)clearTimeout(this.session_ref);
        this.countdown=60;
       // this.session_ref = timer((this.maxTimeOut - this.countdown) * 1000);
       this.session_ref = setTimeout(function(){
  
        _this.showCountdown(false);
    }, (this.maxTimeOut - this.countdown) * 1000);

   /*     this.session_ref.subscribe(() => {
            _this.showCountdown(false); 

        });*/

        if (!skipBrowserTabSync) this.syncAllBrowserTab("ep-session-reseted");
    }

    syncAllBrowserTab(key) {
        localStorage.setItem(key, new Date().getTime().toString());
    }
    initiateAutoResetSession() {
        var _this = this; 
        const autoResetInterval = setInterval( ()=>{
            _this.apiService.invokePortalApi('/session/periodical/reset', 'GET').subscribe(
                (res: any) => {
                    // console.log(res.body)
                });

        },this.autoRefreshInverval * 1000);
   

    }

    getDefaultValues() {
        var userGroupSession = JSON.parse(sessionStorage.getItem("userGroupSession")) || {};
        var generalConfig = JSON.parse(sessionStorage.getItem("generalConfiguration")) || {};
        var accountName = sessionStorage.getItem("ep-accountname");
        var account_config = generalConfig[accountName];
        // console.log("getDefaultValues", account_config)
        //|| JSON.parse('{"sessionTimeOut":"2","logoutConfirmation":"yes","allowPersonalization":"N","reportCache":"N","timeZone":"GMT-1200 (International Date Line West)","defaultDateFormat":"yyyy/MM/dd","defaultDateTimeFormat":"yyyy/MM/dd HH:mm:ss"}');
        //  console.log("account_config" + account_config)
        if (typeof account_config === "object" && account_config) {
            // console.log("account configuration")
            if (parseInt(account_config.sessionTimeOut) > 1) {
                //   console.log("account session timeout")
                if (account_config.logoutConfirmation == "yes") this.isLogoutConfirmationRequired = true;
                this.maxTimeOut = (userGroupSession.idleTime*60) || (account_config.sessionTimeOut * 60) || this.maxTimeOut;
                this.countdown = account_config.countdown || this.countdown;
                this.templateURL = account_config.templateURL || this.templateURL;
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    validateSession() {
        var _this = this;
        // const validateSessionInterval = interval(1000);
        setInterval(function () {
            var initialTime = new Date().getTime();
            var breakTime = (initialTime - _this.lastTime) / 1000;
            var remainingTime = _this.maxTimeOut - _this.countdown;
            //  console.log("remainingTime ="+_this.maxTimeOut , _this.countdown);
            if (breakTime > remainingTime && breakTime < (remainingTime + _this.countdown)) {
                    // console.log(breakTime + "----- countdown starts");
                _this.showCountdown(false);
            } else if (breakTime > (remainingTime + _this.countdown)) {
                //   console.log(breakTime + "----- logout");
                 _this.logout(false);
            }
        }, 1000);
    }

    showCountdown(skipBrowserTabSync) {
        var _this = this;

        if (!_this.show) {
            _this.show = true;
          
            var currentCountdown = _this.countdown;
	    if(this.countdown_ref) clearInterval(this.countdown_ref);
            this.onUpdateCountdownValue(currentCountdown);
           this.countdown_ref= setInterval(() => {
           currentCountdown--;
                  _this.onUpdateCountdownValue(currentCountdown);
                if (currentCountdown <= 0) {
           
                    clearInterval(_this.countdown_ref);
                    // if (_this.countdown_ref && _this.countdown_ref !==undefined) _this.countdown_ref.unsubscribe();
                     _this.logout(false);
                  
                }
            },1000);

            if (!skipBrowserTabSync) this.syncAllBrowserTab("ep-session-show-countdown");
        }
    }

    logout(skipBrowserTabSync) {
        //  this.onResetSession(false);
        if (!skipBrowserTabSync) this.syncAllBrowserTab("ep-session-expired");
            this.isActive = false;
            // window.location.reload();
            //console.log("The URL of this page is: " + window.location.href);
            this.apiService.loaderShow('loader', ' Signing Off...');
            if(this.redirectUrl)
            window.location.href = window.location.origin + '/logout?redirectURL='+this.redirectUrl;
            else
            window.location.href = window.location.origin + '/logout';
            
    }
    
    onListenAllBrowserTab(e) {
      var _this = this;

            if (_this.isActive) {
            var key = e.key;
            var value = e.newValue;
            if (key == "ep-session-reseted") {
                _this.onResetSession(true);
            } else if (key == "ep-session-expired") {
                _this.logout(true);
            } else if (key == "ep-session-show-countdown") {
                _this.showCountdown(true);
            }
        }


    }

    onStartMonitorSession() {
        this.initiateAutoResetSession();
        this.onListenActiveSession(false);
        this.onListenAllBrowserTab(this);
        this.onResetSession(false);
    }
 
}
