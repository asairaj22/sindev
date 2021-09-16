import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import moment from 'moment';
import { ApiService } from '@platform/util/api.service';
import { ToastrService } from 'ngx-toastr';
import { DiffEditorModel } from 'ngx-monaco-editor';

@Component({
  selector: 'app-audit-log-details',
  templateUrl: './audit-log-details.component.html',
  styleUrls: ['./audit-log-details.component.css']
})
export class AuditLogDetailsComponent implements OnInit {
  @Input() auditReportDetailsData: any;
  @Input() compareAuditLogData: any;
  @Input() isComparedAuditClicked: boolean;
  @Output() triggerBack = new EventEmitter<any>();
  private parsedApiResponseString: string;
  private parsedApiResponseObject: any;
  parsedApiResponseRaw: any;
  parsedApiRequestString: any;
  leftCMCode: any;
  rightCMCode: any;
  constructor(private apiService:ApiService, private toastr :ToastrService) { }
  
  options = {
    theme: 'vs-dark'
  };
  originalModel: DiffEditorModel = {
    code: "",
    language: 'text/plain'
  };
 
  modifiedModel: DiffEditorModel = {
    code: "",
    language: 'text/plain'
  };

  ngOnInit() {
    this.apiService.loaderHide('loader');
    if(this.auditReportDetailsData && !this.isComparedAuditClicked){
      this.isComparedAuditClicked = false;
      this.setToFormat(this.auditReportDetailsData);
    }else{
      this.codeMirrorFormat();
    }
  }

  
  codeMirrorFormat(){
    var firstSetCode, secondSetCode;
    firstSetCode = this.compareAuditLogData[0];
    secondSetCode = this.compareAuditLogData[1]
    if(firstSetCode.hasOwnProperty("changedObject") == true && secondSetCode.hasOwnProperty("changedObject")){
      firstSetCode = JSON.parse(firstSetCode.changedObject);
      this.leftCMCode = JSON.stringify(firstSetCode, null, "   ");
      secondSetCode = JSON.parse(secondSetCode.changedObject);
      this.rightCMCode = JSON.stringify(secondSetCode, null, "   ");
      this.originalModel = Object.assign({}, this.originalModel, { code: this.leftCMCode });
      this.modifiedModel = Object.assign({}, this.originalModel, { code: this.rightCMCode });
    }
  }
  setToFormat(rowData: any){
    if(rowData.hasOwnProperty("changedObject") == true){
      var message = rowData.changedObject;
      try{
        this.parsedApiResponseObject = JSON.parse(message);
        this.parsedApiResponseRaw =  JSON.stringify(this.parsedApiResponseObject, undefined, 2);
        this.parsedApiRequestString = JSON.stringify(this.parsedApiResponseObject, null, "   ");
      }catch(e){
        this.parsedApiResponseObject = message;
        this.parsedApiResponseRaw =  JSON.stringify(this.parsedApiResponseObject, undefined, 2);
        this.parsedApiRequestString = this.parsedApiResponseObject;
      }
    }else{
      this.parsedApiResponseObject = 'NIL';
    }
  }

  triggerBackScreen(){
    this.triggerBack.emit('audit-log-table');
    this.isComparedAuditClicked = false;
  }

  copied(event: Event, type: string){
    if(event["isSuccess"]) {
      if(type == 'request') this.toastr.success('Request has been copied');
      else if(type == 'response') this.toastr.success('Response has been copied');
    }else{
      this.toastr.error('Copy failed');
    }
  }
}
