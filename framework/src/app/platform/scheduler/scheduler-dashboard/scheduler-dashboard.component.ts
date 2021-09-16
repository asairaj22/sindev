import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { ApiService } from '../../util/api.service';
import { CreateScheduleService } from '../service/create-schedule.service';
import { SchedulerDashboardService } from '../service/scheduler-dashboard.service';
import jstz from 'jstz';
//import { EnabledRenderComponent } from '../GridColumnDefinitions/enabled-render/enabled-render.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
//import { LogsModule } from '../../logs/logs.module';

@Component({
    selector: 'app-scheduler-dashboard',
    templateUrl: './scheduler-dashboard.component.html',
    styleUrls: ['./scheduler-dashboard.component.css','./../scheduler.module.css']
  })
export class SchedulerDashboardComponent implements OnInit{
  runningColumnDefs: any;
  workflowRunningList: object[];
  searchFilter: object = {};
  processNames: any;
  schedulerScreen: string = '';
  historyColumnDefs: any;
  workflowHistoryList: object[];
  stopJobId: any;
  modalOptions:NgbModalOptions;
  @ViewChild("scheduleActions",{static: false}) contentRef;
  @ViewChild("deleteScheduleContent",{static: false}) deleteScheduleRef;
  @ViewChild("viewScheduleContent",{static: false}) viewScheduleContentRef;
  selectedRow: any;
  scheduleType: any;
  createScheduleData: any;
  errorDetails: any;
  customStartRangeSettings:object = {};
  customEndRangeSettings:object = {};
  defaultStartDateTimeFormat: string = '';
  defaultEndDateTimeFormat: string = '';
  dateFormat: any = {"moment":{"EEE":"ddd","EEEE":"dddd","d":"D","dd":"DD","M":"M","MM":"MM","MMM":"MMM","MMMM":"MMMM","yy":"YY","yyyy":"YYYY","h":"h","hh":"hh","H":"H","HH":"HH","a":"A","mm":"mm","ss":"ss","S":"ms"}};
  dateRangeErrorMessage: string = '';
  isDateValidation = true;

  constructor(
    private apiService: ApiService,
    private createSchedulerService: CreateScheduleService,
    private schedulerDashboardService: SchedulerDashboardService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.modalOptions = {
      backdrop:'static',
      size: 'lg'
    } 
  }

  ngOnInit() {
    this.schedulerScreen = "scheduler-dashboard";
    this.initGridDetails();
  }


  setStartDatePickerSettings(){
    this.customStartRangeSettings = {
       bigBanner: true,
       timePicker: true,
       format: this.defaultStartDateTimeFormat.replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
       defaultOpen: false,
       placeholder: 'Click to select a date'
   } ;
    $('#start-time .wc-date-container span').text("Start Time");
    $('#end-time .wc-date-container span').text("End Time"); 
  }

  setEndDatePickerSettings(){
    this.customEndRangeSettings = {
       bigBanner: true,
       timePicker: true,
       format: this.defaultEndDateTimeFormat.replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
       defaultOpen: false
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
  
  initGridDetails() {
    var _this = this;
    this.apiService.loaderShow('loader', ' Loading...');
    this.runningColumnDefs = [
      { headerName: 'Workflow', field: 'taskName', sortable: true,
        width : this.getWidth(15),
        cellStyle: {
          'white-space': 'normal',
          'word-break': 'break-word !important'
        },
        autoHeight: true,
        sort: "desc"
      },
      { headerName: 'Job Name', field: 'jobName', sortable: true ,
        width : this.getWidth(15),
        cellStyle: {
          'white-space': 'normal',
          'word-break': 'break-word !important'
        },
        autoHeight: true
      },
      { headerName: 'Created By', field: 'createdBy', sortable: true ,
        width : this.getWidth(14),
        cellStyle: {
          'white-space': 'normal',
          'word-break': 'break-word !important'
        },
        autoHeight: true  
      },
      { headerName: 'Status', field: 'state', sortable: true , 
        width : this.getWidth(7),
        cellStyle: {
          'white-space': 'normal',
          'word-break': 'break-word !important'
        },
        autoHeight: true,
        valueFormatter(params: any)  {
          return params.data.state;
        }
      },
      { headerName: 'Last Run', field: 'lastRun', sortable: true,
        width : this.getWidth(12),
        cellStyle: {
          'white-space': 'normal',
          'word-break': 'break-word !important'
        },
        autoHeight: true,
       },
      { headerName: 'Next Run', field: 'nextRun', sortable: true,
        width : this.getWidth(12),
        cellStyle: {
          'white-space': 'normal',
          'word-break': 'break-word !important'
        },
        autoHeight: true,
      },
      { headerName: 'Group Key', field: 'jobGroupKey', sortable: true,
        width : this.getWidth(17),
        cellStyle: {
          'white-space': 'normal',
          'word-break': 'break-word !important'
        },
        autoHeight: true
      },
      { headerName: 'Enabled', field: 'enabled', sortable: false,
        width : this.getWidth(7),
        cellStyle: {
          'white-space': 'normal',
          'word-break': 'break-word !important'
        },
        autoHeight: true,
        cellRenderer(params: any)  {
          var eGui = document.createElement('select');
          eGui.options.add( new Option("Select","") );
          var scheduleState = (params.data.state ? params.data.state.toLowerCase() : '');
          if (scheduleState ==='pending' || scheduleState ==='waiting') {
          eGui.options.add( new Option("Stop","Stop") );
          } else if (scheduleState ==='stopped' || scheduleState ==='waiting') {
            eGui.options.add( new Option("Restart","Restart") );
          } 
          eGui.addEventListener("change", function(event) {
            _this.getScheduleAction(eGui.value, params,event);
          });
          return eGui;
        }
      },
      { headerName: 'Actions', sortable: false,
        width : this.getWidth(7),
        cellStyle: {
          'white-space': 'normal',
          'word-break': 'break-word !important'
        },
        autoHeight: true,
        cellRenderer(params: any)  {
          var eGui = document.createElement('div');
          var editSpan = document.createElement('span');
          editSpan.classList.add('mr-1');
          editSpan.innerHTML='<i class="fa fa-edit mt-2"  aria-label="Edit" style="font-size:18px" title="Edit"></i>';
          editSpan.addEventListener("click", function(event) {
            _this.editSchedule(params);
          });
          eGui.appendChild(editSpan);

          var deleteSpan = document.createElement('span');
          deleteSpan.classList.add('mr-1');
          deleteSpan.innerHTML='<i class="fa fa-trash"  aria-label="Delete" style="font-size:18px" title="Delete"></i>';
          deleteSpan.addEventListener("click", function(event) {
            _this.setIdToDelete(params);
          });
          eGui.appendChild(deleteSpan);
          
          if(params.data.state == 'ERROR' || params.data.state == 'WAITING'){
            var viewSpan = document.createElement('span');
            viewSpan.classList.add('mr-1');
            viewSpan.innerHTML='<i class="fa fa-eye"  aria-label="View" style="font-size:18px" title="View"></i>';
            viewSpan.addEventListener("click", function(event) {
              _this.getViewDetails(params);
            });
            eGui.appendChild(viewSpan);
          }
          return eGui;
        }
     }
    ];

    this.historyColumnDefs = [
      { headerName: 'Job Id', field: 'id', sortable: true ,
      width : this.getWidth(14),
      cellStyle: {
        'white-space': 'normal',
        'word-break': 'break-word !important'
      },
      autoHeight: true},
      { headerName: 'Job Name', field: 'scheduleName', sortable: true,
      width : this.getWidth(12),
      cellStyle: {
        'white-space': 'normal',
        'word-break': 'break-word !important'
      },
      autoHeight: true },
      { headerName: 'Process Name', field: 'jobName', sortable: true ,
      width : this.getWidth(12),
      cellStyle: {
        'white-space': 'normal',
        'word-break': 'break-word !important'
      },
      autoHeight: true},
      { headerName: 'Process Id', field: 'preExecUrlId', sortable: true,
      width : this.getWidth(14),
      cellStyle: {
        'white-space': 'normal',
        'word-break': 'break-word !important'
      },
      cellRenderer(params: any)  {
        if(params.data.preExecUrlId){
          var apiProcessLogURL = "/" + params.data.epAccountname + "/" + params.data.epAppname + "/pages/processLog?instanceId=" + params.data.preExecUrlId;
					return "<a href="+apiProcessLogURL+" class='' target='_blank'>"+params.data.preExecUrlId+"</a>";
        }else{
        	return "N/A";
        }
      },
      autoHeight: true },
      { headerName: 'Created By', field: 'createdBy', sortable: true ,
      width : this.getWidth(12),
      cellStyle: {
        'white-space': 'normal',
        'word-break': 'break-word !important'
      },
      autoHeight: true},
      { headerName: 'Created Date', field: 'historyCreatedOn', sortable: true,
      width : this.getWidth(12),
      cellStyle: {
        'white-space': 'normal',
        'word-break': 'break-word !important'
      },
      sort: "desc",
      autoHeight: true },
      { headerName: 'Status', field: 'state', sortable: true,
        width : this.getWidth(8),
        cellStyle: {
          'white-space': 'normal',
          'word-break': 'break-word !important'
        },
        autoHeight: true,
        valueFormatter(params: any)  {
          return params.data.state;
        }
      },
      { headerName: 'Group Key', field: 'jobGroupKey', sortable: true,
      width : this.getWidth(14),
      cellStyle: {
        'white-space': 'normal',
        'word-break': 'break-word !important'
      },
      autoHeight: true},
      { headerName: 'Actions', sortable: false,
        width : this.getWidth(6),
        cellStyle: {
          'white-space': 'normal',
          'word-break': 'break-word !important'
        },
        autoHeight: true,
        cellRenderer(params: any)  {
          var eGui = document.createElement('div');
          var viewSpan = document.createElement('span');
          viewSpan.classList.add('mr-1');
          viewSpan.innerHTML='<i class="fa fa-eye"  aria-label="View Message" style="font-size:18px" title="View Message"></i>';
          viewSpan.addEventListener("click", function(event) {
            _this.getJobDetails(params);
          });
          eGui.appendChild(viewSpan);

          return eGui;
        }
      }
    ];
    this.getWorklowRunningList();
  }
  getWidth(w) {
    var colWidth = (window.innerWidth - 100);
    var width = colWidth * w/100;  
    return width;
  }

  editSchedule(rowData){
    this.scheduleType = 'update';
    this.createScheduleData = rowData.data;
    this.schedulerScreen = "create-schedule";
  }

  setIdToDelete(rowData){
    this.selectedRow = rowData.data;
    this.modalService.open(this.deleteScheduleRef, this.modalOptions);
  }
  cancelDeleteSchedulePopup(){
    this.modalService.dismissAll(this.deleteScheduleRef);
  }
  deleteSchedule(){
    var _this = this;
    this.apiService.loaderShow('loader', ' Loading...');
    var DELETE_JOB_SCHEDULER = {jobId : this.selectedRow.uniqueId};
    this.schedulerDashboardService.deleteSchedule(DELETE_JOB_SCHEDULER).subscribe(result => {
      var resp = (result.body || []);
      if(resp.hasOwnProperty("JOBKEY")){
        this.toastr.success(resp.JOBKEY);
        this.apiService.loaderHide('loader');
      }else{
        this.toastr.error('Unable to delete the schedule');
        this.apiService.loaderHide('loader');
      }
      this.getWorklowRunningList();
      this.modalService.dismissAll(this.deleteScheduleRef);
    }, err => {
      
      this.apiService.loaderHide('loader');
    });
  }
  getViewDetails(rowData){
    this.errorDetails = rowData.data.errorMessage;
    this.modalService.open(this.viewScheduleContentRef, this.modalOptions);
    $('#rawApiResponse').find('pre').text(this.errorDetails);
  }

  getJobDetails(rowData){
    var executionBody = rowData.data.executionRequestBody;
    this.errorDetails = JSON.parse(executionBody);
    this.modalService.open(this.viewScheduleContentRef, this.modalOptions);
    $('#rawApiResponse').find('pre').text(executionBody);
  }

  cancelViewSchedulePopup(){
    this.errorDetails = {};
    this.modalService.dismissAll(this.viewScheduleContentRef);
  }
  getScheduleAction(value,rowData,event){
    if(value == "Stop"){
      this.stopJobId = rowData.data.uniqueId;
      this.openPopUp(this.contentRef);
      event.target.value="";
    }else if(value == "Restart"){
      this.restartSchedulerCall(rowData.data);
      event.target.value="";
    }
  }
  openPopUp(content) {
    this.modalService.open(content, this.modalOptions);
  }

  cancelWorkflowStop(content){
    this.stopJobId = "";
    this.modalService.dismissAll(content);
  }

  confirmWorkflowStopRequest(){
    var _this = this;
    this.apiService.loaderShow('loader', ' Loading...');
    var POST_STOP_SCHEDULER = {jobId : this.stopJobId};
    this.schedulerDashboardService.stopSchedule(POST_STOP_SCHEDULER).subscribe(result => {
      var resp = (result.body || []);
      if(resp.hasOwnProperty("JobId") && resp.hasOwnProperty("State") && resp.State == "STOPPED"){
        this.toastr.success("Scheduled Job " + resp.JobId + " has been Stopped");
        this.apiService.loaderHide('loader');
      }else{
        this.toastr.error('Scheduled Job could not be found');
        this.apiService.loaderHide('loader');
      }
      this.getWorklowRunningList();
      this.modalService.dismissAll(this.contentRef);
    }, err => {
      
      this.apiService.loaderHide('loader');
    });

  }
  restartSchedulerCall(obj: any){
    var _this = this;
    this.apiService.loaderShow('loader', ' Loading...');
    var today = moment().valueOf(), timeZone = jstz.determine().name();
    var POST_RESTART_SCHEDULER = {jobId : obj.uniqueId, timeInterval : obj.timeInterval, nextRun : obj.nextRun, currentDateTime: today, currentTimeZone: timeZone};
    this.schedulerDashboardService.restartSchedule(POST_RESTART_SCHEDULER).subscribe(result => {
      var resp = (result.body || []);
      if(resp.hasOwnProperty("JobId")){
        this.toastr.success("Scheduled Job " + resp.JobId + " has been restarted");
        this.apiService.loaderHide('loader');
      }else{
        this.toastr.error('Failed to restart');
        this.apiService.loaderHide('loader');
      }
      this.getWorklowRunningList();
      this.modalService.dismissAll(this.contentRef);
    }, err => {
      
      this.apiService.loaderHide('loader');
    });
  }

  getWorklowRunningList() {
    var _this = this;
    this.apiService.loaderShow('loader', ' Loading...');
    this.schedulerDashboardService.getWorklowRunningList().subscribe(result => {
      _this.workflowRunningList = (result.body || []);
      this.apiService.loaderHide('loader');

    }, err => {
      
      this.apiService.loaderHide('loader');

    });
  }

  getWorkflowHistoryList(){
    var _this = this;
    this.apiService.loaderShow('loader', ' Loading...');
    this.schedulerDashboardService.getWorkflowHistoryList('WORKFLOWSCHEDULER').subscribe(result => {
      var workflowHistoryData = (result.body || []);
      _this.workflowHistoryList = _this.updatePreExecURLProcessId(workflowHistoryData);
      this.apiService.loaderHide('loader');
    }, err => {
      
      this.apiService.loaderHide('loader');
    });

    this.createSchedulerService.getActiveWokflowList().subscribe(result => {
      const itemInArray = [];
      _this.processNames =  Array.from(new Set(result.body.map((itemInArray) => itemInArray.processName)));
    }, err => {
      
    });

    this.setStartDatePickerSettings();
    this.setEndDatePickerSettings();
  }
  onCustomRangeFromDateSelect(event: Event){
    this.defaultStartDateTimeFormat = this.setDefaultTimeFormat();
    this.setStartDatePickerSettings();
    var convertedDate = moment(this.searchFilter['startDate']).format(this.setDefaultTimeFormat());
    $('#start-time .wc-date-container span').text(convertedDate);
  }

  onCustomRangeToDateSelect(event: Event){
    this.defaultEndDateTimeFormat = this.setDefaultTimeFormat();
    this.setEndDatePickerSettings();
    var convertedDate = moment(this.searchFilter['endDate']).format(this.setDefaultTimeFormat());
    $('#end-time .wc-date-container span').text(convertedDate);
  }

  resetSHistoryFields(){
    this.defaultStartDateTimeFormat = '';
    this.defaultEndDateTimeFormat = '';
    this.setStartDatePickerSettings();
    this.setEndDatePickerSettings();
    $('#start-time .wc-date-container span').text("Start Time");
    $('#end-time .wc-date-container span').text("End Time"); 
    this.searchFilter = {};
  }

  getschedulerHistorySearchData(){
    this.apiService.loaderShow('loader', ' Loading...');
    this.isDateValidation = true;
    if(this.getSearchSHValidation() && this.isDateValidation){
			var cusSearch = this.searchFilter;
			cusSearch['schedulerType'] = "WORKFLOWSCHEDULER";
      var GET_SEARCH_SCHEDULER_HISTORY = {};
      GET_SEARCH_SCHEDULER_HISTORY['cusSearch'] = cusSearch;
      GET_SEARCH_SCHEDULER_HISTORY['timeZone'] = jstz.determine().name();
      var _this = this;
      this.schedulerDashboardService.getWorkflowHistoryListWithCondition(GET_SEARCH_SCHEDULER_HISTORY).subscribe(result => {
        var workflowHistoryData = (result.body || []);
        _this.workflowHistoryList = _this.updatePreExecURLProcessId(workflowHistoryData);
        this.apiService.loaderHide('loader');
      }, err => {
        
        this.apiService.loaderHide('loader');
      });
    }else if(this.isDateValidation){
      this.getWorkflowHistoryList();
    }
    this.apiService.loaderHide('loader');
  }
  updatePreExecURLProcessId(workflowHistoryData: any): object[] {
    (workflowHistoryData || []).forEach(function(workflowHistoryObj){
      var preExecUrlSplit = (workflowHistoryObj.preExecutionURL || "").split("/");
      var preExecUrlId = preExecUrlSplit[preExecUrlSplit.length - 1];
      if(preExecUrlId != "") workflowHistoryObj["preExecUrlId"] = preExecUrlId;
    });
    return workflowHistoryData;
  }
  getSearchSHValidation() {
    var _this = this;
    var isValidation = false;
		var isStartDate = false, isEndDate = false;
		if(this.searchFilter){
			$.each(this.searchFilter, function(k, v) {
				if(k && v != ""){
					isValidation = true;
				}
				if(k == "startDate" && (k && v != "")){
          var convertedDate = moment(v).format(_this.setDefaultTimeFormat());
          _this.searchFilter['startDate'] = convertedDate;
					isStartDate = true;
				}else if(k == "endDate" && (k && v != "")){
          var convertedDate = moment(v).format(_this.setDefaultTimeFormat());
          _this.searchFilter['endDate'] = convertedDate;
					isEndDate = true;
				}
			});
			if(isStartDate && isEndDate){}
			else if(isStartDate || isEndDate){
				this.toastr.error("Select start end date");
        		isValidation = false;
        		this.isDateValidation = false;
			}
		}
		return isValidation;
  }

  getRowData(){

  }

  initCreateNewSchedule(type){
    this.schedulerScreen = "create-schedule";
    this.scheduleType = type;
  }

  onGridReady(params) {
    var allColumnIds = [];
    params.getAllColumns().forEach(function(column) {
      allColumnIds.push(column.colId);
    });
    params.autoSizeColumns(allColumnIds, false);
  }

  
  switchSchedulerDashboardScreen(triggerBackFrom: string){
    this.getWorklowRunningList();
    this.schedulerScreen = 'scheduler-dashboard';
  }

}