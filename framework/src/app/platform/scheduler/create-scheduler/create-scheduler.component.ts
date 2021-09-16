import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from '../../util/api.service';
import { CreateScheduleService } from '../service/create-schedule.service';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import jstz from 'jstz';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-create-scheduler',
    templateUrl: './create-scheduler.component.html',
	styleUrls: ['./create-scheduler.component.css']
  })
  
export class CreateSchedulerComponent implements OnInit{
  @Input() scheduleType: string;
  @Input() createScheduleData: any;
  @Output() triggerBack = new EventEmitter<any>();
  workflowScheduler: any;
  currentDate: Date = new Date();
  customTimeRangeSettings:object = {};
  modalOptions:NgbModalOptions;
  popTemplate = false;
  popDayTemplate = false;
  startDateOnceSettings: object = {};
  startDateSettings: object = {};
  endDateSettings: object = {};
  startDate: any;
  startDateOnce: any;
  endDate: any;
  defaultDateTimeFormat: string = '';
  hourSelection = [];
  weekSelection = [];
  editRequest: any;
  
  constructor(
    private apiService: ApiService,
	private createSchedulerService: CreateScheduleService,
	private toastr: ToastrService,
	private modalService: NgbModal
  ) { }

  weekCount = function(){var weekArr = new Array();for(var i=0;i<=52;i++){weekArr.push(i);}return weekArr;}
  weekDays = moment.weekdays();
  daySelection = [{"key":1,"value":"Monday"},{"key":2,"value":"Tuesday"},{"key":3,"value":"Wednesday"},{"key":4,"value":"Thursday"},{"key":5,"value":"Friday"},{"key":6,"value":"Saturday"},{"key":7,"value":"Sunday"}];
  monthSelection = moment.months();//["January","February","March","April","May","June","July","August","September","October","November","December"];
  
  recurrenceTypes = [{"key":"Once","value":"Once"},{"key":"Seconds","value":"Seconds"},{"key":"Minutes","value":"Minutes"},{"key":"Hour","value":"Hour"},
  {"key":"Day","value":"Day"},{"key":"Week","value":"Week"},{"key":"Month","value":"Month"},{"key":"Year","value":"Year"}];
  isExclusionArr = [{"key":"Hour","value":["isExclusionsHour","isExclusionsDay","isExclusionsWeek","isExclusionsMonth"]},
						 {"key":"Day","value":["isExclusionsDay","isExclusionsWeek","isExclusionsMonth","isExclusionsYear"]},
						 {"key":"Week","value":["isExclusionsWeek","isExclusionsMonth","isExclusionsYear"]},
						 {"key":"Month","value":["isExclusionsMonth","isExclusionsYear"]},
						 {"key":"Year","value":["isExclusionsYear"]}];
	selectCusList = [{"key":"selectCustomSeconds","value":"Specific Seconds"},{"key":"selectCustomMinutes","value":"Specific Minutes"},{"key":"selectCustomHour","value":"Specific Time"},
						{"key":"selectCustomDay","value":"Select Hours"},
						{"key":"selectCustomWeek","value":"Specific Day"},{"key":"selectCustomMonth","value":"Specific Day"},{"key":"selectCustomYear","value":"Specific Month"}];
	recurrencOptions = [{"key":"Once","value":[{"key":"immediately","value":"Immediately"},{"key":"selectDateTime","value":"Select Date	and Time"}]},
					       {"key":"Seconds","value":[{"key":"selectCustomSeconds","value":"Specific Seconds"}]},
						   {"key":"Minutes","value":[{"key":"selectCustomMinutes","value":"Specific Minutes"}]},
						   {"key":"Hour","value":[{"key":"beginningHour","value":"Beginning of every hour"},{"key":"endHour","value":"End of the hour"},{"key":"selectCustomHour","value":"Specific Time"}]},
						   {"key":"Day","value":[{"key":"beginningDay","value":"Beginning of the day"},{"key":"endDay","value":"End of the day"},{"key":"selectCustomDay","value":"Specific Time"}]},
						   {"key":"Week","value":[{"key":"beginningWeek","value":"Beginning of the week"},{"key":"endWeek","value":"End of the week"},{"key":"selectCustomWeek","value":"Specific day and Time"}]},
						   {"key":"Month","value":[{"key":"beginningMonth","value":"Beginning of month"},{"key":"endMonth","value":"End of the month"},{"key":"selectCustomMonth","value":"Specific day of the month"}]},
						   {"key":"Year","value":[{"key":"beginningYear","value":"Beginning of the year"},{"key":"endYear","value":"End of the year"},{"key":"selectCustomYear","value":"Specific Day of the year"}]}];
	tooltipMessageObj = [{"key":"Once","value":[{"key":"dateAndTime","value":"Select Absolute Date and Times"}]},
		{"key":"Seconds","value":[{"key":"selectCustomSeconds","value":"Specifies the seconds of interval (59th seconds)"}]},
		{"key":"Minutes","value":[{"key":"selectCustomMinutes","value":"Specifies the minute of interval (59th minute)"}]},
		{"key":"Hour","value":[
			{"key":"beginningHour","value":"Beginning of every hour (00 minute)"},
			{"key":"endHour","value":"End of the hour (59th minute)"},
			{"key":"selectCustomHour","value":"Specific hour of the minute (0 to 59)"}]},
			{"key":"Day","value":[
				{"key":"beginningDay","value":"Beginning of the day (00:00 hours)"},
				{"key":"endDay","value":"End of the day (23:59 hours)"},
				{"key":"selectCustomDay","value":"Specific Time (hh:mm)"}]},
				{"key":"Week","value":[
					{"key":"beginningWeek","value":"Beginning of the week (Monday 00:00 hours)"},
					{"key":"endWeek","value":"End of the week (Sunday 23:59 hours)"},
					{"key":"selectCustomWeek","value":"Specific day and Time (Day of the week, Time (hh:mm))"}]},
					{"key":"Month","value":[
						{"key":"beginningMonth","value":"Beginning of month (1st 00:00 hours)"},
						{"key":"endMonth","value":"End of the month (Last day of the month 23:59 hours)"},
						{"key":"selectCustomMonth","value":"Specific day of the month (Day of the month, Time (hh:mm))"}]},
						{"key":"Year","value":[
							{"key":"beginningYear","value":"Beginning of the year (Jan 1 00:00 hours)"},
							{"key":"endYear","value":"End of the year (Dec 31 23:59 hours)"},
							{"key":"selectCustomYear","value":"Specific Day of the year (Day of the year, Time (hh:mm:))"}]}];
	tooltipFirstMessageObj = [{"key":"Hour","value":[{"key":"selectCustomHour","value":"A clock breaks time down into intervals of Every XX Hours"}]}];
	selectCusOptionList = ["selectDateTime","selectCustomSeconds", "selectCustomMinutes", "selectCustomHour", "selectCustomDay","selectCustomWeek","selectCustomMonth","selectCustomYear"];

	ngMultiSelectSettings = {
		singleSelection: false,
		selectAllText: 'Select All',
		unSelectAllText: 'UnSelect All',
		itemsShowLimit: 7,
		allowSearchFilter: true,
		enableCheckAll: true
	};

  ngOnInit() {
	this.startDateOnceSettings = {
		bigBanner: true,
		timePicker: true,
		format: this.defaultDateTimeFormat.replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
		defaultOpen: false,
		closeOnSelect: false,
		placeholder: 'Click to select a date'
	} ;
	this.startDateSettings = {
		bigBanner: true,
		timePicker: true,
		format: this.defaultDateTimeFormat.replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
		defaultOpen: false,
		closeOnSelect: false,
		placeholder: 'Click to select a date'
	} ;
	this.endDateSettings = {
		bigBanner: true,
		timePicker: true,
		format: this.defaultDateTimeFormat.replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
		defaultOpen: false,
		closeOnSelect: false,
		placeholder: 'Click to select a date'
	};
	
	this.initCreateOrUpdateScheduleSettings();
  }
  triggerBackScreen(){
    this.triggerBack.emit('scheduler-dashboard');
  }
  initCreateOrUpdateScheduleSettings(){
	this.createSchedulerService.getActiveWokflowList().subscribe(result => {
		this.workflowScheduler['workflowList'] = result.body;
	  }, err => {
		
	  });
	this.workflowScheduler = {};
	this.selectHour();
	this.weekSelection = this.weekCount();
	if(this.scheduleType == 'create'){
		this.workflowScheduler['createSchedule'] = {
		"recurrenceType" : "",
		"jobName" : "",
		"taskName" : "",
		"taskVersion" : "",
		"description" : "",
		"startDate" : "",
		"endDate" : "",
		"request" : ""
		};
		this.workflowScheduler['schedulerVariable'] = {
			isExclusionsHour : false,
			isExclusionsDay : false,
			isExclusionsWeek : false,
			isExclusionsMonth : false,
			isExclusionsYear : false,
			selectExecutionDivLabel : false,
			selectExecutionDivFirstLabel : false,
			selectExecutionDivSecondLabel : false
		};
	}else{
		this.initCreateNewScheduleMeta();
	    	if(this.createScheduleData && this.createScheduleData.message){
	    		var parentLevel = {};
	    		var childLevel = {};
				var message = JSON.parse(this.createScheduleData.message);
				var requestBody = "{}";
				this.editRequest = {...this.createScheduleData};
				if(message.ExecutionRequestBody){
					requestBody = message.ExecutionRequestBody;
				}else if(message.executionRequestBody){
					requestBody = message.executionRequestBody;
				}
				var execution_requestBody = JSON.parse(requestBody);
	    		 if(!execution_requestBody.recurrenceType){
	    			parentLevel = this.modifyStructure(execution_requestBody,true);
	    			childLevel = this.modifyStructure(execution_requestBody,false);
	    			this.workflowScheduler['createSchedule'] = {...this.workflowScheduler['createSchedule'],parentLevel};//angular.merge(this.createSchedule, parentLevel);
		    		this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType] = childLevel;
	    		}else{
	    			this.workflowScheduler['createSchedule'] =  {...execution_requestBody};//angular.merge(this.createSchedule, execution_requestBody);
	    			this.workflowScheduler['createSchedule'].scheduler = {};
	    			if(execution_requestBody.scheduler.exclusion){
	    				execution_requestBody.scheduler.exclusion = execution_requestBody.scheduler.exclusion;
	    			}else{
						execution_requestBody.scheduler.exclusion = {};
					}
					if(execution_requestBody.scheduler.startDate && execution_requestBody.scheduler.startDate !== ""){
						if(execution_requestBody.recurrenceType == "Once"){
							this.setScheduleStartDate(execution_requestBody.scheduler.startDate,"startDateOnce");
						}else{
							this.setScheduleStartDate(execution_requestBody.scheduler.startDate,"startDate");
						}
					}
					if(execution_requestBody.scheduler.endDate && execution_requestBody.scheduler.endDate !== ""){
						this.setScheduleStartDate(execution_requestBody.scheduler.endDate,"endDate");
					}
	    			//this.startDate = this.workflowScheduler['createSchedule'].startDate = execution_requestBody.scheduler.startDate;
	    			//this.endDate = this.workflowScheduler['createSchedule'].endDate = execution_requestBody.scheduler.endDate
	    			this.workflowScheduler['createSchedule'].request = (Object.keys(this.workflowScheduler['createSchedule'].request).length === 0) ? "" : this.workflowScheduler['createSchedule'].request;
	    			this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType] = {...execution_requestBody.scheduler}; //angular.merge(this.createSchedule, execution_requestBody.scheduler);
		    		//this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType] = childLevel;
	    			delete this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType]['startDate'];
	    			delete this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType]['endDate'];
	    		} 
	    		this.showRecurringDiv();
	    	}
	}
  

  }

  modifyStructure(execution_requestBody, parentLevel){
	var schedulerObj = execution_requestBody.scheduler;
	var currentSCObject = {};
	if(parentLevel){
		currentSCObject['recurrenceType'] =  schedulerObj.type;
		currentSCObject['taskName'] = schedulerObj.taskName || "";
		currentSCObject['jobName']= schedulerObj.jobName || "";
		currentSCObject['taskVersion'] = schedulerObj.taskVersion || "";
		currentSCObject['startDate'] = schedulerObj.startDate || "";
		currentSCObject['endDate'] = schedulerObj.endDate || "";
		currentSCObject['request'] = schedulerObj.request || "";
		currentSCObject['description'] = schedulerObj.description || "";
	}else{
		var executionTime = 'execution'+schedulerObj.type;
		currentSCObject['specificTime'] = this.modifySpecificTime(schedulerObj) || {};
		//currentSCObject['exclusion'] = this.modifyExclusion(schedulerObj) || {};
		currentSCObject['executionTime'] = schedulerObj[executionTime];
	}
	return currentSCObject;	    	
 }

 modifySpecificTime(schedulerObj){
	var specificTime = {};
	if(schedulerObj.type == "Seconds"){
		specificTime['seconds'] = schedulerObj.selectCustomSeconds.minute;
	}else if(schedulerObj.type == "Minutes"){
		specificTime['minutes'] = schedulerObj.selectCustomMinutes.minute;
	}else if(schedulerObj.type == "Hour"){
		specificTime['minutes'] = schedulerObj.selectCustomHour.minute;
	}else if(schedulerObj.type == "Day"){
		specificTime['hour'] = (schedulerObj.selectCustomHour.day.toString().includes(':')) ? schedulerObj.selectCustomHour.day : schedulerObj.selectCustomHour.day+":00";
	}else if(schedulerObj.type == "Week"){
		specificTime['hour'] = (schedulerObj.selectCustomHour.weekHour.toString().includes(':')) ? schedulerObj.selectCustomHour.weekHour : schedulerObj.selectCustomHour.weekHour+":00";
		specificTime['day'] = (schedulerObj.selectCustomHour.week.startsWith("0")) ? schedulerObj.selectCustomHour.week.toString().split("0")[1] : schedulerObj.selectCustomHour.week;;
	}else if(schedulerObj.type == "Month"){
		specificTime['hour'] = (schedulerObj.selectCustomHour.month_hour.toString().includes(':')) ? schedulerObj.selectCustomHour.month_hour : schedulerObj.selectCustomHour.month_hour+":00";
		specificTime['hour'] = (specificTime['hour'].toString().split(':').length <= 2 ) ? specificTime['hour'] : "00:00";
		specificTime['day'] = schedulerObj.selectCustomHour.month_day;
	}else if(schedulerObj.type == "Year"){
		specificTime['hour'] = (schedulerObj.selectCustomHour.year_hour.toString().includes(':')) ? schedulerObj.selectCustomHour.year_hour : schedulerObj.selectCustomHour.year_hour+":00";
		specificTime['hour'] = (specificTime['hour'].toString().split(':').length <= 2 ) ? specificTime['hour'] : "00:00";
		specificTime['day'] = schedulerObj.selectCustomHour.year_day;
		specificTime['month'] = (schedulerObj.selectCustomHour.year_month.startsWith("0")) ? schedulerObj.selectCustomHour.year_month.toString().split("0")[1] : schedulerObj.selectCustomHour.year_month;
	}
	return specificTime;
}

  uniqueProcessName(){
	itemInArray: [];
	if(this.workflowScheduler['workflowList']){
		return Array.from(new Set(this.workflowScheduler['workflowList']
		.map((itemInArray) => itemInArray.processName)));
	}else{
		return [];
	}
  }

  uniqueProcessVersion(){
    if(this.workflowScheduler['createSchedule']['taskName'] && this.workflowScheduler['createSchedule']['taskName'] != ''){
	  const selectedWorkflow = this.workflowScheduler['createSchedule']['taskName'];
	  if(this.workflowScheduler['workflowList']){
		const filtered = this.workflowScheduler['workflowList'].filter(function(value){
			return value.processName === selectedWorkflow;
		});
		return filtered;
	 }else{
		return [];
	  }
    }else{
      return [];
    }  
  }

  showRecurringDiv(){
      this.workflowScheduler['schedulerVariable']['selectExecutionDivLabel'] = false;
	  this.workflowScheduler['schedulerVariable']['selectExecutionDivFirstLabel'] = false;
	  this.workflowScheduler['schedulerVariable']['selectExecutionDivSecondLabel'] = false;
	  this.workflowScheduler['schedulerVariable']['isExclusion'] = false;
	  this.workflowScheduler['schedulerVariable']['isExclusionsHour'] = false;
	  this.workflowScheduler['schedulerVariable']['isExclusionsDay'] = false;
	  this.workflowScheduler['schedulerVariable']['isExclusionsWeek'] = false;
	  this.workflowScheduler['schedulerVariable']['isExclusionsMonth'] = false;
      this.workflowScheduler['schedulerVariable']['isExclusionsYear'] = false;
      
      var createSchedule = this.workflowScheduler['createSchedule'];
	  var type = createSchedule.recurrenceType;
	  createSchedule.recurrenceDiv = type;
	  //this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType] = {};
	  var selectExecutionDiv = "selectCustom"+type;
	  var executionDiv = "execution"+type;
	  if(createSchedule[executionDiv] == selectExecutionDiv){
		createSchedule.selectExecutionDiv = selectExecutionDiv;
	  }else{
		createSchedule.selectExecutionDiv = '';
      }
      
      if(type != 'Once'){
		//this.currentDate = new Date();
		var currentYear = this.currentDate.getFullYear()-2;
		var years = [];
		for(var i = currentYear; i<=currentYear+30; i++){
			years.push(i);
		}
		this.workflowScheduler['createSchedule'].years=years;
		
	  }

	  createSchedule.previousRecurrence = type;
		
	  var optionList = this.recurrencOptions.find(function(option){
		return (option.key == createSchedule.recurrenceType);
	   });
	   createSchedule.recurrenceOption = (optionList ? (optionList.value || []) : []);
	   var recurrenceObj = {};
	   recurrenceObj['executionTime'] = "";
	   recurrenceObj['specificTime'] = {};
	   recurrenceObj['exclusion'] = {};
	   var recurrenceType = this.workflowScheduler['createSchedule'].recurrenceType;
	   this.workflowScheduler['createSchedule'][recurrenceType] = (this.workflowScheduler['createSchedule'][recurrenceType]) ? this.workflowScheduler['createSchedule'][recurrenceType] : recurrenceObj;
	   if(this.workflowScheduler['createSchedule'][recurrenceType].executionTime !== "" && this.selectCusOptionList.indexOf(this.workflowScheduler['createSchedule'][recurrenceType].executionTime) !== -1){
		 this.changeSchedulerOption();
	   }
		/*&& this.selectCusOptionList.indexOf(executionTime) !== -1*/
	   var isExclusionObj = this.isExclusionArr.find(function(exclusionObj){return exclusionObj.key == recurrenceType});
	   if(isExclusionObj && isExclusionObj !== undefined){
		   var _this = this;
		   (isExclusionObj.value || []).forEach(function(isExclusion){_this.workflowScheduler['schedulerVariable'][isExclusion] = true;});
	       this.workflowScheduler['schedulerVariable'].isExclusion = true;
	   }	   
  }
  changeSchedulerOption() {
    
	var firstLabel = ["selectCustomHour","selectCustomYear"];
	var secondLabel = ["selectCustomYear","selectCustomMonth","selectCustomWeek"];
	//this.createSchedule.selectExecutionDivLabel = false;
	
	var recurrenceType = this.workflowScheduler['createSchedule'].recurrenceType;
	var executionTime = (this.workflowScheduler['createSchedule'][recurrenceType]) ? this.workflowScheduler['createSchedule'][recurrenceType].executionTime : "";
	var tooltipMesgObj = this.tooltipOptionMsg(this.tooltipMessageObj);
	this.workflowScheduler['schedulerVariable'].tooltipMessage = tooltipMesgObj['tooltipMessage'];
	this.workflowScheduler['schedulerVariable'].tooltipMessageDiv = tooltipMesgObj['tooltipMessageDiv'];
	
	var executionTimeObj = this.selectCusList.find(function(option){
		return option.key == executionTime;
	});
	
	if(executionTimeObj !== undefined){
		if(firstLabel.indexOf(executionTimeObj.key) != -1){
			this.workflowScheduler['schedulerVariable'].selectExecutionDivFirstLabel = true;
			var tooltipMesgObj = this.tooltipOptionMsg(this.tooltipFirstMessageObj);
			this.workflowScheduler['schedulerVariable'].tooltipFirstMessage = tooltipMesgObj['tooltipMessage'];
			this.workflowScheduler['schedulerVariable'].tooltipFirstMessageDiv = tooltipMesgObj['tooltipMessageDiv'];
		}
		if(secondLabel.indexOf(executionTimeObj.key) != -1)
			this.workflowScheduler['schedulerVariable'].selectExecutionDivSecondLabel = true;
		this.workflowScheduler['schedulerVariable'].selectExecutionDivLabel = true;
		this.workflowScheduler['schedulerVariable'].selectExecutionDivLabelKey = executionTimeObj.value;
	}else{
		this.workflowScheduler['schedulerVariable'].selectExecutionDivLabel = false;
		this.workflowScheduler['schedulerVariable'].selectExecutionDivFirstLabel = false;
		this.workflowScheduler['schedulerVariable'].selectExecutionDivSecondLabel = false;
	}
	this.workflowScheduler['createSchedule'][recurrenceType].specificTime = (this.workflowScheduler['createSchedule'][recurrenceType].specificTime) ? this.workflowScheduler['createSchedule'][recurrenceType].specificTime : {};
	this.workflowScheduler['createSchedule'].selectExecutionDiv = executionTime;
			
		
  }
  tooltipOptionMsg(tooltipFirstMessageObj: any) {
    var tooltipMesgObj = {};
    var recurrenceType = this.workflowScheduler['createSchedule'].recurrenceType;
    var executionTime = (this.workflowScheduler['createSchedule'][recurrenceType]) ? this.workflowScheduler['createSchedule'][recurrenceType].executionTime : "";
    var optionList = tooltipFirstMessageObj.find(function(option){
      return (option.key == recurrenceType);
    });
    var optionMsg = (optionList ? (optionList.value || []) : []);
    var tooltipMsg = optionMsg.find(function(option){
      return (option.key == executionTime);
    });
    tooltipMesgObj['tooltipMessage'] = (tooltipMsg ? (tooltipMsg.value || {}) : {});
    tooltipMesgObj['tooltipMessageDiv'] = ((tooltipMsg && tooltipMsg.value) ? true : false);
    return tooltipMesgObj;
  }


  initCreateNewScheduleMeta(){
	this.workflowScheduler['createSchedule']= {
			"recurrenceType" : "",
			"jobName" : "",
			"taskName" : "",
			"taskVersion" : "",
			"description" : "",
			"startDate" : "",
			"endDate" : "",
			"request" : ""
	};
	this.workflowScheduler['schedulerVariable'] = {
			isExclusionsHour : false,
			isExclusionsDay : false,
			isExclusionsWeek : false,
			isExclusionsMonth : false,
			isExclusionsYear : false,
			selectExecutionDivLabel : false,
			selectExecutionDivFirstLabel : false,
			selectExecutionDivSecondLabel : false
	};
	
	this.resetCalendars();
}
resetCalendars() {
	this.startDateOnceSettings = {
		bigBanner: true,
		timePicker: true,
		format: this.defaultDateTimeFormat.replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
		defaultOpen: false,
		closeOnSelect: false,
		placeholder: 'Click to select a date'
	} ;
	this.startDateSettings = {
		bigBanner: true,
		timePicker: true,
		format: this.defaultDateTimeFormat.replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
		defaultOpen: false,
		closeOnSelect: false,
		placeholder: 'Click to select a date'
	} ;
	this.endDateSettings = {
		bigBanner: true,
		timePicker: true,
		format: this.defaultDateTimeFormat.replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
		defaultOpen: false,
		closeOnSelect: false,
		placeholder: 'Click to select a date'
	} 
	this.startDateOnce = null;
	this.startDate = null;
	this.endDate = null;
}

scheduleWorkflow(scheducleActionType: String){
	var _this = this;
	this.apiService.loaderShow('loader', ' Loading...');
	if(_this.validateCreateScheduleObject()){
		//var apiKey = _this.getApiKey(scheduleActionType);
		var schedulerReq = _this.getWorkflowScheduleRequestBody(scheducleActionType);
		if(scheducleActionType == "create"){
			this.createSchedulerService.createSchedule(schedulerReq).subscribe(result => {
				var resp = result.body;
				this.toastr.success(resp.JobId+" scheduled");
				//console.log(resp);
				this.apiService.loaderHide('loader');
				this.triggerBackScreen();
			}, err => {
				this.toastr.error("schedule creation failed");
				this.apiService.loaderHide('loader');
				
			});
		}else if(scheducleActionType == "update"){
			this.createSchedulerService.updateSchedule(schedulerReq).subscribe(result => {
				var resp = result.body;
				if(resp.JobId){
					this.toastr.success(resp.JobId+" updated");
				}else{
					this.toastr.error("scheduler update failed");
				}
				//console.log(resp);
				this.apiService.loaderHide('loader');
				this.triggerBackScreen();
			}, err => {
				this.toastr.error("scheduler update failed");
				this.apiService.loaderHide('loader');
				
			});
		}

	}else{
		this.apiService.loaderHide('loader');
	}
}

getWorkflowScheduleRequestBody(scheducleActionType){
	//var storeObject = [""]
	var workflowRequestBody = {};
	var recurrenceType = this.workflowScheduler['createSchedule'].recurrenceType;
	workflowRequestBody['scheduler'] = this.workflowScheduler['createSchedule'][recurrenceType];
	workflowRequestBody['recurrenceType'] = recurrenceType || "";
	workflowRequestBody['taskName'] = this.workflowScheduler['createSchedule'].taskName || "";
	workflowRequestBody['jobName'] = this.workflowScheduler['createSchedule'].jobName || "";
	workflowRequestBody['taskVersion'] = this.workflowScheduler['createSchedule'].taskVersion || "";
	workflowRequestBody['scheduler'].startDate = this.workflowScheduler['createSchedule'].startDate || "";
	workflowRequestBody['scheduler'].endDate = this.workflowScheduler['createSchedule'].endDate || "";
	workflowRequestBody['request'] = this.workflowScheduler['createSchedule'].request || {};
	workflowRequestBody['description'] = this.workflowScheduler['createSchedule'].description || "";
	workflowRequestBody['schedulerType'] = "WORKFLOWSCHEDULER";
	workflowRequestBody['currentDateTime'] = moment().format("YYYY-MM-DD HH:mm:ss");
	workflowRequestBody['currentTimeZone'] = jstz.determine().name();
	
	if(scheducleActionType == "update"){
		workflowRequestBody['jobId'] = this.editRequest.uniqueId;
		workflowRequestBody['id'] = this.editRequest.id;
		workflowRequestBody['lastRun'] = this.editRequest.lastRun;
	}
	return workflowRequestBody;
}

validateCreateScheduleObject(){
	var createScheduleObject =  this.workflowScheduler['createSchedule'];
	var isValid = true;
	if(createScheduleObject.jobName == ""){
		this.toastr.error('Please Enter Name');
		return false;
	}
	if(createScheduleObject.taskName == ""){
		this.toastr.error('Please Select Workflow');
		return false;
	}
	if(createScheduleObject.request != ""){
		if(!createScheduleObject.request.startsWith('{')) {
			this.toastr.error("Please Enter Valid Request Object");
			return false;
		}
	}
	if(createScheduleObject.recurrenceType == ""){
		this.toastr.error("Please select Recurrence");
		return false;
	}else{
		isValid = this.validateSchedulerType();
	}
	return isValid;
}

validateSchedulerType(){
	var isValid = true;
	var recurrenceType =  this.workflowScheduler['createSchedule'].recurrenceType;
	var schedulerObj =  this.workflowScheduler['createSchedule'][recurrenceType];
	if(recurrenceType == undefined || recurrenceType == ""){
		this.toastr.error("Please Select Recurrence");
		return false;
	}else if(schedulerObj.executionTime == undefined || schedulerObj.executionTime == ""){
		this.toastr.error("Please Select Execution Time");
		return false;
	}else if(recurrenceType == "Once" && schedulerObj.executionTime == "selectDateTime"  && (this.workflowScheduler['createSchedule'].startDate == undefined || this.workflowScheduler['createSchedule'].startDate == "" )){
		this.toastr.error("Please Select Date and Time");
		return false;
	}else if(recurrenceType == "Seconds" && (schedulerObj.executionTime == undefined || schedulerObj.executionTime == "")){
		this.toastr.error("Please Execution Time");
		return false;
	}else if(recurrenceType == "Seconds" && (schedulerObj.specificTime.seconds == undefined || schedulerObj.specificTime.seconds == "") ){
		this.toastr.error("Please Specific Seconds");
		return false;
	}else if(recurrenceType == "Minutes" && schedulerObj.executionTime == "selectCustomSeconds"  && (schedulerObj.specificTime.minutes == undefined || schedulerObj.specificTime.minutes == "" )){
		this.toastr.error("Please Select Seconds");
		return false;
	}else if(recurrenceType == "Minutes" && schedulerObj.executionTime == "selectCustomMinutes"  && (schedulerObj.specificTime.minutes == undefined || schedulerObj.specificTime.minutes == "" )){
		this.toastr.error("Please Select Minutes");
		return false;
	}else if(recurrenceType == "Hour" && schedulerObj.executionTime == "selectCustomHour"  && (schedulerObj.specificTime.minutes == undefined || schedulerObj.specificTime.minutes == "" )){
		this.toastr.error("Please Select Time");
		return false;
	}else if(recurrenceType == "Hour" && schedulerObj.executionTime == "selectCustomHour"  && (this.numberValidation("Hour",schedulerObj.specificTime.interval))){
		this.toastr.error("Please Select Time intervals of Every XX Hours");
		return false;
	}else if(recurrenceType == "Day" && schedulerObj.executionTime == "selectCustomDay"  && (schedulerObj.specificTime.hour == undefined || schedulerObj.specificTime.hour == "" )){
		this.toastr.error("Please Select Time");
		return false;
	}else if(recurrenceType == "Week" && schedulerObj.executionTime == "selectCustomWeek"  && (schedulerObj.specificTime.day == undefined || schedulerObj.specificTime.day == "" )){
		this.toastr.error("Please Select Day of the week");
		return false;
	}else if(recurrenceType == "Week" && schedulerObj.executionTime == "selectCustomWeek" && (schedulerObj.specificTime.hour == undefined || schedulerObj.specificTime.hour  == "")){
		this.toastr.error("Please Select Hour and Minute");
		return false;
	}else if(recurrenceType == "Month" && schedulerObj.executionTime == "selectCustomMonth"  && (schedulerObj.specificTime.day == undefined || schedulerObj.specificTime.day == "" )){
		this.toastr.error("Please Select Day");
		return false;
	}else if(recurrenceType == "Month" && schedulerObj.executionTime == "selectCustomMonth"  && (schedulerObj.specificTime.hour == undefined || schedulerObj.specificTime.hour == "" )){
		this.toastr.error("Please Select Hour");
		return false;
	}else if(recurrenceType == "Year" && schedulerObj.executionTime == "selectCustomYear"  && (schedulerObj.specificTime.month == undefined || schedulerObj.specificTime.month == "" )){
		this.toastr.error("Please Select Specific Month");
		return false;
	}else if(recurrenceType == "Year" && schedulerObj.executionYear == "selectCustomYear"  && (schedulerObj.specificTime.day == undefined || schedulerObj.specificTime.day == "" )){
		this.toastr.error("Please Select Specific day");
		return false;
	}else if(recurrenceType == "Year" && schedulerObj.executionYear == "selectCustomYear"  && (schedulerObj.specificTime.hour == undefined || schedulerObj.specificTime.hour == "" )){
		this.toastr.error("Please Select Specific Hour");
		return false;
	}
	return isValid;
}

numberValidation(type: string, intervel: string | number){
	var validation = false;
	if(type === "Hour"){
		if(intervel && intervel != "" && intervel >23){
			validation = true;
		}
	}
	return validation;
}



onTimeChange(value:{hour:string,minute:string}){
	var hour = value.hour;
	if(parseInt(value.hour) < 10){
		hour = "0"+hour;
	}
	var minute = value.minute;
	if(parseInt(value.minute) < 10){
		minute = "0"+minute;
	}
	this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType].specificTime.hour = hour+":"+minute;
}


  closePopTemplate(event){
	this.popTemplate = false;
	this.popDayTemplate = false;
	if(this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType].specificTime.hour.indexOf(":") != -1){
		var hour = this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType].specificTime.hour.split(":")[0];
		if(!isNaN(hour)){
			if(parseInt(hour) < 0 || parseInt(hour) > 23){
				this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType].specificTime.hour = "";
			}
		}else{
			this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType].specificTime.hour = "";
		}

		var minute = this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType].specificTime.hour.split(":")[1];
		if(!isNaN(minute)){
			if(parseInt(minute) < 0 || parseInt(minute) > 59){
				this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType].specificTime.hour = "";
			}
		}else{
			this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType].specificTime.hour = "";
		}
	}else{
		this.workflowScheduler['createSchedule'][this.workflowScheduler['createSchedule'].recurrenceType].specificTime.hour = "";
	}
  }

  setDefaultTimeFormat(){
	/*let format = (JSON.parse(sessionStorage.generalConfiguration || '{}')[this.apiService.accountName] || {}).defaultDateTimeFormat || '';
	if(format == ''){
	//format = 'MM/DD/YYYY HH:mm:ss';
	format = "YYYY-MM-DD HH:mm:ss";
	}*/
	var format = "YYYY-MM-DD HH:mm:ss";
	return format;
	//return this.getMomentDateFormat(format);
  }

  setScheduleStartDate(event,type){
	if(type == 'startDateOnce'){
		this.startDateOnceSettings = {
			bigBanner: true,
			timePicker: true,
			format: this.setDefaultTimeFormat().replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
			defaultOpen: false,
			closeOnSelect: false,
			placeholder: 'Click to select a date'
		 };
		this.workflowScheduler['createSchedule'].startDate =  this.startDateOnce = moment(event).format(this.setDefaultTimeFormat());
	}else if(type == 'startDate'){
		this.startDateSettings = {
			bigBanner: true,
			timePicker: true,
			format: this.setDefaultTimeFormat().replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
			defaultOpen: false,
			closeOnSelect: false,
			placeholder: 'Click to select a date'
		 };
		this.workflowScheduler['createSchedule'].startDate =  this.startDate = moment(event).format(this.setDefaultTimeFormat());
	}else{
		this.endDateSettings = {
			bigBanner: true,
			timePicker: true,
			format: this.setDefaultTimeFormat().replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
			defaultOpen: false,
			closeOnSelect: false,
			placeholder: 'Click to select a date'
		 };
		this.workflowScheduler['createSchedule'].endDate =  this.endDate = moment(event).format(this.setDefaultTimeFormat());
	}
  }

  selectHour = function(){
	var hours = [];
	for(var i =0; i<24;i++){
		if(i<10){
			hours.push('0'+i+':00');
		}else{
			hours.push(i+':00');
		}
	}
	this.hourSelection = hours;
}

}