import { Component, OnInit, Input, Pipe, PipeTransform, Output, EventEmitter } from '@angular/core';
import { CustomSearchService } from './../service/custom-search.service';
import moment from 'moment';

@Component({
  selector: 'app-custom-search-results',
  templateUrl: './custom-search-results.component.html',
  styleUrls: ['./custom-search-results.component.css']
})
export class CustomSearchResultsComponent implements OnInit {
  @Input() isAdvSrchTtlRecCountAvail: boolean;
  @Input() isShowAdvSearchResultsForCont: boolean;
  @Input() ADVANCED_DOC_SEARCH: any;
  @Input() ADVANCED_DOC_SEARCH_RESULTS: any;
  @Input() advanceSearchTotalRecords: number;
  @Input() defaultDateTimeFormat: string;
  @Output() invokeOnAdvSearchChangePage =  new EventEmitter<any>();
  @Output() invokeShowInLanding = new EventEmitter<any>();
  @Output() invokeShowrestoreFolderDlg = new EventEmitter<any>();
  @Output() invokeShowrestoreDocumentDlg = new EventEmitter<any>();
  @Output() invokeShowhdFolderDlg = new EventEmitter<any>();
  @Output() invokeShowhdDocumentDlg = new EventEmitter<any>();
  

  constructor( public customSearchService: CustomSearchService ) { }

  checkFilterTrue(type: string, value: string, dateField?: string){
    if(this.customSearchService.advSearchResultsFilterObject[type] == value){
      return true;
    }else{
      return false;
    }
  };

  setSearchFilter(type: string, value: string, dateField: string){
    let advSearchResultsFilterObject = this.customSearchService.advSearchResultsFilterObject;
    if(dateField != undefined){
      if(value != "THIS_MONTH"){
        var field1 = dateField+"_THIS_MONTH";
        if(advSearchResultsFilterObject[field1] != undefined){
          delete advSearchResultsFilterObject[field1];
        }
      }
      if(value != "LAST_SIX_MONTH"){
        var field2 = dateField+"_LAST_SIX_MONTH";
        if(advSearchResultsFilterObject[field2] != undefined){
          delete advSearchResultsFilterObject[field2];
        }
      }
      if(value != "THIS_YEAR"){
        var field3 = dateField+"_THIS_YEAR";
        if(advSearchResultsFilterObject[field3] != undefined){
          delete advSearchResultsFilterObject[field3];
        }
      }
    }
    if(advSearchResultsFilterObject[type] != undefined && advSearchResultsFilterObject[type] != value){
      advSearchResultsFilterObject[type] = value;
    }else if(advSearchResultsFilterObject[type] == undefined){
      advSearchResultsFilterObject[type] = value;
    }else{
      delete advSearchResultsFilterObject[type];
    }
    this.customSearchService.isEnableclearAdvSearch = Object.keys(advSearchResultsFilterObject).length > 0;
  };

  onAdvSearchChangePage(pageObj: any){
    this.invokeOnAdvSearchChangePage.emit(pageObj);
  }

  showrestoreFolderDlg(data: any){
    this.invokeShowrestoreFolderDlg.emit(data);
  }

  showrestoreDocumentDlg(data: any){
    this.invokeShowrestoreDocumentDlg.emit(data);
  }

  showhdFolderDlg(data: any){
    this.invokeShowhdFolderDlg.emit(data);
  }

  showhdDocumentDlg(data: any){
    this.invokeShowhdDocumentDlg.emit(data);
  }

  getDateString(timestamp: any){
    if(typeof timestamp == 'string') timestamp = parseInt(timestamp);
    return moment(timestamp).format(this.defaultDateTimeFormat);
  };

  showInLanding(result: any){
    this.invokeShowInLanding.emit(result);
  };

  ngOnInit() { }

}

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: Array<any>, filter: {[key: string]: any }): Array<any> {
        if(!items) return [];
        if(!filter) return items;
        return items.filter(item => {
            let noMatchField = Object.keys(filter)
                                        .find(key => {
                                          if(filter[key]) return item[key] !== filter[key];
                                        });
            return !noMatchField
        });
    }
}