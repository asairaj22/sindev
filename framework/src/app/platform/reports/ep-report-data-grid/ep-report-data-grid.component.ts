import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter, ViewChild, SimpleChanges, HostListener, IterableDiffers } from '@angular/core';
import { ReportsService } from '../service/reports.service';
import { ThemeBuilderService } from '../service/theme-builder.service';
import { EpReportGridPaginationComponent } from './../ep-report-grid-pagination/ep-report-grid-pagination.component';

@Component({
  selector: 'ep-report-data-grid',
  templateUrl: './ep-report-data-grid.component.html',
  styleUrls: ['./ep-report-data-grid.component.css']
})
export class EpReportDataGridComponent implements OnInit {
  @ViewChild(EpReportGridPaginationComponent, {static: false}) gridPaginationComponent: EpReportGridPaginationComponent;
  
  @Input() secObj: any;
  @Input() section_parent_index: any;
  @Output() invokeExecute: EventEmitter<any> = new EventEmitter();
  @Output() invokeApplyGlobalSearch: EventEmitter<any> = new EventEmitter();
  @Output() invokeApplySort: EventEmitter<any> = new EventEmitter();

  showNoDataFoundCont: boolean = false;
  private sectionId: string;
  private arrayDiffer: any;
  private pagerObj: any = {};

  @HostListener("scroll", ['$event'])
  gridScrollEvent(event: Event) {
    let _elem: any = event.target;
    let previewHeader: any = _elem.previousElementSibling;
    previewHeader.style.marginLeft = (_elem.scrollLeft * -1) + "px";
    if(previewHeader.previousElementSibling != null && $(previewHeader.previousElementSibling).hasClass("grid-title-header")){
      previewHeader.previousElementSibling.style.marginLeft = (_elem.scrollLeft * -1) + "px";
    }
    let previewFooter: any = _elem.nextElementSibling;
    if (previewFooter && $(previewFooter).hasClass("hierarchy-footer")) {
      previewFooter.style.marginLeft = (_elem.scrollLeft * -1) + "px";
    }
    let noRecordText: any = _elem.querySelector("table tbody td span[no-record-text]");
    if(noRecordText) noRecordText.style.left = parseInt(_elem.scrollLeft) + "px";
  }

  constructor( public reports: ReportsService, private themeBuilder: ThemeBuilderService, private cdr: ChangeDetectorRef, private iterable: IterableDiffers ) { }

  ngOnInit() {
    this.arrayDiffer = this.iterable.find(this.secObj.filteredSectionRecords).create();
    this.pagerObj = {startIndex: -1, endIndex: -1};
    if((this.secObj.filteredRecordsPerPage || []).length == 0) this.showNoDataFoundCont = true;
  }

  ngAfterViewChecked(){
    //your code to update the model
    this.cdr.detectChanges();
  }

  onChangePage(paginationObj: any) {
    let secObj: any = paginationObj.secObj;
    this.pagerObj = paginationObj.pager;
    secObj.paginationDetails.currentPageNumber = this.pagerObj.currentPage;
    let pageOfItems: Array<any> = paginationObj.pageOfItems;
    let lazyLoadingObject: object = secObj.lazyLoading || {}; 
    if( lazyLoadingObject['needLazyLoading'] && (pageOfItems.includes(null) || pageOfItems.includes(undefined)) ){
      var lazyLoadOffsetCount = (this.pagerObj.currentPage - 1) * secObj.paginationDetails.itemsPerPage + 1;
      lazyLoadingObject['offset'] = lazyLoadOffsetCount;
      this.invokeExecute.emit({isToastrToSkip: null, isSubmit: true, lazyLoadingDetails: lazyLoadingObject});
    } else {
      // update current page of items
      this.secObj.filteredRecordsPerPage = pageOfItems;
    }
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

  applyGlobalSearch(secObj: any){
    let paginationDetails: any = this.secObj.paginationDetails;
    paginationDetails.searchText = (secObj.searchTable || '').toLowerCase();
    paginationDetails.currentPageNumber = 1;
    this.invokeApplyGlobalSearch.emit(secObj);
  }

  clearSearchText(){
    this.secObj.searchTable = '';
    this.applyGlobalSearch(this.secObj);
  }

  sort(secObj: any, displayFieldObj: object) {
    this.reports.sortedDisplayFieldObject = displayFieldObj;
    let keyname = displayFieldObj['mapping'];
    if (secObj.reportType == "Matrix" && (secObj.lazyLoading || {}).needLazyLoading) {
      secObj.sortKey = null;
    } else {
      secObj.sortKey = keyname;   //set the sortKey to the param passed
      secObj.reverse = !secObj.reverse; //if true make it false and vice versa	
    }
    secObj.paginationDetails.currentPageNumber = 1;
    this.invokeApplySort.emit(secObj);
  }

  toggleEC(secObj:any, record:any) {
    const isExpanded = !record.epTreeInfo.isExpanded;
    record.epTreeInfo.isExpanded = isExpanded;
    const recursiveCheck = function(obj, parentObj) {
      if(parentObj && !isExpanded){
        obj.epTreeInfo.isHidden = true;
      }else if (isExpanded) {
        if (parentObj && ((!parentObj.epTreeInfo.isExpanded && !parentObj.epTreeInfo.isHidden) || parentObj.epTreeInfo.isHidden)) {
          obj.epTreeInfo.isHidden = true;
        } else {
          obj.epTreeInfo.isHidden = false;
        }
      }
      secObj.records
      .filter(function(_obj) {return (_obj.epTreeInfo.parentId == obj.epTreeInfo.id);})
      .forEach(function(_obj) {recursiveCheck(_obj, obj); });
    };
    recursiveCheck(record, null);
  }
  
  ngDoCheck() {
    const empArrayChanges = this.arrayDiffer.diff(this.secObj.filteredRecordsPerPage);
    if(empArrayChanges != null){
      if(empArrayChanges.length > 0){
        this.showNoDataFoundCont = false;
      }else{
        this.showNoDataFoundCont = true;
      }
    }
  }

}
