import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'


@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  visible: boolean;
  // With this subject you can save the sidenav state and consumed later into other pages.
  public sideNavState$: Subject<boolean> = new Subject();

  constructor() { this.visible = false;  }

  hide() { this.visible = false; }
  show() { this.visible = true; }

}
