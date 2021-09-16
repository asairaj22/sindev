import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

// import * as eventsData from '../../util/data/events.json';
// import * as subDomainData from '../../util/data/sub-domain.json';
import { ApiService } from '../../util/api.service.js';
import { SubDomainService } from '../service/sub-domain.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EventsService } from '../service/events.service.js';
import { SidenavService } from '../service/sidenav.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css', '../notification.module.css']
})
export class EventsComponent implements OnInit {
  eventForm: FormGroup;
  eventsGridData: object[];
  subDomains: object[];
  subDomainsData: any;
  readOnly: boolean = false;
  ngMultiSelectDefaultSettings: object = {};
  ngMultiSelectSubdomain: object = {};
  columnDefs: object[];
  action: string;
  eventName: string;
  enabled: boolean;
  selectedItems: any;
  reqObj = {
    id: '',
    name: '',
    enabled: '',
    subdomainId: ''
  };
  selectedEvent: any;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private eventsService: EventsService,
    private subDomainService: SubDomainService,
    private nav: SidenavService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.nav.show();
    this.columnDefs = [
      { headerName: 'Name', field: 'name', sortable: true },
      { headerName: 'Enabled', field: 'enabled', sortable: true },
      { headerName: 'Action', sortable: false }
    ];
    this.initGridDetails();
    this.ngMultiSelectDefaultSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 7,
      allowSearchFilter: true,
      enableCheckAll: false,
      idField: 'id'
    };
    this.ngMultiSelectSubdomain = { ...this.ngMultiSelectDefaultSettings, ...{ idField: 'id', textField: 'name' } };
  }

  initGridDetails() {
    this.eventForm = this.formBuilder.group({
      name: ['', [Validators.required, this.eventNameValidator.bind(this)]],
      subdomainId: ['', Validators.required],
      enabled: [''],
      id: []
    });
    this.apiService.loaderShow('loader', 'Loading Subdomains...');
    this.eventsService.getEvents().subscribe(res => {
      this.eventsGridData = res.body._embedded.events;
      this.subDomainService.getSubDomains().subscribe(result => {
        this.subDomainsData = result.body._embedded.subdomains;
        this.apiService.loaderHide('loader');
      }, err => {
        
      });
    }, err => {
      
    });
  }

  eventNameValidator(input: FormGroup) {
    if(this.selectedEvent){
      return this.eventsGridData ? (this.eventsGridData.find(event => event['name'] === input.value) && input.dirty && this.selectedEvent.name !== input.value) ? { duplicateEventName: true } : null : true;
    }
    else{
      return this.eventsGridData ? (this.eventsGridData.find(event => event['name'] === input.value) && input.dirty) ? { duplicateEventName: true } : null : true;
    }
    
  }

  getRowData(content, rowData: any) {
    this.readOnly = true;
    const eventSubdomain: string = rowData.id;
    this.selectedEvent = rowData;
    this.apiService.loaderShow('loader', 'Loading...');
    this.eventsService.getEvent(rowData.id).subscribe(res => {
      this.selectedItems = [this.subDomainsData.find(subdomain => subdomain.id === res.body.subdomainId)][0]['id'];
      this.reqObj = rowData;
      this.eventForm.setValue({
        id: rowData.id,
        name: rowData.name,
        enabled: rowData.enabled,
        subdomainId: eventSubdomain
      });
      this.apiService.loaderHide('loader');
      this.openPopUp(content, 'Edit');
    }, err => {
      this.apiService.loaderHide('loader');
      this.toastr.error("Something went wrong");
      
    });
  }

  openPopUp(content, action: string) {
    if (action === 'Add') {
      this.eventForm.setValue({
        id: null,
        name: null,
        enabled: null,
        subdomainId: null
      });
      this.selectedItems = "";
      this.selectedEvent = null;
    }
    this.modalService.open(content, { windowClass: "event-popup" });
    this.action = action;
  }

  onSubmit() {
    if (this.eventForm.valid) {
      this.reqObj = {
        id: this.eventForm.value.id,
        subdomainId: this.eventForm.value.subdomainId,
        name: this.eventForm.value.name,
        enabled: this.eventForm.value.enabled
      };
      if (this.reqObj.id) {
        this.apiService.loaderShow('loader', 'Saving Event...');
        this.eventsService.updateEvent(this.reqObj).subscribe(res => {
          this.modalService.dismissAll();
          this.initGridDetails();
          this.apiService.loaderHide('loader');
          this.toastr.success("Updated Successfully");
        }, err => {
          this.apiService.loaderHide('loader');
          this.toastr.error("Something went wrong");
          
        });
      } else {
        this.apiService.loaderShow('loader', 'Updating Event...');
        this.eventsService.saveEvent(this.reqObj).subscribe(res => {
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
