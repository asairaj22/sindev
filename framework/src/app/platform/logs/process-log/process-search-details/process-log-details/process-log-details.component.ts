import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-process-log-details',
  templateUrl: './process-log-details.component.html',
  styleUrls: ['./process-log-details.component.css']
})
export class ProcessLogDetailsComponent implements OnInit {
  @Input() processInstanceLogData: object = [];
  @Input() defaultDateTimeFormat: string;
  @Output() viewProcessLogDetails = new EventEmitter < any > ();
  @Output() triggerBack = new EventEmitter < any > ();
  private parsedProcessStepRequestObject: any;
  columnDefs: any;
  context: any;
  processName: string ="";

  constructor() {}
  initProcessLogGridDetails() {
      this.processName = (this.processInstanceLogData[0] && this.processInstanceLogData[0].processInstances) ? this.processInstanceLogData[0].processInstances.processNodeName : "";
      this.context = {
          componentParent: this
      };
      this.columnDefs = [{
              headerName: 'Status',
              field: 'status',
              sortable: true,
              width: 130
          },
          {
              headerName: 'Activity',
              field: 'stepName',
              sortable: true,
              cellStyle: {
                  'white-space': 'normal',
                  'word-break': 'break-word !important'
              },
              autoHeight: true,
              width: 320,
              cellRendererParams: {
                  onClick: this.getStepDetailData.bind(this)
              }
          },
          {
              headerName: 'Start Time',
              field: 'startTime',
              sortable: true,
              sort: "asc",
              width: 150
          },
          {
              headerName: 'End Time',
              field: 'endTime',
              sortable: true,
              width: 150
          },
          {
              headerName: 'Activity InstanceID',
              field: 'logId.flowNodeInstanceId',
              sortable: true,
              cellStyle: {
                  'white-space': 'normal'
              },
              autoHeight: true,
              width: 350
          }
      ];
  }
  getStepDetailData(data) {
      this.viewProcessLogDetails.emit(data.rowData);
  }
  ngOnInit() {
      this.initProcessLogGridDetails();
  }

  getRowData(rowData: any) {
      this.viewProcessLogDetails.emit(rowData);
  }

  triggerBackScreen() {
      this.triggerBack.emit('process-log-table');
  }
}
