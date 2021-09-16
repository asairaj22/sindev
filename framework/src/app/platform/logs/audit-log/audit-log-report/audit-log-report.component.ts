import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from '@platform/util/api.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { JsonPipe } from '@angular/common';
declare var $: any;

@Component({
  selector: 'app-audit-log-report',
  templateUrl: './audit-log-report.component.html',
  styleUrls: ['./audit-log-report.component.css', './../audit-log.module.css'],
  encapsulation: ViewEncapsulation.None
})
export class AuditLogReportComponent implements OnInit {
  date_range: string = 'Today';
  userNamesList_resp: object[] = [];
  userNamesMap: any = {};
  actionFlowList_resp: object[] = [];
  objects_resp: object[] = [];
  connector_operations_resp: object[] = [];

  dateFormat: any = {"moment":{"EEE":"ddd","EEEE":"dddd","d":"D","dd":"DD","M":"M","MM":"MM","MMM":"MMM","MMMM":"MMMM","yy":"YY","yyyy":"YYYY","h":"h","hh":"hh","H":"H","HH":"HH","a":"A","mm":"mm","ss":"ss","S":"SSS"}};
  defaultDateTimeFormat: string = '';
  searchParamObject:any = {};
  filterObjectList:any = []; 
  auditLog:any;
  filterCriteria: object = {};
  customRange: boolean = false;
  auditLogScreen: string = '';
  applicationObject:any = {};
  objectMetadata:any;
  isAPI:boolean = true;
  isSoap:boolean = false;
  connector_configured_id:any = '1';
  isConnectorOpertationAvail:boolean = false;
  isConnectorOperationAvail: boolean = false;
  configuredConnectorList: object[] = [];
  auditReportTableData: any;
  auditReportDetailsData: any;
  compareAuditLogData: any;
  isComparedAuditClicked:boolean = false;
  customRangeSettings: object = {};
  customRangeFrom: Date = new Date();
  customRangeTo: Date = new Date();
  dateRangeErrorMessage: string = '';
  constructor(private apiService: ApiService, private route: ActivatedRoute, private toastr: ToastrService) { }
  

  ngOnInit() {
    this.setDefaultTimeFormat();
	this.checkForSearchParam();
	this.setCustomRangeDatePickerSettings();
    this.initAuditLogs();
  }

  checkForSearchParam(){
		var locationSearchParam = location.search;
		var objectMap = {};
		if(locationSearchParam.startsWith("?")){
			var searchParamObject = this.searchParamObject = {};
			this.searchParamObject.nameList = [];
			this.searchParamObject.valueList = [];
			this.filterObjectList = [];
			var params = locationSearchParam.substring(1).split("&");
			for(var i=0;i<params.length;i++){
				var attributeKeyValue = params[i].split("=");
				var objectName = attributeKeyValue[0];
				var fieldDetails = objectName.split(".");
				var objName = fieldDetails[0];
				var attributekey = fieldDetails[1];
				var attributeValue = attributeKeyValue[1];
				if(objectMap[objName]){
					if(attributeValue.startsWith("[") && attributeValue.endsWith("]")){
						var valueArr = JSON.parse(attributeValue);
						for(var i=0;i<valueArr.length;i++){
							var obj = {
							        "key": attributekey,
							        "value": valueArr[i],
							        "operation": "=",
							        "logic": "OR"
							      };
							objectMap[objName].push(obj);
						}
					}else{
						const obj = {
						        "key": attributekey,
						        "value": attributeValue,
						        "operation": "=",
						        "logic": "AND"
						      };
						objectMap[objName].push(obj);
					}
				}else {
					objectMap[objName] = [];
					if(attributeValue.startsWith("[") && attributeValue.endsWith("]")){
						var valueArr = JSON.parse(attributeValue);
						for(var i=0;i<valueArr.length;i++){
							var obj = {
							        "key": attributekey,
							        "value": valueArr[i],
							        "operation": "=",
							        "logic": "OR"
							      };
							objectMap[objName].push(obj);
						}
					}else{
						const obj = {
						        "key": attributekey,
						        "value": attributeValue,
						        "operation": "="
						      };
						objectMap[objName].push(obj);
					}
					this.filterObjectList.push(objName);
				}
				this.auditLog.filterCriteria = {};
				this.auditLog.filterCriteria.objectList = objectMap;
			}
			this.searchParamObject.isSearchParamObjectPresent = true;
		}
  }

  initAuditLogs(){
	var searchParamObject = this.searchParamObject || {};
	if(this.searchParamObject && this.searchParamObject.isSearchParamObjectPresent){
		var _this = this;
	//	_this.getAuditLog(this.searchParamObject);
		this.getFilterCriteriaDetails();
	}else{
		//$scope.apiType = "API";
		this.getFilterCriteriaDetails();
		this.date_range = "Today";
		var event_type = "All";
		this.filterCriteria = {eventType: event_type, apiType: "API", apiList: [], appLevelPlatformModuleList: [], objectList: {}};
		this.customRange = false;
		this.auditLogScreen  = "audit-log-report";
		this.filterObjectList = [];
	}
  }

  getApplicationObject = function(){
		var arr = this.objectMetadata;
		arr = arr.filter(function(obj){
			return !obj.isSystemObject;
		});
		this.objects_resp = arr;
		var applicationObj = {};
		var  applicationObjectList = arr;
		applicationObjectList.forEach(function(data){
			applicationObj[data.model] = data;
		});
		this.applicationObject = applicationObj;
  };
  
  
  getFilterCriteriaDetails = function(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.apiService.loaderHide('loader');
    this.apiService.invokePlatformServiceApi('/auditLog/objectMetadata/', 'GET', {projectName: this.apiService.appName}).subscribe(
      (res: any) => {
        var _resp = res.body || [];
        this.objectMetadata = _resp.objects || [];
        this.objectMetadata.sort(function(a, b) {
              return a.model.toLowerCase() > b.model.toLowerCase();
          });
        this. getApplicationObject();
        this.apiService.invokePlatformServiceApi('/user/userNames/' + this.apiService.accountName, 'GET').subscribe(
          (res: any) => {
			const userNamesList = this.userNamesList_resp = res.body || [];
			userNamesList.forEach((user: any) => this.userNamesMap[user.email] = user.userName);
            this.apiService.invokePlatformServiceApi('/actionflow', 'GET', {projectName: this.apiService.appName}).subscribe(
              (res: any) => {
				const actionFlowList = this.actionFlowList_resp = res.body || [];
                this.apiService.loaderHide('loader');
              },
              (err: any) => console.error(err)
            );
          },
          (err: any) => console.error(err)
      );
      },
      (err: any) => console.error(err)
    );
		
		// bu.utils.invokeAPI("GET_USER_BY_ACCOUNT", function(data){
		// 	bu.angular.pageScope["GET_ACTIONFLOW_ROOTMETADATA"] = {projectName: JSON.parse(sessionStorage.getItem("ep-proj-active")).contextPath};
		// 	bu.utils.invokeAPI("GET_ACTIONFLOW_ROOTMETADATA", function(resp){
		// 		//$("#status").fadeOut();
		// 		//$("#preloader").fadeOut();
		// 	});
		// });
		
		this.apiService.invokePlatformServiceApi('/auditLog/configuredConnectors/', 'GET', {appContextPath: this.apiService.appName}).subscribe(
			(res: any) => {
				var connectorList = res.body || [];
				const k = connectorList.filter(function (connector) { if(connector.connectorName === "SOAP Server"){ return connector; } });
				this.configuredConnectorList = k;			
			},
			(err: any) => console.error(err)
		);	
	};
  
  setDefaultTimeFormat(){
		let format = this.apiService.generalConfiguration.defaultDateTimeFormat || '';
		if(format == ''){
			format = 'MM/DD/YYYY HH:mm:ss';
    }
    this.defaultDateTimeFormat = this.getMomentDateFormat(format);
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
	getAuditLogReport(isCustomFilter){
		this.apiService.loaderShow('loader', ' Generating audit log report...');
		let reqObj:any = {appList: []};
		if(isCustomFilter == false){
			reqObj[isCustomFilter]= false;
		}else if(this.searchParamObject && this.searchParamObject.isSearchParamObjectPresent){
			reqObj = this.filterCriteria || {};
			reqObj['customFilter'] = true;
		}else{
			reqObj = this.filterCriteria || {};
			reqObj['customFilter'] = true;
			let dateRangeObject:any = this.generateUnixDate();
			reqObj['fromDate'] = dateRangeObject.from;
			reqObj['toDate'] = dateRangeObject.to;
			if(this.filterCriteria['apiType'] == "SOAP"){
				if(!this.filterCriteria['connectorList'] || this.filterCriteria['connectorList'].length == 0){
					this.toastr.error("Select an operation");
					return;
				}
			}
		}
		reqObj['appList'] = [];
		reqObj['appList'].push(this.apiService.appName);
		reqObj['accountName'] = this.apiService.accountName;
		this.auditLogScreen = "audit-log-table"
		if(this.apiService.isTaskLevel === true){
			reqObj['userTaskId'] = this.apiService.userTaskId;
		}
		this.apiService.invokePlatformServiceApi('/auditLog/getAudit', 'POST', reqObj ).subscribe(
			(res: any) => {
				this.apiService.loaderHide('loader');
				this.auditReportTableData = res.body || {};
				this.auditLogScreen = "audit-log-table"
			},
			(err: any) =>{
				this.apiService.loaderHide('loader');
				console.error(err);
			} 
			
		  );	
	}

	generateUnixDate(){
		var retObj = {};
		var from,to;
		if(this.customRange == true){
			if(this.dateRangeErrorMessage == ''){
			from = moment(this.getCustomRangeFromDate(), this.defaultDateTimeFormat);
			to = moment(this.getCustomRangeToDate(), this.defaultDateTimeFormat);
		}else{
			this.showDateRangeErrorToastr();
       		return false;
		}
		}else{
			to = moment().endOf("day");
			from = moment().startOf("day");
			var dateRangeVal = this.date_range.toLowerCase();
			if(dateRangeVal != "today"){
				dateRangeVal = dateRangeVal.replace("last ","").replace(" days","").trim();
				from.add(-dateRangeVal,"day");
			}
		}
		retObj['from'] = from.valueOf();//new Date(from).getUnixTime();
		retObj['to'] = to.valueOf();//new Date(to).getUnixTime();
		
		return retObj;
	}

	isAPISOAP(event){
		if(event === 'api'){
			this.isAPI = true;
			this.isSoap = false;
		}else if(event === 'soap'){
			this.isAPI = false;
			this.isSoap = true;
			this.connector_configured_id = '1';
		}
	}
	
	getConnectorOperations(){
		this.isConnectorOpertationAvail = false;
		if(this.connector_configured_id != '1'){
			this.apiService.invokePlatformApi('/eportal/api/dataMapping/connector/', 'GET', {appContextPath: this.apiService.appName,configured_id: this.connector_configured_id }).subscribe(
				(res: any) => {
					const response = res.body || {};
					if(response.configuration_metadata && response.conversionMap_metadata){
						this.isConnectorOperationAvail = true;
						const connectorOperationResp = this.connector_operations_resp = JSON.parse(response.conversionMap_metadata).operation;
					}
				},
				(err: any) => console.error(err)
			);	
		}else{
			this.isConnectorOperationAvail = false;
		}
	}

	updateAttributeFilter(){
		var _this = this;
		var refreshedObject = {};
		this.filterObjectList.forEach(function(objName){
			if(_this.filterCriteria['objectList'].hasOwnProperty(objName)){
				refreshedObject[objName] = Object.assign([], _this.filterCriteria['objectList'][objName]);
			}else{
				refreshedObject[objName] = [{operation: "="}];
			}
		});
		this.filterCriteria['objectList'] = Object.assign({} ,refreshedObject);
		console.log(this.filterCriteria);
	}
	
	deleteAttribute(value, index){
		value.splice(index, 1);
	}

	switchEventLogScreens(triggerBackFrom : string){
		this.auditLogScreen = triggerBackFrom;
		if(triggerBackFrom != "audit-log-table"){
			this.initAuditLogs();
		}
	}

	detailedView(rowData : any){
		this.apiService.loaderShow('loader', ' Loading current audit details...');
		this.apiService.invokePlatformServiceApi('/auditLog/' + rowData.id, 'GET', "" ).subscribe(
		(res: any) => {
			this.apiService.loaderHide('loader');
			this.auditLogScreen  = "audit-log-details";
			this.auditReportDetailsData = res.body || {};
			this.isComparedAuditClicked = false;
		},
		(err: any) =>{
			this.apiService.loaderHide('loader');
			this.toastr.error("Something Went wrong. Please check console", "ERROR");
			console.error(err);
		} 
	  );	
	}

	compareAuditLogView(logCompareData: any){
		this.apiService.loaderShow('loader', ' Loading current audit details...');
		this.auditLogScreen  = "audit-log-details";
		this.compareAuditLogData = logCompareData;
		this.isComparedAuditClicked = true;
	}

	setCustomRangeDatePickerSettings(){
		this.customRangeSettings = {
			bigBanner: true,
			timePicker: true,
			format: this.defaultDateTimeFormat.replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
			defaultOpen: false
		}
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

	onCustomRangeFromDateSelect(event: Event){
		const from = moment(this.getCustomRangeFromDate(), this.defaultDateTimeFormat);
		const to = moment(this.getCustomRangeToDate(), this.defaultDateTimeFormat);
		console.log(this.customRangeFrom);
		if(!from.isBefore(to)) {
			this.dateRangeErrorMessage = 'Start date cannot be after the end date';
			this.showDateRangeErrorToastr();
		} else {
			this.dateRangeErrorMessage = '';
		}
		return false;
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
