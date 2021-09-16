import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-transaction-log-details',
  templateUrl: './transaction-log-details.component.html',
  styleUrls: ['./transaction-log-details.component.css']
})
export class TransactionLogDetailsComponent implements OnInit {
  @Input() transactionDetailsData: any;
  @Output() triggerBack = new EventEmitter<any>();
  parsedTransactionRequestObject: any;
  private parsedTransactionRequestString: string;
  parsedTransactionResponseObject: any;
  private parsedTransactionResponseString: string;
  isJSONReq: boolean = false;
  isJSONResp: boolean = false;
  selectedNavMenu: string = 'transaction-details';

  constructor( private toastr: ToastrService ) { }


  ngOnInit() {
    $('.event-report-details-body').find('[href="#rawTransactionRequest"]').click();
    $('.event-report-details-body').find('[href="#rawTransactionResponse"]').click();
    const data = this.transactionDetailsData;
    if(data.hasOwnProperty("request") == true){
      var request =  data.request;
      request = this.parsedTransactionRequestObject = request.startsWith("<") == false ? JSON.parse(request) : request;
      if(typeof request == "string"){
        this.isJSONReq = false;
        this.parsedTransactionRequestString = this.formatXml(request);
      }else if(typeof request == "object"){
        this.isJSONReq = true;
        this.parsedTransactionRequestString = JSON.stringify(this.parsedTransactionRequestObject, null, "   ");
      }
    }else{
      this.parsedTransactionRequestString = 'NIL';
    }
    $('.event-report-details-body .event-details-tab-content #rawTransactionRequest').find('pre').text(this.parsedTransactionRequestString);
    if(data.hasOwnProperty("response") == true){
      var response = data.response;
      response = this.parsedTransactionResponseObject = response.startsWith("<") == false ? JSON.parse(response) : response;
      if(typeof response == "string"){
        this.isJSONResp = false;
        this.parsedTransactionResponseString = this.formatXml(response);
      }else if(typeof response == "object"){
        this.isJSONResp = true;
        this.parsedTransactionResponseString = JSON.stringify(this.parsedTransactionResponseObject, null, "   ");
      }
    }else{
      this.parsedTransactionResponseString = 'NIL';
    }
    $('.event-report-details-body .event-details-tab-content #rawTransactionResponse').find('pre').text(this.parsedTransactionResponseString);
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
    this.triggerBack.emit('transaction-log-details');
  }
}
