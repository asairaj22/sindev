import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;

// import * as subDomainData from '../../util/data/sub-domain.json';

import { DomainService } from '../service/domain.service';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../util/api.service';
import { SidenavService } from '../service/sidenav.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.css', '../notification.module.css']
})
export class DomainsComponent implements OnInit {
  domainsData: any;
  columnDefs: object[];
  defaultColDef;
  domainValue: string;
  closeResult: string;
  action: string;
  domainForm: FormGroup;
  showPopup = false;
  reqObj = {
    name: '',
    id: ''
  };
  domainsObservable: any;
  selectedDomain: any;
  constructor(
    private modalService: NgbModal,
    private nav: SidenavService,
    private apiService: ApiService,
    private domainService: DomainService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService) {
  }

  initGridDetails() {
    this.apiService.loaderShow('loader', 'Loading Domains...');
    this.domainService.getDomains().subscribe(res => {
      this.domainsData = res.body._embedded.domains;
      this.apiService.loaderHide('loader');
    }, err => {
      
    });
    this.domainForm = this.formBuilder.group({
      name: ['', [Validators.required, this.domainNameValidator.bind(this)]]
    });
  }
  domainNameValidator(input: FormGroup) {
    if(this.selectedDomain){
      return this.domainsData ? (this.domainsData.find(domain => domain['name'] === input.value) && input.dirty && this.selectedDomain.name !== input.value) ? { duplicateUserName: true } : null : true;
    }else{
      return this.domainsData ? (this.domainsData.find(domain => domain['name'] === input.value) && input.dirty) ? { duplicateUserName: true } : null : true;
    }
    
  }
  ngOnInit() {
    this.nav.show();
    this.columnDefs = [
      { headerName: 'Name', field: 'name', sortable: true },
      { headerName: 'Action', field: 'edit', sortable: false }
    ];
    this.initGridDetails();
  }
  getRowData(content, rowData: any) {
    this.reqObj = rowData;
    this.domainForm.setValue({
      name: rowData.name
    });
    this.selectedDomain = rowData;
    this.openPopUp(content, 'Edit');
  }
  onSubmit() {
    if (this.domainForm.valid) {
      this.reqObj.name = this.domainForm.value.name;
      // if (this.domainsData.find(domain => domain['name'] === this.domainForm.value.name)) {
      //   this.toastr.error("Domain name already exists!");
      // } else {
      this.apiService.loaderShow('loader', 'Updating Domains...');
      if (this.reqObj.id) {
        this.domainService.updateDomain(this.reqObj).subscribe(res => {
          this.modalService.dismissAll();
          this.apiService.loaderHide('loader');
          this.toastr.success("Updated Successfully");
          this.initGridDetails();
        }, err => {
          this.toastr.error("Something went wrong");
          
        });
      } else {
        this.reqObj.id = null;
        this.domainService.saveDomain(this.reqObj).subscribe(res => {
          this.modalService.dismissAll();
          this.apiService.loaderHide('loader');
          this.toastr.success("Saved Successfully");
          this.initGridDetails();
        }, err => {
          this.toastr.error("Something went wrong");
          
        });
      }

    }
  }
  createDomain(content, action) {
    this.domainForm.setValue({
      name: null
    });
    this.selectedDomain = null;
    this.openPopUp(content, action);
  }
  openPopUp(content, action: string) {
    this.modalService.open(content, { windowClass: "domain-popup" });
    this.action = action;
  }

  onSelectionChanged(event: any){
    //TODO:
  }

}
