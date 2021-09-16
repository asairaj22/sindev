import { Component, OnInit, Input } from '@angular/core';
import { onSideNavChange, animateText } from '../animations/animations';
import { Router } from '@angular/router';


@Component({
  selector: 'notification-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.css'],
  animations: [onSideNavChange, animateText]
})
export class LeftMenuComponent implements OnInit {
  public sideNavState: false;
  public linkText: false;
  public showNav: boolean;

  public appitems = [
    {
      label: 'Domains',
      link: '/notificationAdmin/domains',
    },
    {
      label: 'SubDomains',
      link: '/notificationAdmin/sub-domains',
    },
    {
      label: 'Events',
      link: '/notificationAdmin/notification-events',
    },
    {
      label: 'Template',
      items: [
        {
          label: 'Manage Templates',
          link: '/notificationAdmin/manage-template',
        },
        {
          label: 'Map Templates',
          link: '/notificationAdmin/map-template',
        }
      ]
    },
    {
       label: 'Manage Subscription',
       link: '/notificationAdmin/manage-subscription',
     	},
      {
        label: 'Notification Log',
       link: '/notificationAdmin/notification-log',
      }, 
      

  ];
  config = {
    paddingAtStart: true,
    interfaceWithRoute: true,
    classname: 'my-custom-class',
    listBackgroundColor: `rgb(255, 255, 255)`,
    fontColor: `rgb(8, 54, 71)`,
    backgroundColor: `rgb(255, 255, 255)`,
    selectedListFontColor: `#007bff`,
    selectedListBackground: '#007bff',
    highlightOnSelect: true,
    collapseOnSelect: true,
    rtlLayout: false
  };

  constructor(private router: Router) { }

  ngOnInit() {
  }

  selectedItem(eve) {
    this.router.navigate([eve.link]);
  }
}
