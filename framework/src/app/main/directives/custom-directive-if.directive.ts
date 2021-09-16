import { Directive, Input, OnChanges, TemplateRef, ViewContainerRef, HostListener, ElementRef } from "@angular/core";
import { GlobalDataService } from 'src/app/main/services/global.service';
import * as _ from "lodash";
import { AppService } from "src/app/app.service";
import { NgControl } from "@angular/forms";

@Directive({
  selector: "[appCustomDirectiveIf]"
})
export class CustomDirectiveIfDirective {
  userAccessSet: any = this.globalDataService.shareObj['userAccess'];
  @Input()
  set appCustomDirectiveIf(show: any) {
    if (sessionStorage['ep-username']) {
      if (this.globalDataService.shareObj['userAccess']) {
        this.checkAccessSet(show);
      }
      else {
        let inputObj = {
          "email": sessionStorage['ep-username'],
          "individualId": (sessionStorage && sessionStorage['ep-userid']) ? sessionStorage['ep-userid'] : ''
        };
        this.customerService.getAllAccessSetForUser(inputObj).subscribe((res: any) => {
          if (res && res.body) {
            this.globalDataService.shareObj['userAccess'] = res.body;
            this.userAccessSet = this.globalDataService.shareObj['userAccess'];
            this.checkAccessSet(show);
          }
        });
      }
    }
    else {
      this.container.createEmbeddedView(this.templateRef);
    }
  }

  checkAccessSet(show) {
    var getFilterData = _.filter(this.userAccessSet, (b) => [show].map(c => c).indexOf(b.name) > -1);
    if (getFilterData && getFilterData.length > 0) {
      this.container.createEmbeddedView(this.templateRef);
    } else {
      this.container.clear();
    }
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private container: ViewContainerRef,
    private globalDataService: GlobalDataService,
    private customerService: AppService
  ) { }
}

@Directive({ selector: "[appDisableAfterClick]" })
export class CustomDisableDirective {
  @Input("appDisableAfterClick") val: string;
  constructor(private el: ElementRef, private globalDataService: GlobalDataService) { }
  userAccessSet: any = this.globalDataService.shareObj['userAccess'];
  ngOnChanges() {
    if (this.val) {
      var getFilterData = _.filter(this.userAccessSet, (b) => [this.val].map(c => c).indexOf(b.name) > -1);
      if (getFilterData && getFilterData.length == 0) {
        this.el.nativeElement.style.pointerEvents = 'none';
      }
    }
  }
}

@Directive({ selector: "input[formControlName]" })
export class InputWhiteSpaceDirective {
  constructor(private _el: ElementRef, private control: NgControl) { }
  @HostListener("input", ["$event"]) onInputChange(event) {
    const initalValue = this._el.nativeElement.value;
    if (initalValue.trim().length === 0 && this.control) {
      this._el.nativeElement.value = null;
      this.control.control.setValue("");
    }
  }
}

@Directive({ selector: 'input[numbersOnly]' })
export class NumberDirective {
  constructor(private _el: ElementRef) { }
  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue = this._el.nativeElement.value;
    this._el.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}

@Directive({ selector: "textarea[formControlName]" })
export class TextareaWhiteSpaceDirective {
  constructor(private _el: ElementRef, private control: NgControl) { }
  @HostListener("input", ["$event"]) onInputChange(event) {
    const initalValue = this._el.nativeElement.value;
    if (initalValue.trim().length === 0 && this.control) {
      this._el.nativeElement.value = null;
      this.control.control.setValue("");
    }
  }
}

@Directive({ selector: "[skipFormValidation]" })
export class SkipFormValidationDirective {
  @Input("skipFormValidation") val: string;
  constructor(private el: ElementRef, private control: NgControl, private globalDataService: GlobalDataService) { }
  ngOnChanges() {
    if(this.globalDataService.environment['isCaptchaWhitelsit'] == true) {
      this.control.control.setValue('true');
    }
  }
}

@Directive({ selector: "[appLowercase]" })
export class LowercaseDirective {
  constructor(private _el: ElementRef) { }
  @HostListener("input", ["$event"]) onInputChange(event) {
    const initalValue = this._el.nativeElement.value;
    if (initalValue) {
      const value = this._el.nativeElement.value.toLowerCase();
      this._el.nativeElement.value = value;
      event.preventDefault();
    }
  }
}

@Directive({ selector: '[appCustomInput]' })
export class CustomInputDirective {
  constructor() { }
  @HostListener("paste", ["$event"])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedInput: string = event.clipboardData.getData("text/plain").replace(/[^0-9]*/g, '');
    document.execCommand("insertText", false, pastedInput);
  }
}