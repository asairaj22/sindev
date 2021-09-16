import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from '@platform/util/api.service';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
declare var $: any;

@Component({
  selector: 'app-transaction-log-report',
  templateUrl: './transaction-log-report.component.html',
  styleUrls: ['./transaction-log-report.component.css', './../transaction-log.module.css'],
  encapsulation: ViewEncapsulation.None
})
export class TransactionLogReportComponent implements OnInit {

  transactionLogScreen: string = '';
  customRange: boolean;
  date_range: string = '';
  dateRangeVal: string = '';
	client: string = '';
	clientId: string = '';
	event_type: string = '';
	eventTypeVal: string = '';
  defaultDateTimeFormat: string = '';
  userNamesList_resp: object[] = [];
  connectorMapList_resp: object[] = [];
  operationMapList: object[] = [];
  customFilter: any = {};
  filteredConnectorObject: object[] = [];
  conNameFilter: string[] = [];
  filteredUser: string[] = [];
  filteredAPI: string[] = [];
  sessionid: string = '';
  trackid: string = ''; 
  transactionReportTableData: object[] = [];
  transactionDetailsDataData: object = {};
  dateFormat: any = {"moment":{"EEE":"ddd","EEEE":"dddd","d":"D","dd":"DD","M":"M","MM":"MM","MMM":"MMM","MMMM":"MMMM","yy":"YY","yyyy":"YYYY","h":"h","hh":"hh","H":"H","HH":"HH","a":"A","mm":"mm","ss":"ss","S":"ms"}};
  customRangeFrom: Date = new Date();
  customRangeTo: Date = new Date();
  customRangeSettings: object = {};
  dateRangeErrorMessage: string = '';

  constructor( private apiService: ApiService, private toastr: ToastrService ) { }

  invokePlatformApiError(err: any){
    this.apiService.loaderHide('loader');
    this.toastr.error(this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console', 'FAILED');
    console.error( err );
  }

  ngOnInit() {
    this.setDefaultTimeFormat();
    this.setCustomRangeDatePickerSettings();
    this.initTransactionLogs();
  }

  initTransactionLogs(){
    this.getFilterCriteriaDetails();
    this.date_range = 'Today';
    this.dateRangeVal = 'today';
    this.client = 'All';
    this.clientId = 'All';
    this.event_type = 'All';
    this.eventTypeVal = 'All';
    this.customRange = false;
    this.transactionLogScreen = 'transaction-log-report';
  }

  getFilterCriteriaDetails() {
    this.apiService.loaderShow('loader', ' Loading...');
    this.apiService.invokePlatformServiceApi('/user/userNames/' + this.apiService.accountName, 'GET').subscribe(
        (res: any) => {
          const userNamesList = this.userNamesList_resp = res.body || [];
          this.apiService.invokePlatformServiceApi('/actionflow', 'GET').subscribe(
            (res: any) => {
              const connectorMapList = this.connectorMapList_resp = res.body || [];
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

  getMomentDateFormat(format: string){
		return this.updateFormat(this.dateFormat.moment, format, '%')
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
      if(dateRangeVal != 'today') from.add(-(parseInt(this.dateRangeVal)), 'day');
    }
    retObj.from = from.valueOf(); //new Date(from).getUnixTime();
    retObj.to = to.valueOf(); //new Date(to).getUnixTime();
    return retObj;
	}
  
  updateOperationList(){
    let operationMapList = this.operationMapList = [];
    this.filteredConnectorObject.forEach((conObj: any) => {
      const configuredId = conObj.configured_id;
      const selectedConnectorObject: any = this.connectorMapList_resp.find((selConObj: any) => {
        return selConObj.configured_id == configuredId;
      });
      if(selectedConnectorObject)
          this.operationMapList = this.operationMapList.concat((selectedConnectorObject.operation || []));
    });
  }

  filterDate(val: string, event: Event){
		this.date_range = $(event.target).text();
		this.dateRangeVal = val;
  }
  
  filterClient(val: string, event: Event){
		this.clientId = $(event.target).text();
		this.client = val;
  }
  
  filterEvent(val: string, event: Event){
		this.event_type = $(event.target).text();
		this.eventTypeVal = val;
  }
  
  generateAllReport(){
		this.getReport(false);
  }

  generateCustomReport(){
		this.customFilter = {};
    this.customFilter.userList = this.filteredUser;
		this.customFilter.apiList = this.filteredAPI;
		this.customFilter.connectorList = this.filteredConnectorObject;
    const obj = this.generateUnixDate();
    if(obj){
      this.customFilter.startTime = obj.from;
      this.customFilter.endTime = obj.to;
      this.customFilter.sessionId = this.sessionid.trim();
      this.customFilter.trackId = this.trackid.trim();
      this.customFilter.client = this.client;
      this.customFilter.operationType = this.eventTypeVal;
      this.getReport(true);
    }else{
      return;
    }
	}
  
  getReport(customFilter: boolean){
		this.apiService.loaderShow('loader', ' Generating transaction log report...');
    let reqObj: any = {};
    reqObj.customFilter = customFilter;
    if(customFilter) reqObj = {...reqObj, ...this.customFilter};
		reqObj.appList = [this.apiService.appName];
		reqObj.accountName = this.apiService.accountName;
    this.apiService.invokePlatformServiceApi('/transactionLog', 'POST', {input: JSON.stringify(reqObj)}).subscribe(
      (res: any) => {
        this.transactionReportTableData = res.body || [];
        this.transactionLogScreen = 'transaction-log-table';
        this.apiService.loaderHide('loader');
      },
      (err: any) => {
        this.invokePlatformApiError(err);
      }
    );
  }

  detailedView = function(rowData: any){
    this.apiService.loaderShow('loader', ' Loading current transaction details...');
    this.apiService.invokePlatformServiceApi('/transactionLog/' + rowData.id, 'GET').subscribe(
      (res: any) => {
        const respData = res.body;
        if(Object.keys(respData).length == 0){
          this.transactionLogScreen = 'transaction-log-table';
          this.transactionReportTableData = [];
        }else{
          this.transactionDetailsData = respData;
          this.transactionLogScreen = 'transaction-log-details';
          this.apiService.loaderHide('loader');
        }
      },
      (err: any) => {
        this.invokePlatformApiError(err);
      }
    );
	}
  
  switchTransactionLogScreens(triggerBackFrom: string){
    if(triggerBackFrom == 'transaction-log-table'){
      this.transactionLogScreen = 'transaction-log-report';
    }else if(triggerBackFrom == 'transaction-log-details'){
      this.transactionLogScreen = 'transaction-log-table';
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
