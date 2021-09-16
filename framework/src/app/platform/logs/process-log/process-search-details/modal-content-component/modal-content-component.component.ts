import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-modal-content-component',
  templateUrl: './modal-content-component.component.html',
  styleUrls: ['./modal-content-component.component.css'],
})
export class ModalContentComponent implements OnInit {

  title: string;
  closeBtnName: string;
  list: any[] = [];
 
  constructor(public bsModalRef: BsModalRef) {}
 
  ngOnInit() {
    //this.list.push('PROFIT!!!');
  }

}
