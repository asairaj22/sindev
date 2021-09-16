import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ManageSubscriptionService } from '../service/manage-subscription.service';
import { SidenavService } from '../service/sidenav.service';
import { DomainService } from '../service/domain.service';
import { ApiService } from '../../util/api.service';
declare var $: any;

@Component({
  selector: 'notification-admin',
  templateUrl: './notification-admin.component.html',
  styleUrls: ['./notification-admin.component.css', '../notification.module.css']
})
export class NotificationAdminComponent implements OnInit {


  constructor(
    private modalService: NgbModal,
    private nav: SidenavService,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private subscriptionService: ManageSubscriptionService,
    private domainService: DomainService) { }

  ngOnInit() {

  }


}
