import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import paginate from 'jw-paginate';

@Component({
  //moduleId: module.id,
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})

export class PaginationComponent implements OnInit{
  @Input() totalRecords: number; 
  @Output() changePage = new EventEmitter<any>(true);
  @Input() initialPage: number;
  @Input() pageSize: number;
  @Input() maxPages: number;

  pager: any = {};

  ngOnInit() {
    // set page if items array isn't empty
    if (this.totalRecords != undefined) {
      this.setPage(this.initialPage);
    }
  }

  setPage(page: number) {
    // get new pager object for specified page
    this.pager = paginate(this.totalRecords, page, this.pageSize, this.maxPages);

    // call change page function in parent component
    this.changePage.emit(this.pager);
  }
}
