import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubDomainService } from '../service/sub-domain.service.js';
import { DomainService } from '../service/domain.service';
import { ApiService } from '../../util/api.service';
import { SidenavService } from '../service/sidenav.service';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-sub-domains',
  templateUrl: './sub-domains.component.html',
  styleUrls: ['./sub-domains.component.css', '../notification.module.css']
})
export class SubDomainsComponent implements OnInit {
  subDomainsData: any;
  subdomainForm: FormGroup;
  ngMultiSelectSubDomain: object = {};
  ngMultiSelectDefaultSettings: object = {};
  columnDefs: any;
  action: string;
  SubdomainDomainData: any;
  editable = false;
  domains: any;
  selectedItems: any;
  reqObj = {
    domainId: '',
    name: '',
    url: '',
    id: ''
  };

  constructor(
    private formBuilder: FormBuilder,
    private nav: SidenavService,
    private modalService: NgbModal,
    private apiService: ApiService,
    private domainService: DomainService,
    private subDomainService: SubDomainService,
    private toastr: ToastrService
  ) { }


  ngOnInit() {
    this.nav.show();
    this.columnDefs = [
      { headerName: 'Name', field: 'name', sortable: true },
      { headerName: 'Action', field: 'edit', sortable: false },
    ];
    this.initGridDetails();
    this.selectedItems = "";
    this.ngMultiSelectDefaultSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 7,
      allowSearchFilter: true,
      enableCheckAll: false,
      idField: 'id'
    };
    this.ngMultiSelectSubDomain = { ...this.ngMultiSelectDefaultSettings, ...{ idField: 'id', textField: 'name' } };
  }

  initGridDetails() {
    this.subdomainForm = this.formBuilder.group({
      name: ['', Validators.required],
      domainId: ['', Validators.required],
      url: ['', Validators.required],
      id: ['']
    });
    this.apiService.loaderShow('loader', 'Loading Subdomains...');
    this.domainService.getDomains().subscribe(
      res => {
        this.domains = res.body._embedded.domains;
        this.subDomainService.getSubDomains().subscribe(result => {
          console.log(res);
          this.subDomainsData = result.body._embedded.subdomains;
          this.apiService.loaderHide('loader');
        }, err => {
          
        });
      }, err => {
        
      }
    );
  }

  getRowData(content, rowData: any) {
    this.subDomainService.getDomain(rowData.id).subscribe(res => {
      this.SubdomainDomainData = res;
      this.selectedItems = [this.domains.find(domain => domain.id === this.SubdomainDomainData.body.domainId)][0]['id'];
      this.subdomainForm.setValue({
        name: rowData.name,
        url: this.SubdomainDomainData.body.url,
        id: rowData.id,
        domainId: this.selectedItems

      });
      this.openPopUp(content, 'Edit');
    }, err => {
      this.toastr.error("Something went wrong");
      
    });

  }

  openPopUp(content, action: string) {
    if (action === 'New') {
      this.subdomainForm.setValue({
        name: null,
        url: null,
        id: null,
        domainId: null
      });
      this.selectedItems = "";
    }
    this.action = action;
    this.modalService.open(content, { windowClass: "sub-domain-popup" });
  }
  onItemSelect(eve) {
    console.log(eve);
  }

  onSubmit() {
    if (this.subdomainForm.valid) {
      this.reqObj = {
        domainId: this.subdomainForm.value.domainId,
        name: this.subdomainForm.value.name,
        url: this.subdomainForm.value.url,
        id: this.subdomainForm.value.id
      };
      this.apiService.loaderShow('loader', 'Loading...');
      if (this.reqObj.id) {
        this.subDomainService.updateSubDomain(this.reqObj).subscribe(res => {
          this.modalService.dismissAll();
          this.initGridDetails();
          this.apiService.loaderHide('loader');
          this.toastr.success("Updated Successfully");
        }, err => {
          this.apiService.loaderHide('loader');
          this.toastr.error("Something went wrong");
          
        });
      } else {
        this.subDomainService.saveSubDomain(this.reqObj).subscribe(res => {
          this.modalService.dismissAll();
          this.initGridDetails();
          this.apiService.loaderHide('loader');
          this.toastr.success("Saved Successfully");
        }, err => {
          this.apiService.loaderHide('loader');
          this.toastr.error("Something went wrong");
          
        });
      }
    }
  }

}
