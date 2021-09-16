import { Component, OnInit, Input, AfterViewInit, ElementRef } from '@angular/core';
import { DL_DATE_TIME_DISPLAY_FORMAT } from 'angular-bootstrap-datetimepicker';
import { ReportsService } from './../../service/reports.service';
import { DateButton } from 'angular-bootstrap-datetimepicker';
import { unitOfTime } from 'moment';
import moment from 'moment';

declare var $: any;

@Component({
  selector: 'ep-report-year-picker',
  templateUrl: './ep-report-year-picker.component.html',
  styleUrls: ['./ep-report-year-picker.component.css'],
  providers: [{ provide: DL_DATE_TIME_DISPLAY_FORMAT, useValue: "YYYY"}]
})
export class EpReportYearPickerComponent implements OnInit, AfterViewInit {
  @Input() widgetDetails: any;
  @Input() defaultValue: any;
  @Input() disabled: boolean;

  disablePastDates = false;
  enteredDate: any;
  private _isPickerOpen = false;
  private format: string;
  private formattedDateString: string;
  private widgetConfOptions: any = {};
  private currentElement: any;

  constructor(private _elementRef: ElementRef, private reports: ReportsService) { }

  ngOnInit(): void {
    this.currentElement = this._elementRef.nativeElement;
    this.format = "yyyy";
    this.formattedDateString = this.reports.getMomentDateFormat(this.format);
    if((this.widgetDetails.defaultValue || "") != ""){
     this.widgetConfOptions.defaultDate = moment(this.widgetDetails.defaultValue, this.formattedDateString);
    }
    if (this.widgetDetails.hasOwnProperty("dateRangeScript")) {
      this.reports.updateUserEnteredDateFieldOptions(this.widgetDetails, this.widgetConfOptions);
    }
    if(this.widgetConfOptions.defaultDate){
      this.enteredDate = this.widgetConfOptions.defaultDate;
    }
  }

  ngAfterViewInit(): void {
    const dropdownToggle = $('[data-toggle="dropdown"]', this._elementRef.nativeElement);
    dropdownToggle.parent().on('show.bs.dropdown', () => {
      this._isPickerOpen = true;
    });
    dropdownToggle.parent().on('hide.bs.dropdown', () => {
      this._isPickerOpen = false;
    });
  }


  /**
   * This filter `disables` dates that are invalid for selection.
   *
   * It returns `false` if the date is invalid for selection; Otherwise, `true`.
   *
   * Filters use ES6 syntax so the `this` context is fixed to this component.
   *
   * @param value
   *  the numeric value of the user entered date.
   */

  dateInputFilter = (value: (number | null)) => {
    return this.disablePastDates
      ? value >= moment().valueOf()
      : true;
  }

  /**
   * This filter `disables` dates that are invalid for selection.
   *
   * It returns `false` if the date is invalid for selection; Otherwise, `true`.
   *
   * Filters use ES6 syntax so the `this` context is fixed to this component.
   *
   * @param dateButton
   *  the target datebutton.
   *
   * @param viewName
   *  the current view.
   */

  datePickerFilter = (dateButton: DateButton, viewName: string) => {
    return this.disablePastDates
      ? dateButton.value >= moment().startOf(viewName as unitOfTime.StartOf).valueOf()
      : true;
  }

  /**
   * Used to keep the Bootstrap drop-down open while clicking on the date/time picker.
   *
   * Without this, the dropdown will close whenever the user clicks,
   * @param event
   *  the DOM click event.
   */

  keepDropDownOpen(event: Event) {
    event.stopPropagation();
  }

  /**
   * Close the Date drop-down when date is selected.
   *
   * Do not `toggle` the drop-down unless a value is selected.
   *
   * ngModel handles actually setting the start date value.
   *
   * @param event
   *  the `DlDateTimePickerChange` event.
   */

  dateSelected(event: any) {
    if (this._isPickerOpen && event.value) {
      $(this.currentElement).find('.year-picker-dropdown').dropdown('toggle');
    }
    if(event.value){
      let currentSelectedDate = moment(event.value).format(this.formattedDateString);
      if(this.widgetDetails.isRangeSelector){
        if(this.currentElement.getAttribute('id') == 'start-time'){
            this.widgetDetails.enteredValue[0] = currentSelectedDate;
        }else if(this.currentElement.getAttribute('id') == 'end-time'){
            this.widgetDetails.enteredValue[1] = currentSelectedDate;
        }
      }else{
          this.widgetDetails.enteredValue = currentSelectedDate;
      }
    }
  }

}
