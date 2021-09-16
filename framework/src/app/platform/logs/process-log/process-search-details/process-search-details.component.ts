import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '@platform/util/api.service';
import { ActivatedRoute } from '@angular/router';
import scriptJson from '../scripts.json';

import * as _moment from 'moment';
const moment = (_moment as any).default ? (_moment as any).default : _moment;

/*
export const MY_CUSTOM_FORMATS = {
  
  parseInput: 'LL LT',
  fullPickerInput: 'YYYY-MM-DD HH:mm:ss', <---- Here i've rewrited the format -->
        datePickerInput: 'LL',
        timePickerInput: 'LT',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MM YYYY',
  };*/

  @Component({
    selector: 'app-process-search-details',
    templateUrl: './process-search-details.component.html',
    styleUrls: ['./process-search-details.component.css', './../process-log.module.css']

})
export class ProcessSearchDetailsComponent implements OnInit {
    date: any;
    processLogScreen: string = 'process-log-table';
    filter: any = {
        instanceId: '',
        processNodeName: '',
        processNodeVersion: '',
        processInstanceNodeState: '',
        processInstanceEndTime: null,
        processInstanceStartTime: null
    };
    dateFormat: any = {
        "moment": {
            "EEE": "ddd",
            "EEEE": "dddd",
            "d": "D",
            "dd": "DD",
            "M": "M",
            "MM": "MM",
            "MMM": "MMM",
            "MMMM": "MMMM",
            "yy": "YY",
            "yyyy": "YYYY",
            "h": "h",
            "hh": "hh",
            "H": "H",
            "HH": "HH",
            "a": "A",
            "mm": "mm",
            "ss": "ss",
            "S": "ms"
        }
    };
    //customRangeFrom: Date = new Date();

    processSearchTableData: object[] = [];
    processInstanceLogData: object[] = [];
    processStepLogData: object[] = [];
    processNames: any = [];
    processNamesObj: any = [];
    processVersion: any = [];
    processStepData: object[] = [];
    defaultDateTimeFormat: string = 'yyyy-MM-dd HH:mm:ss';
    customRangeSettings: object = {};
    settings = {
        bigBanner: true,
        timePicker: true,
        format: this.defaultDateTimeFormat,
        defaultOpen: false
    }
    versionValue: any = {
        "processVersion": ""
    };
    selectedDate: any;


    constructor(private apiService: ApiService, private route: ActivatedRoute, private toastr: ToastrService) {
        this.loadScripts();
    }
    loadScripts() {
        let dynamicScripts = scriptJson;
        if (typeof(dynamicScripts) == 'string') {
            dynamicScripts = JSON.parse(dynamicScripts);
        }
        const _node = document.createElement('link');
        _node.href = '../../../../../../ext/plugins/loadingModal/jquery.loadingModal.css';
        _node.rel = 'stylesheet';
        document.getElementsByTagName('head')[0].appendChild(_node);
        for (let i = 0; i < dynamicScripts.length; i++) {
            const node = document.createElement('script');
            node.src = dynamicScripts[i];
            node.type = 'text/javascript';
            node.async = false;
            node.charset = 'utf-8';
            document.getElementsByTagName('head')[0].appendChild(node);
        }

    }
    ngOnInit() {
        this.setDefaultTimeFormat();
        this.getActiveWorkflowList();
        this.getProcessInstanceDetails();
        console.log(this.selectedDate);
        $('#start-time .wc-date-container span').text("Start Time");
        $('#end-time .wc-date-container span').text("End Time");
    }

    getProcessLogData() {
        this.filter.applicationName = this.apiService.appName;
        this.filter.accountName = this.apiService.accountName;
        this.apiService.loaderShow('loader', ' Generating event log report...');
        this.apiService.invokePlatformServiceApi('/processLog/processInstance', 'POST', this.filter).subscribe(
            (res: any) => {
                this.processSearchTableData = res.body || [];
                this.processLogScreen = 'process-log-table';
                this.apiService.loaderHide('loader');
            },
            (err: any) => {
                this.apiService.loaderHide('loader');
                this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
                
            }
        );
    }
    resetFields() {
        $('#start-time .wc-date-container span').text("Start Time");
        $('#end-time .wc-date-container span').text("End Time");
        this.filter = {
            instanceId: '',
            processNodeName: '',
            processNodeVersion: '',
            processInstanceNodeState: '',
            processInstanceEndTime: null,
            processInstanceStartTime: null
        };
        this.processSearchTableData = [];
        this.processLogScreen = 'process-log-table';
    }
    onDateSelect(event, type) {
        if (type === 'processInstanceStartTime') {
            $('#start-time .wc-date-container span').text(moment(event).format(this.defaultDateTimeFormat));
        } else {
            $('#end-time .wc-date-container span').text(moment(event).format(this.defaultDateTimeFormat));
        }
        this.filter[type] = event.getTime();
    }
    setDefaultTimeFormat() {
        /*	let format = (JSON.parse(sessionStorage.generalConfiguration)[this.apiService.accountName] || {}).defaultDateTimeFormat || '';
		if(format == ''){
			format = 'YYYY-MM-DD HH:mm:ss';
    }*/
        this.defaultDateTimeFormat = this.getMomentDateFormat('yyyy-MM-dd HH:mm:ss');
    }
    setCustomRangeDatePickerSettings() {
        this.customRangeSettings = {
            bigBanner: true,
            timePicker: true,
            format: this.defaultDateTimeFormat.replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
            defaultOpen: false
        }
    }

    getMomentDateFormat(format: string) {
        return this.updateFormat(this.dateFormat.moment, format, '%')
    }

    updateFormat(dateFormatObj: any, format: string, additionKey: string) {
        additionKey = additionKey || '';
        Object.keys(dateFormatObj).sort().reverse().forEach(function(key) {
            const temp_format = format.replace(key, additionKey + dateFormatObj[key]);
            if (temp_format.indexOf('%%') == -1) {
                format = temp_format;
            }
        });
        if (additionKey != '') {
            const reg = new RegExp(additionKey, 'g');
            format = format.replace(reg, '');
        }
        if (format.indexOf('XXXXX') != -1) {
            format = format.replace('XXXXX', 'SS');
        }
        return format;
    }
    getProcessLogByInstanceId(instanceId: string, callback: any) {
        let reqObj: any = {
            criteria: [{
                "key": "instanceId",
                "operation": "=",
                instanceId
            }]
        };
        this.apiService.loaderShow('loader', ' Loading...');
        this.apiService.invokePlatformServiceApi('/processLog/getProcessAuditList/' + instanceId, 'GET').subscribe(

            //this.apiService.invokePlatformApi('/getProcessAuditList', 'POST', reqObj).subscribe(
            (res: any) => {
                const respData: any = res.body;
                callback(respData);
            },
            (err: any) => {
                this.apiService.loaderHide('loader');
                this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
                
            }
        );
    }
    viewProcessDetails() {

    }
    detailedView(rowData: any) {
        var _this = this;
        const instanceId = rowData.instanceId;
        if (instanceId) {
            _this.apiService.loaderShow('loader', ' Loading current event details...');
            _this.getProcessLogByInstanceId(instanceId, function(respData: any) {
                if (Object.keys(respData).length == 0) {
                    _this.processLogScreen = 'process-log-table';
                    _this.processInstanceLogData = [];
                } else {
                    _this.processLogScreen = 'process-log-details';
                    // respData.eventDate = moment(respData.eventDate).format(_this.defaultDateTimeFormat);
                    _this.processInstanceLogData = respData;
                }
                _this.apiService.loaderHide('loader');
            });
        }
    }
    processFlowDetails(rowData: any) {
        const _this = this;
        this.apiService.loaderShow('loader', ' Loading details...');
        const url = "/processLog/processInstance/getByInstanceId/" + rowData.instanceId;
	    this.apiService.invokePlatformServiceApi(url, 'GET', "" ).subscribe(
		(res: any) => {
			_this.processLogScreen = 'process-flow-details';
	        _this.processInstanceLogData = res.body || {};
			_this.apiService.loaderHide('loader');
		},
		(err: any) =>{
			_this.apiService.loaderHide('loader');
			console.error(err);
			_this.toastr.error("Something went wrong. Please check console.");
		} 
	  );
    }
    getProcessLogDetails(rowData: any) {
        var _this = this;
        const instanceId = rowData.instanceId;
        _this.apiService.loaderShow('loader', ' Loading current event details...');
        let URL = "/processLog/getProcessLogRes/" + rowData.logId.processInstanceId + "/" + rowData.logId.processLogId;
        _this.getProcessLogApiCall(URL, function(respData: any) {
            if (Object.keys(respData).length == 0) {
                _this.processLogScreen = 'process-log-details';
                //_this.processInstanceLogData = [];
                _this.processStepLogData = respData;
            } else {
                _this.processLogScreen = 'process-step-details';
                // _this.processInstanceLogData = respData;
                _this.processStepLogData = respData;
            }
            _this.apiService.loaderHide('loader');
        });

    }
    getProcessStepDetails(rowData: any) {
        var _this = this;
        const instanceId = rowData.instanceId;
        _this.apiService.loaderShow('loader', ' Loading current event details...');
        _this.getProcessLogByInstanceId(instanceId, function(respData: any) {
            respData = (respData[0]) ? respData[0] : respData;
            if (Object.keys(respData).length == 0) {
                _this.processLogScreen = 'process-log-table';
                _this.processStepData = [];
            } else {
                _this.processLogScreen = 'process-log-details';
                _this.processStepData = respData;
            }
            _this.apiService.loaderHide('loader');
        });
    }
    getProcessLogApiCall(URL: string, callback: any) {
        let reqObj: any = {};
        this.apiService.invokePlatformServiceApi(URL, 'GET').subscribe(
            (res: any) => {
                const respData: any = res.body;
                callback(respData);
            },
            (err: any) => {
                this.apiService.loaderHide('loader');
                this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
                
            }
        );
    }
    postProcessLogApiCall(URL: string, reqestObj: any, callback: any) {
        let reqObj: any = {};
        reqObj = reqestObj;
        this.apiService.invokePlatformApi(URL, 'POST', reqObj).subscribe(
            (res: any) => {
                const respData: any = res.body;
                callback(respData);
            },
            (err: any) => {
                this.apiService.loaderHide('loader');
                this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
                
            }
        );
    }
    getActiveWorkflowList() {
        var _this = this;
        _this.processNamesObj = [];
        _this.apiService.loaderShow('loader', ' Loading current event details...');
        let URL = "/processLog/getActiveWorkflowList";
        _this.getProcessLogApiCall(URL, function(respData: any) {
            if (Object.keys(respData).length == 0) {
                _this.processNames = [];
            } else {
                _this.processNames = respData;
                respData.forEach(function(obj){
                    if(_this.processNamesObj.indexOf(obj.processName) === -1)
                        _this.processNamesObj.push(obj.processName);
                });
                _this.processNamesObj.sort();
            }
            _this.apiService.loaderHide('loader');
        });
    }
    filterVersion(value) {
        var _this = this;
        var request = [];
        _this.processVersion = [];
        (this.processNames || []).forEach(function(value) {
            if (value.processName === _this.filter.processNodeName) { // error here
                (request.indexOf(value.processVersion) == -1) ? request.push(value.processVersion): "";

            }
        });

        _this.processVersion = request.sort();
    }

    switchEventLogScreens(triggerBackFrom: string) {
        if (triggerBackFrom == 'process-log-details') {
            this.processLogScreen = 'process-log-details';
        } else if (triggerBackFrom == 'process-log-table') {
            this.processLogScreen = 'process-log-table';
        } else {
            this.processLogScreen = 'event-log-report';
        }
    }
    urlParam(name: string, data: any) {
        var results: any;
        var resultskey: string = "";
        results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(data.location.href);
        resultskey = (results) ? results[1] : "";
        return resultskey || "";
    }
    getProcessInstanceDetails() {

        let queryParamMap: any;
        this.route.queryParamMap.subscribe(params => {
            queryParamMap = {
                ...params['params']
            };
        });
        Object.keys(queryParamMap).forEach((key) => {
            queryParamMap[key] = decodeURIComponent(queryParamMap[key]);
        });
        if (queryParamMap.instanceId) {
            this.filter.instanceId = queryParamMap.instanceId;
            this.getProcessLogData();
        }
    }
}
