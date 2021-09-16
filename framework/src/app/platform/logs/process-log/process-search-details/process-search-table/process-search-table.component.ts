import { Component, OnInit, Input, EventEmitter, Output  } from '@angular/core';

@Component({
  selector: 'app-process-search-table',
  templateUrl: './process-search-table.component.html',
  styleUrls: ['./process-search-table.component.css']
})
export class ProcessSearchTableComponent implements OnInit {
  @Input() processSearchTableData: object = [];
  @Input() defaultDateTimeFormat: string;
  @Output() viewProcessDetails = new EventEmitter < any > ();
  @Output() viewProcessFlowDetails = new EventEmitter < any > ();
  @Output() triggerBack = new EventEmitter < any > ();
  columnDefs: any;
  context: any;

  constructor() {}
  initGridDetails() {
      this.context = {
          componentParent: this
      };
      this.columnDefs = [{
              headerName: 'Instance ID',
              field: 'instanceId',
              sortable: true,
              width: 250,
              cellRendererParams: {
                  onClick: this.getInstanseIdDetailData.bind(this)
              }
          },
          {
              headerName: 'Node Name',
              field: 'processNodeName',
              sortable: true,
              cellStyle: {
                'white-space': 'normal',
                'word-break': 'break-word !important'
              },
              autoHeight: true,
              width: 320
          },
          {
              headerName: 'State',
              field: 'processInstanceNodeState',
              sortable: true,
              width: 150
          },
          {
              headerName: 'Start Time',
              field: 'processInstanceStartTime',
              sortable: true,
              sort: "desc",
              width: 150
          },
          {
              headerName: 'End Time',
              field: 'processInstanceEndTime',
              sortable: true,
              width: 150
          },
          {
              headerName: 'Action',
              sortable: true,
              width: 100,
              cellRendererParams: {
                  onClick: this.getViewActionDetailData.bind(this),
                  label: 'View Action'
              }
          }
      ];
  }
  getInstanseIdDetailData(data) {
      this.viewProcessDetails.emit(data.rowData);
  }
  getViewActionDetailData(data) {

      this.viewProcessFlowDetails.emit(data.rowData);
  }
  ngOnInit() {
      this.initGridDetails();
  }
  getRowData(rowData: any) {
      this.viewProcessDetails.emit(rowData);
  }

  triggerBackScreen() {
      this.triggerBack.emit('process-log-table');
  }
}
