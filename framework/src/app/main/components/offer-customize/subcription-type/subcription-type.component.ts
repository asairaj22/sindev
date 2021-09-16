import { Component, OnInit, ElementRef,EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-subcription-type',
  templateUrl: './subcription-type.component.html',
  styleUrls: ['./subcription-type.component.css']
})
export class SubcriptionTypeComponent implements OnInit {

  radioSelected:boolean = true;
  @Output() subscriTypeOutput = new EventEmitter<any>();
  
  data = ["1","2"]

  constructor(private  elemRef: ElementRef) { }

  ngOnInit() { 
	
  }

  subscriTypeChange(event){
    this.radioSelected = false;
  }

  proceedBtn(){
    this.subscriTypeOutput.emit(this.data);
    
  }

}