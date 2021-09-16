import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild, ChangeDetectorRef, KeyValueDiffers } from '@angular/core';
import { ReportsService } from '../service/reports.service';
import { ThemeBuilderService } from '../service/theme-builder.service';
import { EpReportGridPaginationComponent } from './../ep-report-grid-pagination/ep-report-grid-pagination.component';

@Component({
  selector: 'ep-report-matrix',
  templateUrl: './ep-report-matrix.component.html',
  styleUrls: ['./ep-report-matrix.component.css']
})
export class EpReportMatrixComponent implements OnInit {
  @ViewChild(EpReportGridPaginationComponent, {static: false}) gridPaginationComponent: EpReportGridPaginationComponent;
  
  @Input() secObj: any;
  @Input() section_parent_index: any;
  @Output() invokeExecute: EventEmitter<any> = new EventEmitter();
  @Output() invokeApplySort: EventEmitter<any> = new EventEmitter();
  @Output() invokeApplyGlobalSearch: EventEmitter<any> = new EventEmitter();

  showNoDataFoundCont: boolean = false;
  private arrayDiffer: any;

  @HostListener("scroll", ['$event'])
  gridScrollEvent(event: Event) {
    let _elem: any = event.target;
    let previewHeader: any = _elem.previousElementSibling;
    previewHeader.style.marginLeft = (_elem.scrollLeft * -1) + "px";
    if(previewHeader.previousElementSibling != null && $(previewHeader.previousElementSibling).hasClass("grid-title-header")){
      previewHeader.previousElementSibling.style.marginLeft = (_elem.scrollLeft * -1) + "px";
    }
    let noRecordText: any = _elem.querySelector("table tbody td span[no-record-text]");
    if(noRecordText) noRecordText.style.left = parseInt(_elem.scrollLeft) + "px";
  }

  constructor( private reports: ReportsService, private themeBuilder: ThemeBuilderService, private cdr: ChangeDetectorRef, private kvDiffers: KeyValueDiffers ) { }

  ngOnInit() { 
    this.arrayDiffer = this.kvDiffers.find(this.secObj.filteredSectionRecords).create();
  }

  ngAfterViewChecked(){
    //your code to update the model
    this.cdr.detectChanges();
  }

  sort(secObj: any, keyname: string){
    if(secObj.reportType == "Matrix" && (secObj.lazyLoading || {}).needLazyLoading){
      secObj.sortKey = null;
    }
    this.invokeApplySort.emit(secObj);
  }

  getCellDetails(record: any, field: any, rowNum: any, colNum: any, filteredRecord: any){
		var data = record[field.mapping];
		var response: any = {data: data, colSpan: 1, rowSpan: 1, hide: false};
		if(field.hasOwnProperty("formatData")){
			try{
				if(field.formatData.scriptType == "JavaScript"){
					var language: string = sessionStorage.getItem("ep-lang") || "en";
          response = eval('(function execute(value, row, column, rowNum, columnNum, language, records){' + field.formatData.script + '})')(data, record, field, rowNum, colNum, language ,filteredRecord);
				}
			}catch(e){
				
				response = {data: data, colSpan: 1, rowSpan: 1, hide: false};
			}
		}
		return response;
  }
  
  onChangePage(paginationObj: any) {
    let secObj: any = paginationObj.secObj;
    let pager: any = paginationObj.pager;
    secObj.paginationDetails.currentPageNumber = pager.currentPage;
    let pageOfItems: Array<any> = paginationObj.pageOfItems;
    let lazyLoadingObject: object = secObj.lazyLoading || {}; 
    if( lazyLoadingObject['needLazyLoading'] && (pageOfItems.includes(null) || pageOfItems.includes(undefined)) ){
      var lazyLoadOffsetCount = (pager.currentPage - 1) * secObj.paginationDetails.itemsPerPage + 1;
      lazyLoadingObject['offset'] = lazyLoadOffsetCount;
      this.invokeExecute.emit({isToastrToSkip: null, isSubmit: true, lazyLoadingDetails: lazyLoadingObject});
    } else {
      // update current page of items
      this.secObj.filteredRecordsPerPage = pageOfItems;
    }
  }

  applyGlobalSearch(secObj: any){
    let paginationDetails: any = this.secObj.paginationDetails;
    paginationDetails.searchText = (secObj.searchTable || '').toLowerCase();
    paginationDetails.currentPageNumber = 1;
    this.invokeApplyGlobalSearch.emit(secObj);
  }

  setPage(currentPageNumber: number){
    this.cdr.detectChanges();
    this.gridPaginationComponent.setPage(currentPageNumber);
  }

  changePageSize(secObj: any){
    let paginationDetails: any = this.secObj.paginationDetails;
    paginationDetails.itemsPerPage = secObj.itemsPerPage;
    paginationDetails.currentPageNumber = 1;
    this.cdr.detectChanges();
    this.gridPaginationComponent.setPage(paginationDetails.currentPageNumber);
  }

  clearSearchText(){
    this.secObj.searchTable = '';
    this.applyGlobalSearch(this.secObj);
  }

  ngDoCheck() {
    const empArrayChanges = this.arrayDiffer.diff(this.secObj.filteredRecordsPerPage);
    if(empArrayChanges != null){
      if(empArrayChanges._records.size > 0){
        this.showNoDataFoundCont = false;
      }else{
        this.showNoDataFoundCont = true;
      }
    }
  }

}
