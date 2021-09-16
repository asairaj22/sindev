import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { SidenavService } from '../service/sidenav.service';
import { ApiService } from '../../util/api.service';
import { DomainService } from '../service/domain.service';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { SubDomainService } from '../service/sub-domain.service';
import { EventsService } from '../service/events.service';
import { NotificationLogService } from '../service/notification-log.service';
import { NotificationHistoryActionComponent } from './notification-history-action/notification-history-action.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-notification-log',
  templateUrl: './notification-log.component.html',
  styleUrls: ['./notification-log.component.css', '../notification.module.css']
})
export class NotificationLogComponent implements OnInit {

  @ViewChild("ViewContent", { static: false }) viewContent: ElementRef;
  @ViewChild("resendView", { static: false }) resendView: ElementRef;

  columnDefs: any;
  DOMAINS: object[];
  customRangeSettings: object = {};
  defaultDateTimeFormat: string = '';
  SEARCHCRITERIA: any;
  SEARCH_NOTIFICATION_HISTORY_output: any;
  frameworkComponents: any;
  domLayout: any;
  selectedRow: any;
  pageSize: any;
  gridApi: any;
  searchText: any;
  startTimePicked: string;
  endTimePicked: string;
  context: any;

  constructor(
    private nav: SidenavService,
    private apiService: ApiService,
    private domainService: DomainService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private subDomainService: SubDomainService,
    private eventService: EventsService,
    private notificationLogService: NotificationLogService
  ) {
    this.frameworkComponents = {
      historyAction: NotificationHistoryActionComponent
    }
  }

  ngOnInit() {
    this.nav.show();
    this.initGridDetails();
    this.setCustomRangeDatePickerSettings();
    this.domLayout = 'autoHeight';
    this.pageSize = 10;
    this.SEARCHCRITERIA = {
      domainId: undefined,
      subdomainId: undefined,
      eventId: undefined,
      sent: true,
      startTimePicked: undefined,
      endTimePicked: undefined,
      primaryRecipients: undefined,
      cc: undefined,
      bcc: undefined
    }
  }

  onGridReady(params) {
    this.gridApi = params.api;
  }

  /**
   * To init grid details
   */
  initGridDetails() {

    this.columnDefs = [
      { headerName: 'Event', field: 'subject', sortable: true },
      { width: 150, headerName: 'Sent', field: 'sent', sortable: true },
      { headerName: 'Sent on', field: 'createdDate', sortable: true },
      { width: 255, headerName: 'To', field: 'primaryRecipients', sortable: true },
      {
        width: 150, headerName: 'Actions', cellRenderer: 'historyAction',
        cellRendererParams: {
          onClick: this.onAction.bind(this),
        }
      }
    ];
    this.getDomains();
    this.SEARCH_NOTIFICATION_HISTORY_output = [];
  }

  /**
   * To open the popup depends on the selected action
   * @param rowData Selected row data
   * @param type view/resend
   */
  onAction(rowData, type) {
    this.selectedRow = rowData.data;
    if (type == 'view') {
      this.modalService.open(this.viewContent, { windowClass: "view-content-popup" });
    } else if (type == 'resend') {
      this.modalService.open(this.resendView, { windowClass: "resend-popup" });
    }
  }

  /**
   * To get the domains
   */
  getDomains() {
    this.domainService.getDomains().subscribe(res => {
      this.DOMAINS = res.body._embedded.domains;
    }, err => {
      this.toastr.error("Unable to fetch Domains");
      
    });
  }

  /**
   * To set date picker configurations
   */
  setCustomRangeDatePickerSettings() {
    this.customRangeSettings = {
      bigBanner: true,
      timePicker: true,
      format: this.defaultDateTimeFormat.replace(new RegExp('Y', 'gi'), 'y').replace(new RegExp('D', 'gi'), 'd'),
      defaultOpen: false
    }
  }

  /**
   * 
   * @param event Selected date event from date picker
   * @param type type of the date picker
   */
  onDateSelect(event, type) {
    this.defaultDateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
    if (type === 'start-time') {
      $('#start-time .wc-date-container span').text(moment(event).format(this.defaultDateTimeFormat));
      this.SEARCHCRITERIA['startTimePicked'] = moment(event).format(this.defaultDateTimeFormat);
      this.SEARCHCRITERIA['startTime'] = new Date(this.SEARCHCRITERIA['startTimePicked']).getTime();
    } else {
      $('#end-time .wc-date-container span').text(moment(event).format(this.defaultDateTimeFormat));
      this.SEARCHCRITERIA['endTimePicked'] = moment(event).format(this.defaultDateTimeFormat);
      this.SEARCHCRITERIA['endTime'] = new Date(this.SEARCHCRITERIA['endTimePicked']).getTime();
    }
  }

  /**
   * To get the subdomain under the selected domain
   * @param domainId Selected domain id
   * @param type request object
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
        this.toastr.error("Unable to fetch Subdomains");
      });
    }
  }

  /**
   * To select the event under the selected Subdomain
   * @param subdomainId Selected subdomain id
   * @param type request object
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
      }, err => {
        this.apiService.loaderHide('loader');
        this.toastr.error("Unable to fetch Events");
      });
    }
  }

  /**
   * To get the notification history data depends on the data
   */
  searchNotificationHistory() {
    this.apiService.loaderShow('loader', 'Loading...');
    this.notificationLogService.getNotifications(this.SEARCHCRITERIA).subscribe(resp => {
      this.apiService.loaderHide('loader');
      this.SEARCH_NOTIFICATION_HISTORY_output = resp.body;
    }, err => {
      this.apiService.loaderHide('loader');
    });
  }

  /**
   * To clear the all the search critierias
   */
  clearNotificationHistory() {
    this.SEARCHCRITERIA = {};
    $('#start-time .wc-date-container span').text("");;
    $('#end-time .wc-date-container span').text("");
  }

  /**
   * To resend the email
   */
  resendNotification() {
    this.apiService.loaderShow('loader', 'Loading...');
    this.notificationLogService.resendNotification(this.selectedRow).subscribe(resp => {
      this.apiService.loaderHide('loader');
      this.modalService.dismissAll();
      this.toastr.success("Email sent Successfully");
    }, err => {
      this.apiService.loaderHide('loader');
      this.toastr.error("Something went wrong");
      
    })
  }

  /**
   * To change the pagination depends on the size
   */
  onPageSizeChanged() {
    this.gridApi.paginationSetPageSize(Number(this.pageSize));
  }

  /**
   * To search the related record in datagrid
   */
  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.searchText);
  }
}