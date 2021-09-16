import { Component, OnInit, Input, Output, EventEmitter, TemplateRef} from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ModalContentComponent } from '../modal-content-component/modal-content-component.component';
declare var $: any;

@Component({
  selector: 'app-process-step-details',
  templateUrl: './process-step-details.component.html',
  styleUrls: ['./process-step-details.component.css']
})
export class ProcessStepDetailsComponent implements OnInit {

  @Input() processStepData: any;
  @Input() defaultDateTimeFormat: string;
  @Output() triggerBack = new EventEmitter<any>();
  private parsedProcessStepObject: any;
  parsedProcessStepString: string;
  private parsedProcessStepResponseObject: any;
  processStepDetailData: any={};
  private parsedProcessStepResponseString: string;
  isJSONReq: boolean = false;
  private isJSONResp: boolean = false;
  columnDefs: any;
  context: any; 
  parsedModelName: string;
  processStepName: string = "";
  modalRef: BsModalRef;
  template: TemplateRef<any>
  constructor(private toastr: ToastrService, private modalService: BsModalService) { }

  ngOnInit() {

    this.processStepName = (this.processStepData[0] && this.processStepData[0].stepName) ? this.processStepData[0].stepName : "";
    this.context = { componentParent: this };
    this.columnDefs = [
      {headerName: 'Status', field: 'status', sortable: true },
      {headerName: 'Request', sortable: true,
        cellRendererParams: {
          onClick: this.getRequestData.bind(this),
          label: 'Request'
        }
      },
      {headerName: 'Response', sortable: true,
        cellRendererParams: {
          onClick: this.getResponseData.bind(this),
          label: 'Response'
        }
       },
      {headerName: 'Start Time', field: 'startTime', sortable: true },
      {headerName: 'End Time', field: 'endTime', sortable: true },
      {headerName: 'Connectorsss Name', field: 'connectorName', sortable: true },
      {headerName: 'Connector Type', field: 'connectorType', sortable: true },
      {headerName: 'View Eventlog', field: 'eventLogId', sortable: true },
      {headerName: 'Action', sortable: true,
        cellRendererParams: {
          onClick: this.getViewActionData.bind(this),
          label: 'View Action'
        }
      }
    ];    
    $('#stepDetails').find('[href="#rawTab"]').click();
  }
  getprocessStepData(event: any){
    $("#myModal").modal("show")
  }
  getRequestData(data) {
    this.parsedModelName = "Request";
    var request = (data.rowData && data.rowData.request) ? data.rowData.request : "NA";
      request = this.parsedProcessStepObject = (request.startsWith("<") == false && request !== 'NA') ? JSON.parse(request) : request;
      if(typeof request == "string"){
        this.isJSONReq = false;
        this.parsedProcessStepString = this.formatXml(request);
      }else if(typeof request == "object"){
        this.isJSONReq = true;
        this.parsedProcessStepString = JSON.stringify(this.parsedProcessStepObject, null, "   ");
      }else{
        this.parsedProcessStepString = request;
      }
    $("#myModal").modal("show");
    $('#stepDetails').find('[href="#rawTab"]').click();
  }
  getResponseData(data) {
    this.parsedModelName = "Response";
    var request = (data.rowData && data.rowData.response) ? data.rowData.response : "NA";
    request = this.parsedProcessStepObject = (request.startsWith("<") == false && request !== 'NA') ? JSON.parse(request) : request;
    if(typeof request == "string"){
      this.isJSONReq = false;
      this.parsedProcessStepString = this.formatXml(request);
    }else if(typeof request == "object"){
      this.isJSONReq = true;
      this.parsedProcessStepString = JSON.stringify(this.parsedProcessStepObject, null, "   ");
    }else{
      this.parsedProcessStepString = request;
    }
    $("#myModal").modal("show");
    $('#stepDetails').find('[href="#perttyTab"]').click();
  }
  getViewActionData(data) {
    this.processStepDetailData = (data.rowData) ? data.rowData : "NA";
    
    
    $("#transactionDetails").modal("show");

    //let requestString = data.rowData;
    //this.modalService.lgModal.show()
      //const modalRef = this.modalService.show(ModalContentComponent,{initialState});
      //modalRef.componentInstance.my_modal_title = 'I your title';
      //modalRef.componentInstance.my_modal_content = 'I am your content';
    
    //this.modalRef = this.modalService.show('bs-modal',{initialState});
    /*
    const initialState = {
      list: [requestString.request],
      title: requestString.stepName
    };
    this.modalRef = this.modalService.show(ModalContentComponent,
       Object.assign({initialState}, { class: 'test' }, ));
    this.modalRef.content.closeBtnName = 'Close'; */

  }
  copied(event: Event, type: string){
    if(event["isSuccess"]) {
      if(type == 'request') this.toastr.success('Request has been copied');
      else if(type == 'response') this.toastr.success('Response has been copied');
    }else{
      this.toastr.error('Copy failed');
    }
  }
  formatXml(xml: string) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    $.each(xml.split('\r\n'), function(index: any, node: any) {
        var indent = 0;
        if (node.match( /.+<\/\w[^>]*>$/ )) {
            indent = 0;
        } else if (node.match( /^<\/\w/ )) {
            if (pad != 0) {
                pad -= 1;
            }
        } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
            indent = 1;
        } else {
            indent = 0;
        }
        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }
        formatted += padding + node + '\r\n';
        pad += indent;
    });
    return formatted;
  }
  triggerBackScreen(){
    this.triggerBack.emit('process-log-details');
  }
}
