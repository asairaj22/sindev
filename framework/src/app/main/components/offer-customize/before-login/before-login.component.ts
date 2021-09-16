import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-before-login',
  templateUrl: './before-login.component.html',
  styleUrls: ['./before-login.component.css']
})
export class BeforeLoginComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }
  navigate(data: string) {
    if (data == 'login') {
      this.router.navigate(['/auth/login']);
    } else if (data == 'create-account') {
      this.router.navigate(['/auth/sign-up']);
    }
  }
}