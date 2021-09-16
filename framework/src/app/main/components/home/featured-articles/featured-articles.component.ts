import { Component, OnInit, ElementRef } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-featured-articles',
  templateUrl: './featured-articles.component.html',
  styleUrls: ['./featured-articles.component.css']
})
export class FeaturedArticlesComponent implements OnInit {

  featArticles:any;

  constructor( private  elemRef: ElementRef,private appService: AppService) {
   
  }

  ngOnInit() { 
    //reading the value from other components by subscribing to their subjects
    this.appService.featuredArticlesSubject.subscribe(
      data => {
        this.featArticles = data;

        //not required right now since its only way emitting value from dashboard to header menu
        //emitting value to parent component using event emitter
        // this.myOutputVal.emit(this.myInputVal + ' from child.');
      }
    );
  }

}