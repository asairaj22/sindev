import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css']
})
export class ResourcesComponent implements OnInit {

  constructor() { }

  ngOnInit() { 
	// this.ApiService.init(this.elemRef.nativeElement.tagName.toLowerCase());
  }

}