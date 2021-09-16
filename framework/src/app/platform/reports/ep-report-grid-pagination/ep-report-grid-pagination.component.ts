import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import paginate from 'jw-paginate';

@Component({
  selector: 'ep-report-grid-pagination',
  templateUrl: './ep-report-grid-pagination.component.html',
  styleUrls: ['./ep-report-grid-pagination.component.css']
})

export class EpReportGridPaginationComponent implements OnInit{
  @Input() items: Array<any>;
  @Output() changePage = new EventEmitter<any>(true);
  @Input() initialPage: number;
  @Input() pageSize: number;
  @Input() maxPages: number;
  @Input() secObj: any;

  pager: any = {};

  ngOnInit() {
    this.pageSize = this.pageSize || 10;
    this.initialPage = (this.secObj.paginationDetails || {}).currentPageNumber || 1;
    this.maxPages = this.maxPages || 10;

    // set page if items array isn't empty
    if (this.items && this.items.length) {
      this.setPage(this.initialPage);
    }
  }

  public setPage(page: number) {
    // get new pager object for specified page
    this.pager = paginate(this.items.length, page, Number(this.pageSize), this.maxPages);

    // get new page of items from items array
    var pageOfItems = this.items.slice(this.pager.startIndex, this.pager.endIndex + 1);

    // call change page function in parent component
    this.changePage.emit({pageOfItems, secObj: this.secObj, pager: this.pager});
  }
}