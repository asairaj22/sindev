import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-document-admin',
  templateUrl: './document-admin.component.html',
  styleUrls: ['./document-admin.component.css', './../document-management.module.css'],
  encapsulation: ViewEncapsulation.None
})
export class DocumentAdminComponent implements OnInit {
  showTabComponent: string;
  constructor() { }

  ngOnInit() {
    this.showTabComponent = 'manage-tags';
  }
}
