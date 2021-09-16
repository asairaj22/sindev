import { Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import { ApiService } from '@platform/util/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-process-flow-details',
  templateUrl: './process-flow-details.component.html',
  styleUrls: ['./process-flow-details.component.css']
})
export class ProcessFlowDetailsComponent implements OnInit {

  @Input() processFlowData: object = [];
  @Input() defaultDateTimeFormat: string;
  @Output() viewProcessLogDetails = new EventEmitter < any > ();
  @Output() triggerBack = new EventEmitter < any > ();
  processFlowWorkflowData: object[] = [];
  processFlowPayloadData: object[] = [];
  processFlowMetricsData: object[] = [];
  processStepData: any;
  constructor(private apiService: ApiService, private toastr: ToastrService) {}

  ngOnInit() {

      $('.event-nav-menu').find('[href="#processDetailsTab"]').click();
      this.processStepData = this.processFlowData;

  }
  getProcessStepMonitor(rowData: any) {
      var _this = this;
      let workFlowURL = "/processLog/getProcessJsonByNameAndVersion/" + rowData.logId.processInstanceId;
      let payloadURL = "/processLog/getChildSubprocessList/" + rowData.logId.processInstanceId;
      let metricsURL = "/processLog/getProcessInstanceStepList/" + rowData.logId.processInstanceId;
      _this.getProcessLogApiCall(workFlowURL, function(respData: any) {
          _this.processFlowWorkflowData = respData;
      });
      _this.getProcessLogApiCall(payloadURL, function(respData: any) {
          _this.processFlowPayloadData = respData;
      });
      _this.getProcessLogApiCall(metricsURL, function(respData: any) {
          _this.processFlowMetricsData = respData;
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
            this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
            
          }
      );
  }
  triggerBackScreen() {
      this.triggerBack.emit('process-log-table');
  }
}
