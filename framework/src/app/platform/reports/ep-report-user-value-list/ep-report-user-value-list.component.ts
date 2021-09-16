import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../util/api.service';
import { ReportsService } from './../service/reports.service';
import { StringUtilService } from './../service/stringUtil.service';

@Component({
  selector: 'ep-report-user-value-list',
  templateUrl: './ep-report-user-value-list.component.html',
  styleUrls: ['./ep-report-user-value-list.component.css']
})
export class EpReportUserValueListComponent implements OnInit {
  @Output() invokeExecuteEnteredValue: EventEmitter<any> = new EventEmitter();
  @Output() invokeClearUserValueListFilter: EventEmitter<any> = new EventEmitter();
  @Output() invokeCustomizedTabOnCloseEmit: EventEmitter<any> = new EventEmitter();
  
  customizedTabReportMetaData: any;
  customizeTabObject: any;
  reportMetaData: any;

  dateModel: Date = new Date();
  
  constructor( public reports: ReportsService, private strings: StringUtilService, private apiService: ApiService, private toastr: ToastrService ) { }

  ngOnInit() { 
    this.customizedTabReportMetaData = this.reports.customizedTab_reportMetaData;
    this.customizeTabObject = (this.customizedTabReportMetaData || {}).customizeTabs || {};
    this.reportMetaData = this.reports.reportMetaData;
    if(this.customizeTabObject.customize){
      this.updateCustomizedTabOptionList();
      this.updateCustomizedTabSelectedOptionsList();
      this.customizeTabObject.isAttrLoaded = true;
    }
    // if(this.customizeTabObject.customize){
    //   customizeTabObject.epMultiSelectWidget = epMultiSelectWidget;
    //   var optionListObject = this.getOptionList();
    //   customizeTabObject.epMultiSelectLoadObject =  {optionList : optionListObject.optionList, optionList_id : optionListObject.optionList_id, selectedOptionList : getSelectedOptionList()};
    //   epMultiSelectWidget.load(customizeTabObject.epMultiSelectLoadObject);
    // }else if(parentScope.$parent.field){
    //   parentScope.$parent.field.epMultiSelectWidget = epMultiSelectWidget;
    // }
  }

  updateCustomizedTabOptionList(){
    this.customizeTabObject.attrIdList = [];
    this.customizeTabObject.attrList = [];
    var tabList = this.customizedTabReportMetaData.clubbed;
    (tabList || []).forEach((tabObj: any) => {
      this.customizeTabObject.attrIdList.push(tabObj.id);
      this.customizeTabObject.attrList.push(tabObj.tabName);
    });
  }

  updateCustomizedTabSelectedOptionsList(){
    this.customizeTabObject.enteredValue = [];
    (this.customizeTabObject.defaultTabList || []).forEach((tabId: string) => {
      let current_tabObject: any = this.getCurrentTabObject(tabId);
      this.customizeTabObject.enteredValue.push(current_tabObject.tabName);
    });
  }

  getCurrentTabObject(tabId: string){
    return (this.customizedTabReportMetaData.clubbed || []).find((tabObj: any) => {
      return tabObj.id == tabId;
    });
  }

  updateAttrList(userObj: any, callback: any){
    var distinctQuery: string = userObj.userValueQuery || this.reports.reportMetaData.userValueQuery || '';
    var apiFlag: boolean = false;
    var apiId: string = '';
    var inputType: string = this.reports.reportMetaData.inputType;
    var userValueList = [];
    if(this.reports.reportMetaData.reportViews == 'Clubbed'){
      inputType = userObj.inputType;
    }
    if(inputType=='DATABASE' && distinctQuery != ''){
      distinctQuery += ' RETURN DISTINCT (' + userObj.attr + ')';
      apiFlag = true;
    }else if(inputType == 'API'){
      apiFlag = true;
      if(this.reports.reportMetaData.reportViews == 'Clubbed'){
        apiId = userObj.api;
      }else{
        apiId = this.reports.reportMetaData.apiContent.dimension.api;										
      }
      (this.reports.reportMetaData.userValueList).forEach((repUserObj: any) => {
        /*if(repUserObj.api == userObj.api){*/
          userValueList.push(repUserObj);
        /*}*/
      });
    }
    if(apiFlag){
      var userListId: string = this.strings.getRandomId();
      userObj.id = userListId;
      if(userObj.mandatoryType == 'group'){
        var matObj = (this.reports.cloneUserList).filter((clObj: any) => {
          return clObj.givenName == userObj.givenName;
        })[0];
        matObj.id = userListId;
      }
      let reqObj: object = {id: userListId, query: distinctQuery, modelName: userObj.nodeName, inputType: inputType, apiId: apiId, filterField: userObj.attr, userValueList: userValueList};
      this.apiService.invokePlatformApi('/eportal/api/execute/report/distinctData', 'POST', reqObj).subscribe(
        (res: any) => {
          var _resp: any = res.body;
          (this.reports.cloneUserList).forEach((userFindObj: any) => {
            if (userFindObj.id == _resp.id) {
              userFindObj.attrList = _resp.attrList;
              if (userFindObj.mandatoryType == "group") {
                (this.reports.reportMetaData.userValueList || []).forEach((grpObj: any) => {
                  if (grpObj.type == "combinedList" && (grpObj.givenName == userFindObj.givenName)) {
                    grpObj.attrList = _resp.attrList;
                  }
                });
              }
            }
          });
          if (callback) {
            callback();
          }
        },
        (err: any) => {
          this.toastr.error((err.error || 'Something went wrong. Please check console'), 'FAILED');
          
        }
      );
    }
  }

  getConfigObject(event: any){
    let defaultConfigObject = JSON.parse(JSON.stringify(this.reports.epMultiSelectWidgetDefaultConfigObject));
    defaultConfigObject.isSingleSelect = (event.getAttribute("select-type") || '') != "multiple";
    defaultConfigObject.needFilterButton = (event.getAttribute("need-filter-button") || '')  === "yes";
    defaultConfigObject.id = event.getAttribute("id");
    return defaultConfigObject;
  }

  epLmsdOnOpen(userEnteredValueDetails: any){
    let loadType: string = (userEnteredValueDetails.loadType || 'ONDEMANDFIRST').toUpperCase();
    if((loadType == 'ONDEMANDFIRST' && !userEnteredValueDetails.isAttrLoaded) || loadType == 'ONDEMANDALL'){
      userEnteredValueDetails.demandReqCount = userEnteredValueDetails.demandReqCount ? (userEnteredValueDetails.demandReqCount + 1) : 1;
      this.updateAttrList(userEnteredValueDetails, ()=> {
        userEnteredValueDetails.demandReqCount--;
        if(loadType == 'ONDEMANDFIRST') userEnteredValueDetails.isAttrLoaded = true;
        if(userEnteredValueDetails.demandReqCount == 0) userEnteredValueDetails.hideLoaderFunction();
      });
    }
  }

  executeEnteredValue(isToastrToSkip: boolean, isSubmit: boolean){
    this.invokeExecuteEnteredValue.emit({isToastrToSkip, isSubmit});
  }

  clearFilter(){
    this.invokeClearUserValueListFilter.emit();
  }

  customizedTabMultiSelectOnClose(){
    if(this.reports.validateCustomizeTabResponse(this.customizedTabReportMetaData)){
      this.reports.reportMetaData.clubbed = this.getUpdatedClubbedList();
      this.invokeCustomizedTabOnCloseEmit.emit();
    }
  }

  isSelectedOptionListchanged(){
    var valueChanged: boolean = false;
    if(this.customizeTabObject.prevCustomizeTabValues){
      var prevSelectedOptionList: any[] = this.customizeTabObject.prevCustomizeTabValues.selectedOptionList || []; 
      var curSelectedTabValues: any[] = this.customizeTabObject.getSelectedValueList();
      if(prevSelectedOptionList.length  == curSelectedTabValues.length){
        var changedOption: any = prevSelectedOptionList.find((tabValue: string) => {
          return curSelectedTabValues.indexOf(tabValue) == -1;
        });
        if(changedOption) valueChanged = true;
      }else{
        valueChanged = true;
      }
    }
    return valueChanged;
  }

  getUpdatedClubbedList(){
    var selectedTabIds = this.customizeTabObject.enteredValue;
    return (this.customizedTabReportMetaData.clubbed || []).filter((tabObj: any) => {
          return selectedTabIds.indexOf(tabObj.id) != -1;
    });
  }
  
}
