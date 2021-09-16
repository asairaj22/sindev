import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { ApiService } from '@platform/util/api.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
declare var $: any;

@Component({
  selector: 'app-event-log-report',
  templateUrl: './event-log-report.component.html',
  styleUrls: ['./event-log-report.component.css', './../event-log.module.css'],
  encapsulation: ViewEncapsulation.None
})
export class EventLogReportComponent implements OnInit {

  eventLogScreen: string = '';
  customRange: boolean = false;
  date_range: string = 'Today';
  filterCriteria: object = {};
  userNamesList_resp: object[] = [];
  actionFlowList_resp: object[] = [];
  locationFlowIdObject: object = {};
  defaultDateTimeFormat: string = '';
  eventReportTableData: object[] = [];
  eventReportDetailsData: object = {};
  parsedModalMessageObject: any;
  parsedModalMessageString: string;
  dateFormat: any = {"moment":{"EEE":"ddd","EEEE":"dddd","d":"D","dd":"DD","M":"M","MM":"MM","MMM":"MMM","MMMM":"MMMM","yy":"YY","yyyy":"YYYY","h":"h","hh":"hh","H":"H","HH":"HH","a":"A","mm":"mm","ss":"ss","S":"ms"}};
  customRangeFrom: Date = new Date();
  customRangeTo: Date = new Date();
  customRangeSettings: object = {};
  dateRangeErrorMessage: string = '';

  constructor( private apiService: ApiService, private route: ActivatedRoute, private toastr: ToastrService ) { }

  invokePlatformApiError(err: any){
    this.apiService.loaderHide('loader');
    this.toastr.error(this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console', 'FAILED');
    console.error( err );
  }

  ngOnInit() {
    this.setDefaultTimeFormat();
    this.setCustomRangeDatePickerSettings();
    this.checkForLocationSearch();
    this.initEventLogs();
  }

  updateFormat(dateFormatObj: any, format: string, additionKey: string){
		additionKey = additionKey || '';
		Object.keys(dateFormatObj).sort().reverse().forEach(function(key){
			const temp_format = format.replace(key, additionKey + dateFormatObj[key]);
			if(temp_format.indexOf('%%') == -1){
				format = temp_format;
			}
		});
		if(additionKey != ''){
			const reg = new RegExp(additionKey, 'g');
			format = format.replace(reg, '');			
		}
		if(format.indexOf('XXXXX') != -1){
			format = format.replace('XXXXX', 'SS');
		}
		return format;
	}

  getMomentDateFormat(format: string){
		return this.updateFormat(this.dateFormat.moment, format, '%')
	}

  setDefaultTimeFormat(){
		let format = (JSON.parse(sessionStorage.generalConfiguration || '{}')[this.apiService.accountName] || {}).defaultDateTimeFormat || '';
		if(format == ''){
			format = 'MM/DD/YYYY HH:mm:ss';
    }
    this.defaultDateTimeFormat = this.getMomentDateFormat(format);
  }

  setCustomRangeDatePickerSettings(){
    this.customRangeSettings = {
        bigBanner: true,
        timePicker: true,
        format: this.defaultDateTimeFormat.replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
        defaultOpen: false
    }
  }
  
  generateUnixDate(){
    let retObj: any = {};
    let from: any,to: any;
    if(this.customRange){
      if(this.dateRangeErrorMessage == ''){
        from = moment(this.getCustomRangeFromDate(), this.defaultDateTimeFormat);
        to = moment(this.getCustomRangeToDate(), this.defaultDateTimeFormat);
      }else{
        this.showDateRangeErrorToastr();
        return false;
      }
    }else{
      to = moment().endOf('day');
      from = moment().startOf('day');
      let dateRangeVal = this.date_range.toLowerCase();
      if(dateRangeVal != 'today'){
        dateRangeVal = dateRangeVal.replace('last ','').replace(' days','').trim();
        from.add(-dateRangeVal,'day');
      }
    }
    retObj.from = from.valueOf(); //new Date(from).getUnixTime();
    retObj.to = to.valueOf(); //new Date(to).getUnixTime();
    return retObj;
  }

  initEventLogs(loadInitialPage:boolean=false){
    const locationFlowIdObject: any = this.locationFlowIdObject;
    if(loadInitialPage == false && locationFlowIdObject.isflowIdPresent){
      this.detailedView({id: locationFlowIdObject.flowId});
    }else{
      this.filterCriteria = { userList: [], apiNameList: [], apiPathList: [] };
      this.getFilterCriteriaDetails();
      this.date_range = "Today";
      this.customRange = false;
      this.eventLogScreen = 'event-log-report';
    }
  }

  getFilterCriteriaDetails() {
    this.apiService.loaderShow('loader', ' Loading...');
    this.apiService.invokePlatformServiceApi('/user/userNames/' + this.apiService.accountName, 'GET').subscribe(
        (res: any) => {
          const userNamesList = this.userNamesList_resp = res.body || [];
          this.apiService.invokePlatformServiceApi('/actionflow', 'GET', {projectName: this.apiService.appName}).subscribe(
            (res: any) => {
              const actionFlowList = this.actionFlowList_resp = res.body || [];
              this.apiService.loaderHide('loader');
            },
            (err: any) => {
              this.invokePlatformApiError(err);
            }
          );
        },
        (err: any) => {
          this.invokePlatformApiError(err);
        }
    );
  }

  checkForLocationSearch(){
    let queryParamMap: any;
    this.route.queryParamMap.subscribe(params => {
      queryParamMap = {...params['params']};
    });
    Object.keys(queryParamMap).forEach((key) => {
      queryParamMap[key] = decodeURIComponent(queryParamMap[key]);
    });
    if(queryParamMap.flowId) this.locationFlowIdObject = {flowId: queryParamMap.flowId, isflowIdPresent: true};
  }
 
  getEventLogReport(isCustomFilter: boolean){
    let reqObj: any = {appList: [this.apiService.appName], accountName: this.apiService.accountName};
    reqObj.customFilter = isCustomFilter;
    if(this.apiService.isTaskLevel) reqObj.userTaskId = this.apiService.userTaskId; 
    if(isCustomFilter){
      reqObj = {...reqObj, ...(this.filterCriteria || {})};
      const eventId = (reqObj.eventId || '');
      if(eventId != ''){
        this.locationFlowIdObject = {flowId: eventId, isflowIdPresent: true};
        this.detailedView({id: eventId});
        return;
      }
      let dateRangeObject: any = this.generateUnixDate();
      if(dateRangeObject){
        reqObj.startTime = dateRangeObject.from;
        reqObj.endTime = dateRangeObject.to;
      }else{
        return;
      }
    }
    this.apiService.loaderShow('loader', ' Generating event log report...');
    this.apiService.invokePlatformServiceApi('/eventLog', 'POST', reqObj).subscribe(
      (res: any) => {
        this.eventReportTableData = res.body || [];
        this.eventLogScreen = 'event-log-table';
        this.apiService.loaderHide('loader');
      },
      (err: any) => {
        this.invokePlatformApiError(err);
      }
    );
  }

  getEventLogByEventId(eventId: string, callback: any){
    this.apiService.invokePlatformServiceApi('/eventLog/' + eventId, 'GET').subscribe(
      (res: any) => {
        const respData: any = res.body;
        callback(respData);
      },
      (err: any) => {
        this.invokePlatformApiError(err);
      }
    );
  }

  detailedView(rowData: any){
    var _this = this;
    const eventId = rowData.id;
    if(eventId){
      _this.apiService.loaderShow('loader', ' Loading current event details...');
      _this.getEventLogByEventId(eventId, function(respData: any){
        if(Object.keys(respData).length == 0){
          _this.initEventLogs(true);
        }else{
          _this.eventLogScreen = 'event-log-details';
          respData.eventDate = moment(respData.eventDate).format(_this.defaultDateTimeFormat);
          _this.eventReportDetailsData = respData;
        }
      });
    }
  }

  getCurrentStepDetails(rowData: any){
    var _this = this;
    const eventId = rowData.id;
    if(eventId){
      _this.apiService.loaderShow('loader', ' Loading current step details...');
      _this.getEventLogByEventId(eventId, function(respData: any){
        if(respData.hasOwnProperty('message')){
          $('#event-detail-modal').find('[href="#rawMessageModal"]').click();
          const message = respData.message;
          try{
            _this.parsedModalMessageObject = JSON.parse(message);
            _this.parsedModalMessageString = JSON.stringify(_this.parsedModalMessageObject, null, "   ");
          }catch(e){
            _this.parsedModalMessageObject = message;
            _this.parsedModalMessageString =  _this.parsedModalMessageObject;
          }
        }else{
          _this.parsedModalMessageString = 'NIL';
        }
        $('#event-detail-modal .event-details-tab-content').find('pre').text( _this.parsedModalMessageString);
        $('#event-detail-modal').modal('show');
        _this.apiService.loaderHide('loader');
      });
    }
  }

  switchEventLogScreens(triggerBackFrom: string){
    if(triggerBackFrom == 'event-log-table'){
      this.eventLogScreen = 'event-log-report';
    }else if(triggerBackFrom == 'event-log-details'){
      const locationFlowIdObject: any = this.locationFlowIdObject;
      if(locationFlowIdObject.isflowIdPresent){
				this.locationFlowIdObject = {};
				this.initEventLogs();
			}else{
				this.eventLogScreen = 'event-log-table';
			}
    }
  }

  copied(event: Event){
    if(event["isSuccess"]) {
      this.toastr.success('Message has been copied');
    }else{
      this.toastr.error('Copy failed');
    }
  }

  onCustomRangeFromDateSelect(event: Event){
    const from = moment(this.getCustomRangeFromDate(), this.defaultDateTimeFormat);
    const to = moment(this.getCustomRangeToDate(), this.defaultDateTimeFormat);
    if(!from.isBefore(to)) {
      this.dateRangeErrorMessage = 'Start date cannot be after the end date';
      this.showDateRangeErrorToastr();
    } else {
      this.dateRangeErrorMessage = '';
    }
    return false;
  }

  onCustomRangeToDateSelect(event: Event){
    const from = moment(this.getCustomRangeFromDate(), this.defaultDateTimeFormat);
    const to = moment(this.getCustomRangeToDate(), this.defaultDateTimeFormat);
    if(!to.isAfter(from)) {
      this.dateRangeErrorMessage = 'End date cannot be before the start date';
      this.showDateRangeErrorToastr();
    } else {
      this.dateRangeErrorMessage = '';
    }
  }

  getCustomRangeFromDate(){
    return new Date(typeof this.customRangeFrom == 'string' ? this.customRangeFrom : this.customRangeFrom.toString());
  }

  getCustomRangeToDate(){
    return new Date(typeof this.customRangeTo == 'string' ? this.customRangeTo : this.customRangeTo.toString());
  }

  showDateRangeErrorToastr(){
    this.toastr.error(this.dateRangeErrorMessage, 'Invalid Date range');
  }

}
