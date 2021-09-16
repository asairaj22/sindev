import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CustomSearchService } from './../service/custom-search.service';
import moment from 'moment';

@Component({
  selector: 'app-custom-search',
  templateUrl: './custom-search.component.html',
  styleUrls: ['./custom-search.component.css']
})
export class CustomSearchComponent implements OnInit {
  @Input() ADVANCED_DOC_SEARCH: any;
  @Input() DOCUMENTTYPE_LIST_Options: any;
  @Input() customSearchFor: string;
  @Output() invokeAdvancedSearch = new EventEmitter<any>();

  advanceSearchDatePickerSettings: object = {
    bigBanner: true,
    timePicker: true,
    format: 'YYYY-MM-DD HH:mm:ss',
    defaultOpen: false
  };
  
  constructor(private customSearchService: CustomSearchService ) { }

  setSearchType(label: string, value: string){
    this.ADVANCED_DOC_SEARCH = this.customSearchService.ADVANCED_DOC_SEARCH = { label, content: value, value };
    if(this.customSearchFor == 'deleted-items'){
      this.ADVANCED_DOC_SEARCH.pageTitle = 'Deleted Items';
      this.ADVANCED_DOC_SEARCH.pageMode = 'deleted';
    }else if(this.customSearchFor == 'advanced-search'){
      this.ADVANCED_DOC_SEARCH['pageMode'] = 'search'; 
      this.ADVANCED_DOC_SEARCH['pageTitle'] = 'Advanced Search';
    }
  };

  onAdvanceSearchDateSelect(event: any, type: string){
    let datetimeFormat = 'YYYY-MM-DD HH:mm:ss';
    let dateVal = moment(event).format(datetimeFormat);
    if(type == 'from'){
      $('#advanceSearchDatePickFrom .wc-date-container span').text(dateVal);
      if(moment(dateVal).format("x") != "Invalid date"){
        this.ADVANCED_DOC_SEARCH['fromDate'] = moment(dateVal).format("x");
        this.ADVANCED_DOC_SEARCH['fromDatePicked'] = dateVal;
      }
    }else{
      $('#advanceSearchDatePickTo .wc-date-container span').text(moment(event).format(datetimeFormat));
      if(moment(dateVal).format("x") != "Invalid date"){
        this.ADVANCED_DOC_SEARCH['toDate'] = moment(dateVal).format("x");
        this.ADVANCED_DOC_SEARCH['toDatePicked'] = dateVal;
      }
    }
  };

  advancedSearch(){
    this.invokeAdvancedSearch.emit();
  };

  ngOnInit() { }

}
