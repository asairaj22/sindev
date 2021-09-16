import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ManageSubscriptionService } from '../service/manage-subscription.service.js';
import { SidenavService } from '../service/sidenav.service';
import { DomainService } from '../service/domain.service';
import { ApiService } from '../../util/api.service';
import { SubDomainService } from '../service/sub-domain.service';
import { EventsService } from '../service/events.service';
import { ManageTemplateService } from '../service/manage-template.service';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-manage-subscription',
  templateUrl: './manage-subscription.component.html',
  styleUrls: ['./manage-subscription.component.css', '../notification.module.css']
})
export class ManageSubscriptionComponent implements OnInit {

  columnDefs: any;
  subscriptionForm: FormGroup;
  GET_ALL_SUBSCRIPTIONS_output: [];
  isSubscriptionEdit: boolean;
  SUBSCRIPTION_OBJECT: {};
  action: any;
  topics: any;
  DOMAINS: any;
  TOPICFRAME: { domainId: string; subDomainId: string; eventId: string; };

  constructor(
    private modalService: NgbModal,
    private nav: SidenavService,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private subscriptionService: ManageSubscriptionService,
    private subDomainService: SubDomainService,
    private eventService: EventsService,
    private templateService: ManageTemplateService,
    private domainService: DomainService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.nav.show();
    this.initGridDetails();
    this.getDomains();
  }

  /**
   * To Get the Domains
   */
  getDomains() {
    this.domainService.getDomains().subscribe(res => {
      this.DOMAINS = res.body._embedded.domains;
    }, err => {
      
    });
  }

  /**
   * To initialize the Grid data
   */
  initGridDetails() {
    this.columnDefs = [
      { headerName: 'Name', field: 'name', sortable: true },
      { headerName: 'Message Style', field: 'name', sortable: true },
      { headerName: 'Interval', field: 'name', sortable: true },
      { headerName: 'Enabled', field: 'name', sortable: true },
      { headerName: 'Push Mesage', field: 'name', sortable: true },
      { headerName: 'Action', field: 'action', sortable: false }
    ];
    this.subscriptionForm = this.formBuilder.group({
      name: ['', Validators.required],
      bcc: ['', [this.emailValidator.bind(this)]],
      cc: ['', [this.emailValidator.bind(this)]],
      primaryRecipients: ['', [this.emailValidator.bind(this)]],
      timeInterval: ['', Validators.required]
    });
    this.getSubscriptions()
  }


  /**
	 * To validate the given Email
	 */
  emailValidator(input: FormGroup) {
    var emailPattern = /([\w+\._%-]+@[\w+\.-]+\.[\w+]{2,4}[^,;\s])$/i;
    var isValidEmail = emailPattern.test(input.value);
    if (!isValidEmail && input.dirty && input.value !== "") {
      return { incorrectEmail: true };
    } else {
      return true;
    }
  }

  /**
   * To fetch all the Subscriptions
   */
  getSubscriptions() {
    this.apiService.loaderShow('loader', 'Loading...');
    this.subscriptionService.getSubscriptions().subscribe(res => {
      this.GET_ALL_SUBSCRIPTIONS_output = res.body._embedded.subscriptions ? res.body._embedded.subscriptions : [];
      this.apiService.loaderHide('loader');
    }, err => {
      this.apiService.loaderHide('loader');
      this.toastr.error("Unable to fetch Subscriptions");
    });
  }

  /**
   * To set the data for Edit functionality
   * @param content 
   * @param rowData 
   */
  getRowData(content, rowData: any) {

    this.action = 'Edit';
    this.SUBSCRIPTION_OBJECT = rowData;
    this.SUBSCRIPTION_OBJECT['topics'] = [];
    this.apiService.loaderShow('loader', 'Loading...');
    this.subscriptionService.getSubscriptionById(this.SUBSCRIPTION_OBJECT['id']).subscribe(resp => {
      if (resp.body) {
        var output = resp.body;
        if (output.hasOwnProperty("topics")) {
          var topics = output["topics"];
          if (topics.length < 1) {
            this.SUBSCRIPTION_OBJECT['topics'].push({
              "domainId": "",
              "subDomainId": "",
              "eventId": ""
            });
          } else {
            this.SUBSCRIPTION_OBJECT['topics'] = topics;
            for (var i = 0; i < topics.length; i++) {
              var topicObject = topics[i];
              this.getSubdomains(topicObject.domainId, this.SUBSCRIPTION_OBJECT['topics'][i]);
              this.getEvents(topicObject.subDomainId, this.SUBSCRIPTION_OBJECT['topics'][i]);
              this.getTemplate(topicObject.eventId, this.SUBSCRIPTION_OBJECT['topics'][i]);
              this.openPopUp(content, 'Edit');
            }
          }
        }
      }
      this.apiService.loaderHide('loader');
    }, err => {
      this.apiService.loaderHide('loader');
      this.toastr.error("Something went wrong");
      
    });

  }

  /**
   * To add new Subscription
   * @param content 
   * @param action To know whether it is for Add/Edit
   */
  addSubscription(content, action) {
    this.isSubscriptionEdit = false;
    this.SUBSCRIPTION_OBJECT = {};
    this.SUBSCRIPTION_OBJECT['userId'] = "";
    this.SUBSCRIPTION_OBJECT['messageStyle'] = "Message";
    this.SUBSCRIPTION_OBJECT['pushmessage'] = false;
    this.SUBSCRIPTION_OBJECT['enabled'] = true;
    this.SUBSCRIPTION_OBJECT['topics'] = [];
    this.SUBSCRIPTION_OBJECT['primaryRecipients'] = "";
    this.SUBSCRIPTION_OBJECT['cc'] = "";
    this.SUBSCRIPTION_OBJECT['bcc'] = "";
    this.TOPICFRAME = {
      "domainId": "",
      "subDomainId": "",
      "eventId": ""
    };
    this.SUBSCRIPTION_OBJECT['topics'].push(this.TOPICFRAME);
    this.openPopUp(content, action);
  }

  /**
   * To open the popup
   * @param content 
   * @param action To differentiate Add/Edit
   */
  openPopUp(content, action) {
    this.modalService.open(content, { windowClass: "manage-subscription-popup" });
    this.action = action;
  }

  /**
   * To save the Subscription
   * @param formName Form data
   */
  saveSubscription(formName) {
    var name = this.SUBSCRIPTION_OBJECT['name'];
    if (!name || name.trim() == "") {
      this.toastr.error('Name is empty')
      return;
    }

    var timeInterval = this.SUBSCRIPTION_OBJECT['timeInterval'];
    if (!timeInterval || timeInterval.trim() == "") {
      this.toastr.error('Interval is empty')
      return;
    }

    var filtered = this.GET_ALL_SUBSCRIPTIONS_output.filter(function (value) {
      return value['name'] === name;
    });

    if (this.action == 'Edit' && filtered.length > 0) {
      if (filtered.length != 1) {
        this.toastr.error('Subscription Name already exists');
        return;
      } else if (filtered.length == 1 && filtered[0]['id'] != this.SUBSCRIPTION_OBJECT['id']) {
        this.toastr.error('Subscription Name exists');
        return;
      }
    } else if (!(this.action == 'Edit') && filtered.length > 0) {
      this.toastr.error('Subscription Name exists');
      return;
    }

    let request = this.SUBSCRIPTION_OBJECT;
    this.apiService.loaderShow('loader', 'Loading...');
    this.subscriptionService.saveSubscription(request).subscribe(resp => {
      if (resp.body) {
        var output = resp.body;
        if (output.hasOwnProperty("id")) {
          this.toastr.success('Subscription Saved');
        }
        this.getSubscriptions();
      }
      this.apiService.loaderHide('loader');
    }, err => {
      this.apiService.loaderHide('loader');
      this.toastr.error("Something went wrong");
    });


  }


  /**
   * To Get the Subdomain related to the given domain
   * @param domainId Selected domain id
   * @param type object
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
      }, err => {
        this.apiService.loaderHide('loader');
        this.toastr.error("Something went wrong");
      });
    }
  }

  /**
   * To Get the Events related to the given subdomain
   * @param subdomainId Selected subdomain
   * @param type object
   */
  getEvents(subdomainId, type) {
    type.EVENTS = [];
    if (subdomainId && subdomainId.trim() != "") {
      var obj = {};
      obj["subdomainId"] = subdomainId;
      this.apiService.loaderShow('loader', 'Loading...');
      this.eventService.getEvent(subdomainId).subscribe(resp => {
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
      }, err => {
        this.apiService.loaderHide('loader');
        this.toastr.error("Something went wrong");
      });
    }
  }

  /**
   * To Get the Template related to the selected event
   * @param eventId Selected event id
   * @param type object
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
      }, err => {
        this.apiService.loaderHide('loader');
        this.toastr.error("Something went wrong");
      });
    }
  }

  /**
   * To add the entry under Topics
   */
  addTopicEntry() {
    this.SUBSCRIPTION_OBJECT['topics'].push({
      "domainId": "",
      "subDomainId": "",
      "eventId": ""
    });
  };

}
