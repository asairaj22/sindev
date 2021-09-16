import { Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import { ApiService } from '@platform/util/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-process-flow-monitor',
    templateUrl: './process-flow-monitor.component.html',
    styleUrls: ['./process-flow-monitor.component.css']
})
export class ProcessFlowMonitorComponent implements OnInit {
    @Input() processFlowData: object = [];
    @Input() defaultDateTimeFormat: string;
    @Output() viewProcessLogDetails = new EventEmitter < any > ();
    @Output() triggerBack = new EventEmitter < any > ();
    processFlowWorkflowData: object[] = [];
    processFlowPayloadData: object[] = [];
    processFlowMetricsData: object[] = [];
    processInstObj: any;
    constructor(private apiService: ApiService, private toastr: ToastrService) {}


    getProcessStepMonitor(rowData: any) {
        this.processInstObj = this.processFlowData;
        var _this = this;
        let workFlowURL = "/processLog/getProcessJsonByNameAndVersion/" + rowData.instanceId;
        let payloadURL = "/processLog/getProcessInstanceStepList/" + rowData.instanceId;
        let metricsURL = "/processLog/getChildSubprocessList/" + rowData.instanceId;
        _this.getProcessLogApiCall(workFlowURL, function(respData: any) {
            _this.processFlowWorkflowData = respData;
        });
        _this.getProcessLogApiCall(payloadURL, function(respData: any) {
            _this.processFlowPayloadData = respData;
        });
        _this.getProcessLogApiCall(metricsURL, function(respData: any) {
            _this.processFlowMetricsData = respData;
        });
        setTimeout(() => {
            this.processViewResults();
        }, 500)
    }

    processViewResults() {
        const _workFVW = eval('workFVW');
        _workFVW._showWorkFlowView("", this.processInstObj.instanceId, "", this.processInstObj.instanceId + '_WFContainer');
    }

    getProcessLogApiCall(URL: string, callback: any) {
        let reqObj: any = {};
        this.apiService.invokePlatformServiceApi(URL, 'GET').subscribe(
            (res: any) => {
                const respData: any = res.body;
                callback(respData);
            },
            (err: any) => {
                this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
                
            }
        );
    }

    ngOnInit() {
        this.getProcessStepMonitor(this.processFlowData);
    }
    getWorkflowChartDetails() {
        const _workFVW = eval('workFVW');
        _workFVW.getWorkFlowProcessChart(this.processInstObj.instanceId, this.processInstObj.instanceId + '_chartContainer');
    }
}