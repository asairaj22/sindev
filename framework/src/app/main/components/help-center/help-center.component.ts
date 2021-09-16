import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-help-center',
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.css']
})
export class HelpCenterComponent implements OnInit {

  constructor() { }

  ngOnInit() { 
	// this.ApiService.init(this.elemRef.nativeElement.tagName.toLowerCase());
  }

}