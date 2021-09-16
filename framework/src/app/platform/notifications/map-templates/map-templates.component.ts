import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../util/api.service';
import { DomainService } from '../service/domain.service';
import { SubDomainService } from '../service/sub-domain.service';
import { EventsService } from '../service/events.service';
import { ManageTemplateService } from '../service/manage-template.service';
import { MapTemplateService } from '../service/map-template.service';
import { SidenavService } from '../service/sidenav.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-map-templates',
  templateUrl: './map-templates.component.html',
  styleUrls: ['./map-templates.component.css', '../notification.module.css']
})
export class MapTemplatesComponent implements OnInit {

  columnDefs: any;
  maptemplatesGridData: object[];
  DOMAINS: object[];

  mapTemplateForm: FormGroup;
  action: string;
  ngMultiSelectDefaultSettings: object = {};
  ngMultiSelectDomains: object = {};
  ngMultiSelectSubdomains: object = {};
  ngMultiSelectEvents: object = {};
  ngMultiSelectTemplates: object = {};

  NOTIFICATION_TEMPLATE: any;
  GET_ALL_NOTIFICATION_TEMPLATES_output: any;
  

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private apiService: ApiService,
    private nav: SidenavService,
    private domainService: DomainService,
    private subDomainService: SubDomainService,
    private eventService: EventsService,
    private templateService: ManageTemplateService,
    private mapTemplateService: MapTemplateService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.nav.show();
    this.ngMultiSelectDefaultSettings = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 7,
      allowSearchFilter: true,
      enableCheckAll: true,
      idField: 'id'
    };
    this.columnDefs = [
      { headerName: 'Subject', field: 'subject', sortable: true },
      { headerName: 'Language', field: 'language', sortable: true },
      { headerName: 'Type', field: 'templateType', sortable: true },
      { headerName: 'Enabled', field: 'enabled', sortable: true },
      { headerName: 'Action', sortable: false }
    ];
    this.initGridDetails();
    this.ngMultiSelectEvents = { ...this.ngMultiSelectDefaultSettings, ...{ idField: 'id', textField: 'name' } };
    this.ngMultiSelectDomains = { ...this.ngMultiSelectDefaultSettings, ...{ idField: 'id', textField: 'name' } };
    this.ngMultiSelectSubdomains = { ...this.ngMultiSelectDefaultSettings, ...{ idField: 'id', textField: 'name' } };
    this.ngMultiSelectTemplates = { ...this.ngMultiSelectDefaultSettings, ...{ idField: 'id', textField: 'subjectFile' } };
  }

  /*
  * To initialize the Grid
  */
  initGridDetails() {
    this.mapTemplateForm = this.formBuilder.group({
      domainid: ['', Validators.required],
      subdomainid: ['', Validators.required],
      eventid: ['', Validators.required],
      templateid: ['', Validators.required],
      enabled: [false],
      id: ['']
    });
    this.apiService.loaderShow('loader', 'Loading Templates..');
    this.domainService.getDomains().subscribe(res => {
      console.log("Domains", res);
      this.DOMAINS = res.body._embedded.domains;
      this.apiService.loaderHide('loader');
    }, err => {
      this.apiService.loaderHide('loader');
      this.toastr.error("Unable to fetch Domains");
      
    });
    this.mapTemplateService.getTemplates().subscribe(res => {
      this.GET_ALL_NOTIFICATION_TEMPLATES_output = res.body._embedded.notificationTemplates;
    }, err=>{
      this.toastr.error("Unable to fetch Templates");
      
    });
  }

  /*
  * To Create Map Template
  */
  createMapTemplate(content, action) {
    this.NOTIFICATION_TEMPLATE = {
      "epAccountName": this.apiService.accountName,
      "epAppName": this.apiService.appName,
      "domainId": "",
      "subDomainId": "",
      "eventId": "",
      "enabled": true,
      "body": "",
      "templateType": "message"
    };
    this.openPopUp(content, action);
  }

  /*
  * To Open the model popup
  */
  openPopUp(content, action) {
    this.modalService.open(content, { windowClass: "map-template-popup" });
    this.action = action;
  }

   /*
  * To Set the data while editing
  */
  getRowData(content, template: any) {
    this.NOTIFICATION_TEMPLATE = template;
    this.getSubdomains(template.domainId, this.NOTIFICATION_TEMPLATE);
    this.getEvents(template.subDomainId, this.NOTIFICATION_TEMPLATE);
    this.getTemplate(template.eventId, this.NOTIFICATION_TEMPLATE);
    this.openPopUp(content, 'Edit');
  }

   /*
  * To Save the created template
  */
  onSubmit(form) {
    let _this = this;
    if (!this.NOTIFICATION_TEMPLATE.body || this.NOTIFICATION_TEMPLATE.body == "") {
      _this.toastr.error('Please Select required fields');
      return;
    }
    var filtered = this.GET_ALL_NOTIFICATION_TEMPLATES_output.filter(function (value) {
      return value.eventId === _this.NOTIFICATION_TEMPLATE.eventId && value.body === _this.NOTIFICATION_TEMPLATE.body;
    });

    if (this.action == 'Edit' && filtered.length > 1) {
      this.toastr.error('Template already mapped to this account');
      return;
    } else if (!(this.action == 'Edit') && filtered.length > 0) {
      this.toastr.error('Template already mapped to this account');
      return;
    }
    let request = this.NOTIFICATION_TEMPLATE;
    this.apiService.loaderShow('loader', 'Loading...');
    this.mapTemplateService.saveMapTemplate(request).subscribe(res => {
      this.modalService.dismissAll();
      this.initGridDetails();
      this.apiService.loaderHide('loader');
      if(this.action == 'Edit'){
        this.toastr.success("Updated Successfully");
      }else{
        this.toastr.success("Saved Successfully");
      }
    }, err => {
      this.apiService.loaderHide('loader');
      this.toastr.error("Something went wrong");
      
    });
  }

  /*
  * To Get the Subdomain related to the given domain
  */
  getSubdomains(domainId, type) {
    type.SUBDOMAINS = [];
    if (domainId && domainId.trim() != "") {
      this.apiService.loaderShow('loader', 'Loading...');
      this.subDomainService.getSubdomain(domainId).subscribe(resp => {
        if (resp.body) {
          var output = resp.body;
          if (output.hasOwnProperty("_embedded")) {
            var outputData = output["_embedded"];
            if (outputData.hasOwnProperty("subdomains")) {
              var subdomainList = outputData["subdomains"];
              for (var i = 0; i < subdomainList.length; i++) {
                var obj = {};
                obj["type"] = "option";
                obj["id"] = subdomainList[i].id;
                obj["name"] = subdomainList[i].name;
                type.SUBDOMAINS.push(obj);
              }
            }
          }
        }
        this.apiService.loaderHide('loader');
      }, err =>{
        this.apiService.loaderHide('loader');
        this.toastr.error("Unable to fetch Subdomains");
      });
    }
  }

  /*
  * To Get the Events related to the given subdomain
  */
  getEvents(subdomainId, type) {
    type.EVENTS = [];
    if (subdomainId && subdomainId.trim() != "") {
      var obj = {};
      obj["subdomainId"] = subdomainId;
      this.apiService.loaderShow('loader', 'Loading...');
      this.eventService.getEventById(subdomainId).subscribe(resp => {
        if (resp.body) {
          var output = resp.body;
          if (output.hasOwnProperty("_embedded")) {
            var outputData = output["_embedded"];
            if (outputData.hasOwnProperty("events")) {
              var eventsList = outputData["events"];
              for (var i = 0; i < eventsList.length; i++) {
                var obj = {};
                obj["type"] = "option";
                obj["id"] = eventsList[i].id;
                obj["name"] = eventsList[i].name;
                type.EVENTS.push(obj);
              }
            }
          }
        }
        this.apiService.loaderHide('loader');
      }, err =>{
        this.apiService.loaderHide('loader');
        this.toastr.error("Unable to fetch Events");
      });
    }
  }

  /*
  * To Get the Template related to the selected event
  */
  getTemplate(eventId, type) {
    type.TEMPLATES = [];
    if (eventId && eventId.trim() != "") {
      this.apiService.loaderShow('loader', 'Loading...');
      this.templateService.getTemplateById(eventId).subscribe(resp => {
        if (resp.body) {
          var output = resp.body;
          if (output.hasOwnProperty("_embedded")) {
            var outputData = output["_embedded"];
            if (outputData.hasOwnProperty("messageTemplates")) {
              var messageTemplatesList = outputData["messageTemplates"];
              for (var i = 0; i < messageTemplatesList.length; i++) {
                var obj = {};
                obj["type"] = "option";
                obj["id"] = messageTemplatesList[i].id;
                obj["name"] = messageTemplatesList[i].subjectFile;
                obj["lang"] = messageTemplatesList[i].lang;
                obj["subjectFile"] = messageTemplatesList[i].subjectFile;
                type.TEMPLATES.push(obj);
              }
            }
          }
        }
        this.apiService.loaderHide('loader');
      }, err =>{
        this.apiService.loaderHide('loader');
        this.toastr.error("Unable to fetch Templates");
      });
    }
  }

  /*
  * To Set the language and subject for the selected/created row
  */
  setTemplateData(template) {
    var templateArr = template.TEMPLATES;
    var id = template.body;
    var filtered = templateArr.filter(function (value) {
      return value.id === id;
    });
    if (filtered.length > 0) {
      template.subject = filtered[0].subjectFile;
      template.language = filtered[0].lang;
    } else {
      template.subject = "";
      template.language = "";
    }
  }

}
