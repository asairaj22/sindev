import { Component, OnInit, Input, forwardRef, ViewChild, AfterViewInit, Injector, ElementRef } from '@angular/core';
import { NgbTimeStruct, NgbDateStruct, NgbPopoverConfig, NgbPopover, NgbDatepicker, NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DateTimeModel } from './ep-report-date-time.model';
import { noop } from 'rxjs';
import { ReportsService } from './../../service/reports.service';
import { ReportTemplateService } from './../../service/report-template.service';
import moment from 'moment';

@Component({
    selector: 'ep-report-datetime-time-picker',
    templateUrl: './ep-report-date-time-picker.component.html',
    styleUrls: ['./ep-report-date-time-picker.component.scss'],
    providers: [
        DatePipe,
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EpReportDateTimePickerComponent),
            multi: true
        }
    ]
})
export class EpReportDateTimePickerComponent implements ControlValueAccessor, OnInit, AfterViewInit {
    @Input()
    dateString: string;
    @Input()
    widgetDetails: any;
    @Input()
    formCellDetails: any;
    @Input()
    defaultValue: string;
    
    @Input()
    hourStep = 1;
    @Input()
    minuteStep = 15;
    @Input()
    secondStep = 30;
    @Input()
    seconds = true;

    @Input()
    disabled: boolean;

    private showTimePickerToggle = false;
    inputDatetimeFormat: string = '';
    private formattedMomentDateString: string;
    private widgetConfOptions: any = {};
    private dateWidgetType: string;

    private datetime: DateTimeModel = new DateTimeModel();
    private firstTimeAssign = true;

    @ViewChild(NgbDatepicker, {static: false})
    private dp: NgbDatepicker;

    @ViewChild(NgbPopover, {static: false})
    private popover: NgbPopover;

    private onTouched: () => void = noop;
    private onChange: (_: any) => void = noop;

    ngControl: NgControl;

    constructor(private config: NgbPopoverConfig, private inj: Injector, private calendar: NgbCalendar, private elref: ElementRef, private reports: ReportsService, private report_template: ReportTemplateService ) {
        config.autoClose = 'outside';
        config.placement = 'bottom';
        config.container = 'body';
    }

    ngOnInit(): void {
        if(this.widgetDetails.widget == 'DateTime Picker' || this.widgetDetails.type == 'DateTime' || this.widgetDetails.type == 'CustomDateTime'){
            this.dateWidgetType = 'DATETIME';
        }else if(this.widgetDetails.widget == 'Date Picker' || this.widgetDetails.type == 'Date' || this.widgetDetails.type == 'CustomDate'){
            this.dateWidgetType = 'DATE';
        }
        let currentElement: any = this.elref.nativeElement;
        if(this.formCellDetails){
            if( this.widgetDetails.type == 'CustomDateTime' ||  this.widgetDetails.type == 'CustomDate' ){
                this.inputDatetimeFormat = this.widgetDetails.dateWidgetFormat || '';
            }
            this.inputDatetimeFormat = this.reports.updateInputDateTimeFormat(this.dateWidgetType, this.inputDatetimeFormat);
            if(this.widgetDetails.type == 'Date'){
                this.widgetDetails.dateWidgetFormat = this.inputDatetimeFormat;
            }
            this.formattedMomentDateString = this.reports.getMomentDateFormat(this.inputDatetimeFormat); 
        } else {
            this.inputDatetimeFormat = this.widgetDetails.attrDateFormat || '';
            this.inputDatetimeFormat = this.reports.updateInputDateTimeFormat(this.dateWidgetType, this.inputDatetimeFormat);
            this.formattedMomentDateString = this.reports.getMomentDateFormat(this.inputDatetimeFormat);
            if((this.defaultValue || '') != ''){
                this.widgetConfOptions.defaultDate = moment(this.defaultValue, this.formattedMomentDateString);
            }
            if (this.widgetDetails.hasOwnProperty("dateRangeScript")) {
                this.reports.updateUserEnteredDateFieldOptions(this.widgetDetails, this.widgetConfOptions);
            }
        }
        if (this.widgetConfOptions.defaultDate) {
            if (this.widgetDetails.isRangeSelector) {
                if (currentElement.getAttribute('id') == 'start-time') {
                    this.widgetDetails.enteredStartDateModel = this.widgetConfOptions.defaultDate;
                } else if (currentElement.getAttribute('id') == 'end-time') {
                    this.widgetDetails.enteredEndDateModel = this.widgetConfOptions.defaultDate;
                }
            } else {
                this.widgetDetails.enteredDateModel = this.widgetConfOptions.defaultDate;
            }
        }
        if(this.dateWidgetType == 'DATETIME' && !this.widgetConfOptions.defaultDate && currentElement.getAttribute('id') == 'end-time'){
            this.widgetConfOptions.defaultDate = moment(moment().endOf("day"), this.formattedMomentDateString);
        }
        this.ngControl = this.inj.get(NgControl);
    }

    ngAfterViewInit(): void {
        this.popover.hidden.subscribe($event => {
            this.showTimePickerToggle = false;
        });
        this.popover.shown.subscribe($event => {
            console.log(this.dp);
        });
    }

    writeValue(newModel: string) {
        if (newModel) {
            this.datetime = Object.assign(this.datetime, DateTimeModel.fromLocalString(newModel));
            this.dateString = newModel;
            this.setDateStringModel();
        } else {
            this.datetime = new DateTimeModel();
            this.setDateStringModel();
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    toggleDateTimeState($event) {
        this.showTimePickerToggle = !this.showTimePickerToggle;
        $event.stopPropagation();
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onInputChange($event: any) {
        const value = $event.target.value;
        const dt = DateTimeModel.fromLocalString(value);

        if (dt) {
            this.datetime = dt;
            this.setDateStringModel();
        } else if (value.trim() === '') {
            this.datetime = new DateTimeModel();
            this.dateString = '';
            this.onChange(this.dateString);
        } else {
              this.onChange(value);
        }
    }

    onDateChange($event: any | NgbDateStruct) {        
        if ($event.year){
          $event = `${$event.year}-${$event.month}-${$event.day}`
        }

        const date = DateTimeModel.fromLocalString($event);
   
        if (!date) {
            this.dateString = this.dateString;
            return;
        }

        if (!this.datetime) {
            this.datetime = date;
        }

        this.datetime.year = date.year;
        this.datetime.month = date.month;
        this.datetime.day = date.day;

        this.dp.navigateTo({ year: this.datetime.year, month: this.datetime.month });
        this.setDateStringModel();
    }

    onTimeChange(event: NgbTimeStruct) {
        this.datetime.hour = event.hour;
        this.datetime.minute = event.minute;
        this.datetime.second = event.second;

        this.setDateStringModel();
    }

    setDateStringModel() {
        this.dateString = this.datetime.toString();

        if (!this.firstTimeAssign) {
            this.onChange(this.dateString);
        } else {
            // Skip very first assignment to null done by Angular
            if (this.dateString !== null) {
                this.firstTimeAssign = false;
            }
        }
        if(this.dateString){
            if(this.formCellDetails){
                let handText =  moment(this.dateString).format(this.formattedMomentDateString);
                this.report_template.updateFreeHandText(handText, this.formCellDetails.secObj, this.formCellDetails.objIndex, this.formCellDetails.rowIndex, this.formCellDetails.i);
            }else{
                this.updateUserEnteredValues(this.dateString);
            }
        }
    }

    inputBlur($event) {
        this.onTouched();
    }

    updateUserEnteredValues(value: any){
        let currentElement: any = this.elref.nativeElement;
        if(this.widgetDetails.isRangeSelector){
            if(currentElement.getAttribute('id') == 'start-time'){
                this.widgetDetails.enteredValue[0] = moment(value).format(this.formattedMomentDateString);
            }else if(currentElement.getAttribute('id') == 'end-time'){
                this.widgetDetails.enteredValue[1] = moment(value).format(this.formattedMomentDateString);
            }
        }else{
            this.widgetDetails.enteredValue = moment(value).format(this.formattedMomentDateString);
        }
    }

    updateDefaultEndDate(){
        if(this.dateWidgetType == 'DATETIME'){
            let currentElement: any = this.elref.nativeElement;
            if(this.widgetDetails.isRangeSelector && currentElement.getAttribute('id') == 'end-time' && (this.widgetDetails.enteredValue[1] || '') == ''){
                this.widgetDetails.enteredEndDateModel = moment(this.widgetConfOptions.defaultDate).format(this.formattedMomentDateString);
            }
        }
    }
    
}
