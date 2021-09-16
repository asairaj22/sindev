import { Component, OnInit, OnChanges, Input, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { GlobalDataService } from 'src/app/main/services/global.service';

@Component({
  selector: 'app-sub-header-menu',
  templateUrl: './sub-header-menu.component.html',
  styleUrls: ['./sub-header-menu.component.css']
})
export class SubHeaderMenuComponent implements OnInit, OnChanges {
  // @ViewChild('subHeaderBox', { static: false }) subHeaderBox: ElementRef;
  @Input() userRoleDetail: string;

  alertCount;
  fixedBoxOffsetTop: number = 0;
  fixedBoxOffsetTopOtherMethod: number = 0;
  exceedScrollLimit: boolean = true;
  headerHeight = 0;
  cloudTopscroll:boolean = false;
  cloudPage:boolean = false;
  topReach:boolean = false;
lastScrollTop = 0;
  subHeaderTop: boolean = false;
  getAccessSet = this.globalDataService.accessSet['subheader'];
  userRole: string;
  getUserRoleArray: any;
  custId: string = "";
	cName:string = "";	
individualBoolean:boolean = false;


  constructor(private appService: AppService,private globalDataService: GlobalDataService) {
//subheader menu Access Management
  }

  ngOnInit(): void {
    this.cName = "";	
    this.individualBoolean = false;	
    this.appService.individualComponent.subscribe(message => {	
       this.cName = message;	
        if(this.cName == "individual"){	
          this.individualBoolean = true;
        }	
        else{	
          this.cName = "";	
          this.individualBoolean = false;	
        }	
        });
    this.appService.headerheight.subscribe(
      data => {
        this.headerHeight = data;
      }
    );


    //reading the value from other components by subscribing to their subjects
    // this.appService.stringSubject.subscribe(
    //  data => {
    //   this.alertCount = data;

    //not required right now since its only way emitting value from dashboard to header menu
    //emitting value to parent component using event emitter
    // this.myOutputVal.emit(this.myInputVal + ' from child.');
    //  }
    //);
  }






  getApplicationDetails(custid) {
    this.appService.getCustomerDetails(custid)
      .subscribe((res: any) => {
        this.alertCount = res.body.length;
        //this.customers = this.getInstanceDetails;
      });
  }
	
  ngOnChanges() {
    this.userRole = this.userRoleDetail;
  }


  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    this.getScrollEvent();
    //       if(this.appService.cloudPageBoolean){
    //   this.cloudPage = true;
    //   if(this.appService.scrollUp){ 
    //       this.cloudTopscroll = false;
    //       this.topReach = true;
    //       if(this.appService.pageNameFind > 60){
    //         this.topReach = false;
    //       }
    //   }
    //   else{
    //     this.topReach = false;
    //     this.cloudTopscroll = true;
    //   }
    // }
    // else{
    //   this.cloudPage = false;
    //   this.cloudTopscroll = false;
    // }
    if (window.pageYOffset > 80) {
      this.subHeaderTop = true;
      // this.fixedBoxOffsetTop = this.subHeaderBox.nativeElement.offsetHeight;
      // this.appService.passSubHeaderheight(this.fixedBoxOffsetTop);
    }
    else {
      this.subHeaderTop = false;
      // this.fixedBoxOffsetTop = this.subHeaderBox.nativeElement.offsetHeight;
      // this.appService.passSubHeaderheight(this.fixedBoxOffsetTop);
    }
  }

  getScrollEvent(){
    let st = window.pageYOffset || document.documentElement.scrollTop; 
    this.cloudPage = true;
   if (st > this.lastScrollTop){
          this.cloudTopscroll = false;
          this.topReach = true;
          if(this.appService.pageNameFind > 60){
            this.topReach = false;
          }
        } else {
        this.topReach = false;
        this.cloudTopscroll = true;
   }
  this.lastScrollTop = st <= 0 ? 0 : st;
 }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // this.fixedBoxOffsetTop = this.subHeaderBox.nativeElement.offsetHeight;
    this.appService.passSubHeaderheight(this.fixedBoxOffsetTop);
  }

revertScroll(){
  this.cloudPage = false;
  this.cloudTopscroll = false;
  this.appService.cloudPageBoolean = false;
}

  ngAfterViewInit(): void {
    // this.fixedBoxOffsetTop = this.subHeaderBox.nativeElement.offsetHeight;
    // this.appService.passSubHeaderheight(this.fixedBoxOffsetTop);
    setTimeout(() =>{
    this.custId = sessionStorage.getItem("customerId");
    if(this.custId != '')
    { 
    this.getApplicationDetails(this.custId);
    }
    },1000);
  }



}
