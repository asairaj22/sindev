import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewEncapsulation, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { ReportsService } from '../service/reports.service';
import { ApiService } from '../../util/api.service';
import { StringUtilService } from './../service/stringUtil.service';
import { ThemeBuilderService } from '../service/theme-builder.service';
import { ReportTemplateService } from './../service/report-template.service';
import { EpReportMatrixComponent } from './../ep-report-matrix/ep-report-matrix.component';
import { EpReportDataGridComponent } from './../ep-report-data-grid/ep-report-data-grid.component';
import moment from 'moment-timezone';
declare var $: any;

@Component({
  selector: 'ep-report-landing',
  templateUrl: './ep-report-landing.component.html',
  styleUrls: ['./ep-report-landing.component.css', './../reports.module.css'],
  encapsulation: ViewEncapsulation.None
})
export class EpReportLandingComponent implements OnInit {
  @ViewChildren('gridComponent') gridComponentList: QueryList<EpReportDataGridComponent>;
  @ViewChildren('matrixComponent') matrixComponentList: QueryList<EpReportMatrixComponent>;
  
  private currentRouteParamObject: any;

  constructor( 
    public reports: ReportsService,
    private report_template: ReportTemplateService,
    private themeBuilder: ThemeBuilderService,
    private strings: StringUtilService,
    private apiService: ApiService, 
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef ) { }

  ngOnInit() {
    this.getAllTemplates();
    this.reports.href_prefix = location.href.split('/reports')[0];
    this.getReportsTableData(() => {
      this.getReportFilterFrmId();
    });
  }

  getAllTemplates(){
    this.apiService.invokePlatformApi('/eportal/api/reporting/getAllTemplates', 'GET').subscribe(
      (res: any) => {
        this.reports.templateDetails = res.body || {};
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  getReportsTableData(callback: any){
    this.reports.showTableControls = false;
    this.route.paramMap.subscribe(paramObject => {
      this.currentRouteParamObject = paramObject;
      let reportId = (paramObject['params']['id']) || '';
      if(reportId != '') {
        this.reports.reportId = reportId;
				this.getReportFrmId(callback);
      }
    });
  }

  getReportFilterFrmId(){
    this.apiService.invokePlatformApi('/eportal/api/getAll/report/filter', 'POST', {reportId: this.reports.reportId}).subscribe(
      (res: any) => {
        this.reports.reportFilters = (res.body) || [];
        this.reports.filterNameList = [];
        (this.reports.reportFilters).forEach((filterObj: any) => {
          if(filterObj.filterName){
            this.reports.filterNameList.push(filterObj.filterName);
          }
        });
        this.reports.isFiltersLoaded = true;
        this.applyDefaultFilter();
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  getReportFrmId(callback: any){
    let reqObj: object = {id: this.reports.reportId, getChildReport: true};
    this.apiService.invokePlatformApi('/eportal/api/get/reportId/metaData', 'POST', reqObj).subscribe(
      (response: any) => {
        let res = response.body || {};
				this.reports.reportName = res.name;
				if(res.reportViews == 'Clubbed' && (res.customizeTabs || {}).customize){
					this.updateCustomizeTabResponse(res);
				}
				this.reports.reportMetaData = res;
				this.reports.showReportTableContainer = this.reports.reportMetaData.hasOwnProperty('showReportTableContainer') ? this.reports.reportMetaData.showReportTableContainer : true;
				//sc.loaderHide();
				if(res.reportViews == 'Clubbed'){
					this.updateClubbedUserValueList(res);
				}
				this.loadDefaultsUserValueList(res);
				if(res.reportViews == 'Clubbed' || (res.userValueList && res.userValueList.length > 0)){
					this.reports.cloneUserList = JSON.parse(JSON.stringify(res.userValueList));
					this.manipulateClubbedUserValueList();
				}else{
          setTimeout(() => {
            this.executeEnteredValue(true);
          }, 0);
				}
				if(res.userValueList.length > 0 || (res.customizeTabs || {}).customize){
					this.updateFilterPerRowDetails(res);
					if((res.customizeTabs || {}).customize) this.reports.showReportTableContainer = false;
        }
				if(res.reportViews == 'Clubbed'){
          this.reportClubInit();
				}
				callback();
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
  }

  invokeExecuteEnteredValue(paramObj: any){
    if(paramObj.lazyLoadingDetails){
      this.executeEnteredValue(paramObj.isToastrToSkip, paramObj.isSubmit, paramObj.lazyLoadingDetails);
    }else{
      this.executeEnteredValue(paramObj.isToastrToSkip, paramObj.isSubmit);
    }
  }

  executeEnteredValue(isToastrToSkip: boolean, isSubmit?: boolean, lazyLoadingDetails?: any){
    console.log(this.reports.reportMetaData);
    this.reports.disableSaveFilter = false;
    this.reports.disableExport = false;
    var execute = () => {
      var isMandatorySatisfied: boolean = true;
      var isNumberFieldWidgetSatisfied: boolean = true;
      var reports: any = this.reports;
      reports.reportMetaData.clubbedTabBtnsRef = reports.reportMetaData.clubbed || [];
      var reqObj: any = reports.reportMetaData;
      var filteredDetails: any = {mandatoryGroupFilter: {key: '',value: ''}, mandatoryFilter: {}, optionFilter: {}};
      var customHeaders: any = {};
      var lazyLoadOffsetCount: any, existingSectionObj: any;
      var validateNumberFieldWidget: any = (userValuObj: any) => {
        if(userValuObj.enteredValue && (userValuObj.enteredValue[0] || '') == 'between' && ((userValuObj.enteredValue[1] || '') == '' || (userValuObj.enteredValue[2] || []) == '')){
          isNumberFieldWidgetSatisfied = false;
          if((userValuObj.enteredValue[1] || '') == '' && (userValuObj.enteredValue[2] || '') == ''){
            // Commented since language is not yet implemented in COBIA
            //sc.showErrorAlertModal(scope.gettextCatalog.getString(userValuObj.givenName) + ' ' +scope.gettextCatalog.getString('filter start and end value is empty'));
            this.reports.showErrorAlertModal(userValuObj.givenName + ' filter start and end value is empty');
          }else if((userValuObj.enteredValue[1] || '') == ''){
            //sc.showErrorAlertModal(scope.gettextCatalog.getString(userValuObj.givenName) + ' ' +scope.gettextCatalog.getString('filter start value is empty'));
            this.reports.showErrorAlertModal(userValuObj.givenName + ' filter start value is empty');
          }else{
            //sc.showErrorAlertModal(scope.gettextCatalog.getString(userValuObj.givenName) + ' ' +scope.gettextCatalog.getString('filter end value is empty'));
            this.reports.showErrorAlertModal(userValuObj.givenName + ' filter end value is empty');
          }
        }else if(userValuObj.enteredValue && ((userValuObj.enteredValue[0] || '') != '' && (userValuObj.enteredValue[0] || '') != 'all') && (userValuObj.enteredValue[1] == undefined || userValuObj.enteredValue[1] == '')){
          isNumberFieldWidgetSatisfied = false;
          this.reports.showErrorAlertModal((userValuObj.givenName) + ' filter value is empty');
        }
      };
      for(let i=0; i<reqObj.userValueList.length; i++){
        let userValueObj: any = reqObj.userValueList[i];
        if(userValueObj.isMandatory){
          if(userValueObj.mandatoryType == 'group'){
            filteredDetails.mandatoryGroupFilter.key = userValueObj.displayName;
            filteredDetails.mandatoryGroupFilter.value = userValueObj.enteredValue;
          }else{
            filteredDetails.mandatoryFilter[userValueObj.displayName] = userValueObj.enteredValue;
          }
        }else{
          filteredDetails.optionFilter[userValueObj.displayName] = userValueObj.enteredValue;
        }
      }
      for(let i=0; i<reqObj.userValueList.length; i++){
        var userValuObj: any = reqObj.userValueList[i];
        if(userValuObj.widget == 'Number Picker') validateNumberFieldWidget(userValuObj);
        if(!isNumberFieldWidgetSatisfied) return;
        if(userValuObj.isMandatory && (userValuObj.enteredValue == undefined || userValuObj.enteredValue == '' || userValuObj.enteredValue == [])){
          isMandatorySatisfied = false;
          break;
        }
        if(userValuObj.type == 'combinedList' && ((userValuObj.selectedGroupName == undefined || userValuObj.selectedGroupName == '') || (userValuObj.enteredValue == undefined || userValuObj.enteredValue == '' || userValuObj.enteredValue == []))){
          isMandatorySatisfied = false;
          break;
        }
        if((userValuObj.isMandatory || userValuObj.type == 'combinedList') && userValuObj.isRangeSelector && (userValuObj.enteredValue[0] == undefined || userValuObj.enteredValue[0] == '' || userValuObj.enteredValue[1] == undefined || userValuObj.enteredValue[1] == '')){
          isMandatorySatisfied = false;
          break;
        }
        if(userValuObj.isMandatory && userValuObj.widget == 'Number Picker'){ // Mandatory fields validation for number picker widget
          if(userValuObj.enteredValue[0] == undefined || userValuObj.enteredValue[0] == ''){
            isMandatorySatisfied = false;
            break;
          }else{
            validateNumberFieldWidget(userValuObj);
            if(!isNumberFieldWidgetSatisfied) return;
          }
        }
      }
      if(isSubmit && isMandatorySatisfied){
        (this.reports.cloneUserList || []).forEach((clonedObj: any) => {
          if(clonedObj.mandatoryType && clonedObj.mandatoryType == 'group'){
            clonedObj.isSelected = false;
            (reqObj.userValueList).forEach((useObj: any) => {
              if(useObj.givenName == clonedObj.givenName){
                clonedObj.isSelected = true;
                useObj.isSelected = true;
                Object.keys(useObj).forEach((key: any) => {
                  clonedObj[key] = useObj[key];
                });
              }
            });
            if(!clonedObj.isSelected){
              delete clonedObj.enteredValue;
            }
          }else{
            (reqObj.userValueList).forEach((useObj: any) => {
              if(useObj.givenName == clonedObj.givenName){
                Object.keys(useObj).forEach((key: string) => {
                  clonedObj[key] = useObj[key];
                });
              }
            });
          }
        });
      }
      if(isMandatorySatisfied){
        if(this.isSatisfied(filteredDetails, reqObj.userValueList, isSubmit)){
          var _this = reports;
          this.reports.cloneUserFilterList = JSON.parse(JSON.stringify(this.reports.reportMetaData.userValueList));
          this.apiService.loaderShow('loader', ' Loading...');
          reqObj.href_prefix = this.reports.href_prefix;
          var reqObjCopy: any = JSON.parse(JSON.stringify(reqObj));
          if(isSubmit){
            reqObjCopy.userValueList = JSON.parse(JSON.stringify(this.reports.cloneUserList || []));
          }
          var charts = this.reports.charts = [];
          if(this.reports.reportMetaData.reportViews == 'Clubbed'){
            var reportMetaData_copy: any = JSON.parse(JSON.stringify(reqObjCopy));
            this.reports.prevReportTabResponseList = JSON.parse(JSON.stringify(this.reports.reportTabResponseList || []));
            if(!lazyLoadingDetails){  /*
                           * executes only if method
                           * is not triggered with
                           * lazyloading on
                           */
              this.reports.reportTabResponseList = [];
              this.reports.actualReportResponse.clubbed = [];
            }
            var totalSection: number = 0;
            this.reports.actualReportResponse = JSON.parse(JSON.stringify(reqObjCopy));
            this.reports.actualReportResponse.reportViews = 'Clubbed';
            if(reportMetaData_copy.clubbed.length > 0){
              (reportMetaData_copy.clubbed || []).forEach((clubObj: any, parentIndex: number) => {
                var activeTabId: string = ((lazyLoadingDetails || {}).clubbed || {}).activeTabId;
                if(!activeTabId || activeTabId == clubObj.id){ /*
                                         * check
                                         * for
                                         * current
                                         * tab
                                         * object
                                         * accessed
                                         * with
                                         * lazyloading
                                         * section
                                         */
                  var currentSectionList: Array<any> = [];
                  this.reports.reportTabResponseList[parentIndex] = JSON.parse(JSON.stringify(clubObj));
                  this.reports.reportTabResponseList[parentIndex].sectionList = currentSectionList;
                  var callTemplateFlag: boolean = true;
                  (clubObj.sectionList || []).forEach((secObj: any, childIndex: number) => {
                    var activeSectionId: string = ((lazyLoadingDetails || {}).clubbed || {}).sectionId;
                    if(!activeSectionId || activeSectionId == secObj.sectionId){  /*
                                                     * check
                                                     * for
                                                     * current
                                                     * section
                                                     * object
                                                     * is
                                                     * accessed
                                                     * with
                                                     * lazyloading
                                                     * on
                                                     */
                      secObj.customHeaders = {};
                      if(secObj.report_metadata && secObj.report_metadata.userValueList && secObj.report_metadata.userValueList.length > 0){
                        secObj.report_metadata.userValueList.forEach((userObj: any) => {
                          (this.reports.reportMetaData.userValueList).forEach((userListObj: any) =>{
                            if(userListObj.givenName == userObj.givenName){
                              userObj.enteredValue = userListObj.enteredValue;
                            }
                          })
                        });
                        this.reports.reportMetaData.clubbed[parentIndex].sectionList[childIndex].report_metadata.exportUserValueList = JSON.parse(JSON.stringify(secObj.report_metadata.userValueList));
                      }
                      var tabUserValueList: Array<any> = [];
                      var cloneClubObj: any = JSON.parse(JSON.stringify(clubObj));
                      (cloneClubObj.sectionList || []).forEach((cloneSecObj: any) => {
                        if(cloneSecObj.report_metadata && cloneSecObj.report_metadata.userValueList && cloneSecObj.report_metadata.userValueList.length > 0){
                          cloneSecObj.report_metadata.userValueList.forEach((cloneUserObj: any) => {
                            (this.reports.reportMetaData.userValueList).forEach((userListObj: any) => {
                              if(userListObj.givenName == cloneUserObj.givenName){
                                cloneUserObj.enteredValue = userListObj.enteredValue;
                              }
                            });
                            tabUserValueList.push(cloneUserObj);
                          });
                        }
                      });
                      
                      secObj.report_metadata.single.showTemplate = this.reports.reportMetaData.clubbed[parentIndex].showTemplate || false;
                      secObj.report_metadata.single.templateId = this.reports.reportMetaData.clubbed[parentIndex].templateId || '';
                      secObj.report_metadata.tabUserValueList = tabUserValueList;
                      secObj.report_metadata.isClubViewReport = true;
                      secObj.report_metadata.callTemplateFlag = callTemplateFlag;
                      totalSection++;
                      secObj.report_metadata.clubbedTabName = clubObj.tabName;
                      secObj.report_metadata.clubbedSectionName = secObj.sectionName;
                      if(!secObj.showFilter && (secObj.customExport || 'external') == 'external'){
                        secObj.report_metadata.customExportType = 'external';
                      }else{
                        secObj.report_metadata.customExportType = 'internal';
                      }
                      var lazyLoadingObject = lazyLoadingDetails || secObj.lazyLoading || {}; 
                      if(lazyLoadingObject.needLazyLoading){
                        secObj.customHeaders = {'ep-lazyloading':'TRUE', 'ep-limit':lazyLoadingObject.limit, 'ep-offset': lazyLoadingObject.offset || 1};
                        secObj.prevReportTabResponseList = JSON.parse(JSON.stringify(this.reports.prevReportTabResponseList || []));
                      }
                      secObj.report_metadata.report_pageId = this.reports.report_pageId;
                      let reqObj = this.cleanRequestData(secObj.report_metadata);
                      callTemplateFlag = false;
                      this.apiService.invokePlatformApi('/eportal/api/execute/report/metaData', 'POST', reqObj, secObj.customHeaders).subscribe(
                        (res: any) => {
                          var _res: any = res.body || {};
                          var responseHeaders: any = res.headers || {};
                          _res.single.gridInstanceId = this.strings.getRandomId();
                          _res.single.clubbedSectionName = _res.clubbedSectionName || null;
                          _res.single.clubbedTabName = _res.clubbedTabName || null;
                          this.reports.showReportTableContainer = true;
                          this.reports.isReportSubmitTriggered = true;
                          this.reports.actualReportResponse.id = this.reports.reportMetaData.id;
                          //TODO: //Below commented codes comes into action once the pagination is implemented
                          // if (Object.keys(secObj.customHeaders).length > 0) {
                          //   existingSectionObj = (((secObj.prevReportTabResponseList || [])[parentIndex] || {}).sectionList || [])[childIndex] || {};
                          //   secObj.lazyLoading.totalRecordCount = responseHeaders['ep-totalrecordcount'];
                          //   if (lazyLoadingDetails) {
                          //     totalRecordObject = _res.single.totalRecordObject = existingSectionObj.totalRecordObject || {};
                          //   } else {
                          //     totalRecordObject = _res.single.totalRecordObject = existingSectionObj.totalRecordObject = {};
                          //   }
                          //   lazyLoadOffsetCount = Number(responseHeaders['ep-offset']);
                          //   (_res.single.records || []).forEach((record: any, recordIndex: number) => {
                          //     totalRecordObject[lazyLoadOffsetCount + recordIndex] = record;
                          //   });
                            
                          //   _res.single.records = _this.pagination.getCurrentPageRecords(totalRecordObject, lazyLoadOffsetCount, _res.single.itemsPerPage);
                          //   delete secObj.customHeaders;
                          //   delete secObj.prevReportTabResponseList;
                          // }
                          if(Object.keys(secObj.customHeaders).length > 0 && secObj.lazyLoading){
                            existingSectionObj = (((secObj.prevReportTabResponseList || [])[parentIndex] || {}).sectionList || [])[childIndex] || {};
                            if (lazyLoadingDetails) {
                              let prefixRecord: Array<any> =  existingSectionObj.records.splice(0, (lazyLoadingDetails.offset - 1));
                              existingSectionObj.records.splice(0, _res.single.records.length);
                              existingSectionObj.records = prefixRecord.concat(_res.single.records).concat(existingSectionObj.records);
                              this.applyGlobalSearch(existingSectionObj);
                            } else {
                              secObj.lazyLoading.totalRecordCount =  Number(responseHeaders.get('ep-totalrecordcount'));
                              lazyLoadOffsetCount = Number(responseHeaders.get('ep-offset'));
                              _res.single.records[(_res.single.lazyLoading.totalRecordCount - 1)] = undefined; //initializing empty records
                            }
                            delete secObj.customHeaders;
                            delete secObj.prevReportTabResponseList;
                          }
                          Object.keys(_res.single).forEach((key: string) => {
                            if (key != 'lazyLoading' && !secObj[key]) {  /*
                                                 * for
                                                 * clubbed
                                                 * particular
                                                 * single's
                                                 * lazyloading
                                                 * configuration
                                                 * should
                                                 * not
                                                 * be
                                                 * considered
                                                 */													secObj[key] = _res.single[key];
                            }
                          });
                          currentSectionList[childIndex] = secObj;
                          (clubObj.sectionList || []).forEach((currentObj: any) => {
                            if (currentObj && currentObj.hideMatrixPagination && currentObj.records) {
                              currentObj.itemsPerPage = currentObj.records.length;
                            }
                          });
                          if (!this.reports.actualReportResponse.clubbed[parentIndex]) {
                            this.reports.actualReportResponse.clubbed[parentIndex] = JSON.parse(JSON.stringify(clubObj));
                            this.reports.actualReportResponse.clubbed[parentIndex].sectionList = [];
                          }
                          if (_res.single.templateDetails) {
                            this.reports.reportTabResponseList[parentIndex].templateDetails = _res.single.templateDetails;
                            this.reports.reportTabResponseList[parentIndex].showTemplate = _res.single.showTemplate;
                            delete _res.single.templateDetails;
                          }
                          if (this.reports.reportTabResponseList[parentIndex].sectionList[childIndex]) this.reports.reportTabResponseList[parentIndex].sectionList[childIndex].sectionHeaderTheme = _res.single.sectionHeaderTheme = _res.single.sectionHeaderTheme || {};
                          _res.single.theme.customSectionTheme = this.reports.reportMetaData.clubbed[parentIndex].sectionList[childIndex].customSectionTheme || {};
                          this.reports.actualReportResponse.clubbed[parentIndex].sectionList[childIndex] = _res.single;

                          totalSection--;
                          if (!lazyLoadingDetails) {  /* executes only if method is triggered with lazyloading ON */
                            if (totalSection == 0) {
                              this.reportClubSwitchTab(this.reports.reportTabResponseList[0], 0);
                              this.updateFilterFieldCriteria();
                              setTimeout(() => {
                                $('#reportContainer').scroll();
                              }, 0);
                            }
                          } else {
                            lazyLoadingDetails.clubbed['sectionIndex'] = childIndex;
                            this.reportClubSwitchTab(this.reports.reportTabResponseList[parentIndex], parentIndex, lazyLoadingDetails);
                            setTimeout(() => {
                              $('#reportContainer').scroll();
                            }, 0);
                          }
                          if (secObj.reportType.toLowerCase() == 'graphical' || secObj.isChartNeeded) {
                            secObj.imageContent = '';
                            charts.push(JSON.parse(JSON.stringify(secObj)));
                          }
                        },
                        (err: any) => {
                          this.apiService.loaderHide('loader');
                          this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
                          
                        }
                      );
                    }
                  });
                }
              });
            }else{
              this.apiService.loaderHide('loader');
            }
          }else{
            this.reports.reportMetaData.exportUserValueList = JSON.parse(JSON.stringify(reqObjCopy.userValueList));
            if(reqObjCopy.reportViews.toLowerCase() == 'single'){
              let lazyLoadingObject: object = lazyLoadingDetails || reqObjCopy.single.lazyLoading || {}; 
              if(lazyLoadingObject['needLazyLoading']){
                customHeaders = {'ep-lazyloading':'TRUE', 'ep-limit':lazyLoadingObject['limit'] + '', 'ep-offset': (lazyLoadingObject['offset'] || 1) + ''};
              }
            }
            reqObjCopy.report_pageId = this.reports.report_pageId;
            if(!reqObjCopy.single.showFilter && (reqObjCopy.single.customExport || 'external') == 'external'){
              reqObjCopy.customExportType = 'external';
            }else{
              reqObjCopy.customExportType = 'internal';
            }
            let reqObj: any = this.cleanRequestData(reqObjCopy);
            this.apiService.invokePlatformApi('/eportal/api/execute/report/metaData', 'POST', reqObj, customHeaders).subscribe(
              (res: any) => {
                this.reports.showReportTableContainer = true;
                this.reports.isReportSubmitTriggered = true;
                existingSectionObj = (((this.reports.reportTabResponseList || [])[0] || {}).sectionList || [])[0] || {};
                var _res: any = this.reports.actualReportResponse = res.body || {};
                _res.single.gridInstanceId = this.strings.getRandomId();
                var responseHeaders: any = res.headers || {};
                if (_res.single && _res.single.reportType === 'Matrix' && _res.single.hideMatrixPagination) {
                  _res.single.itemsPerPage = _res.single.records.length;
                }
                if (lazyLoadingDetails) { /* executes only if lazyloading is ON */
                  if (_res.reportViews == 'Single') {
                    let prefixRecord: Array<any> =  existingSectionObj.records.splice(0, (lazyLoadingDetails.offset - 1));
                    existingSectionObj.records.splice(0, _res.single.records.length);
                    existingSectionObj.records = prefixRecord.concat(_res.single.records).concat(existingSectionObj.records);
                    this.applyGlobalSearch(existingSectionObj);
                  }
                } else {
                  this.reports.reportTabResponseList = [];
                  this.reports.previewTemplate = null;
                  if (_res.reportViews == 'Single') {
                    delete _res.single.clubbedSectionName;
                    delete _res.single.clubbedTabName;
                    if (Object.keys(customHeaders).length > 0 && _res.single.lazyLoading) {
                      _res.single.lazyLoading.totalRecordCount = Number(responseHeaders.get('ep-totalrecordcount'));
                      lazyLoadOffsetCount = Number(responseHeaders.get('ep-offset'));
                      _res.single.records[(_res.single.lazyLoading.totalRecordCount - 1)] = undefined; //initializing empty records
                    }
                    this.reports.reportTabResponseList.push({ sectionList: [_res.single] });
                    _this.activeTab = this.reports.reportTabResponseList[0];
                    if (_this.activeTab.sectionList[0] && _this.activeTab.sectionList[0].reportType == 'Data Grid' && _this.activeTab.sectionList[0].sectionId) {
                      //TODO: //Below commented codes comes into action once the floating scroll is implemented
                      //this.reports.updateSingleFloatingScroll(_this.activeTab.sectionList[0].sectionId);
                      console.log('Floating scroll to come here');
                    }
                    //TODO: //Below commented codes comes into action once the apply theme is implemented
                    this.report_template.applyTheme();
                    this.updateItemsPerPage(_this.activeTab.sectionList);
                    this.initPaginationDetails(_this.activeTab.sectionList);
                    var reportMeta = _res.single;
                    
                    //Hardcoded
                    //this.reports.previewTemplate = {'totalRow':3,'footer':{'margin':0,'left':'Title','center':'Pages {{PageNumber}} of {{TotalNumberOfPages}}','right':'Title'},'totalColumn':5,'columnList':[{'width':100,'isSelected':false},{'width':100,'isSelected':false},{'width':100,'isSelected':false},{'width':100,'isSelected':false},{'width':100,'isSelected':false}],'reportTitle':{'border':{'color':'rgb(211,211,211)','thickness':1,'type':'All'},'color':'rgb(255,255,255)','background':'rgb(8,104,50)','align':'center','verticalAlign':'middle'},'description':'Custom Order Template - Desc 11','type':'Custom Order Template - Type 1','headerFooterStyle':{'fontFamily':'Arial','fontSize':10},'rowColumn':'3,5','title_rowList':[{'isSelected':false,'columnList':[{'rowSpan':3,'colSpan':1,'needCustomTheme':true,'isSelected':false,'theme':{'background':'rgb(122,0,0)','color':'rgb(255,34,34)','align':'left','verticalAlign':'middle','fontSize':10,'fontWeight':'Bold'},'text':'Hello world','type':'text','hideColumn':false},{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','text':'Report Template','type':'text','hideColumn':false},{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','type':'text','hideColumn':false},{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','type':'text','hideColumn':false},{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','type':'text','hideColumn':false}],'height':20},{'isSelected':false,'columnList':[{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','type':'text','hideColumn':true},{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','type':'text','hideColumn':false},{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','type':'text','hideColumn':false},{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','type':'text','hideColumn':false},{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','type':'text','hideColumn':false}],'height':20},{'isSelected':false,'columnList':[{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','type':'text','hideColumn':true},{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','type':'text','hideColumn':false},{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','type':'text','hideColumn':false},{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','type':'text','hideColumn':false},{'rowSpan':1,'colSpan':1,'needCustomTheme':false,'isSelected':false,'theme':'','type':'text','hideColumn':false}],'height':20}],'coverPage':{},'name':'Custom Order Template','printSettings':{'fileName':'{{ReportName}}','orientation':'portrait','margin':{'top':30,'left':15,'bottom':30,'right':15},'printOrder':'left to right','paperSize':'A4 - 210x297 mm'},'header':{'margin':0,'left':'Title','center':'Title','right':'Title'},'styles':{'fontFamily':'Harlow Solid Italic','fontSize':15},'theme':[],'id':'f2055f0f-7dac-44f6-94e6-6bedad400710'};
                    //TODO: Below commented code will be removed once after validating template with the hardocoded response
                    if (reportMeta.showTemplate && reportMeta.templateDetails) {
                      this.reports.previewTemplate = reportMeta.templateDetails;
                    }
                    if (reportMeta.reportType.toLowerCase() == 'graphical' || reportMeta.isChartNeeded) {
                      reportMeta.imageContent = '';
                      charts.push(JSON.parse(JSON.stringify(reportMeta)));
                    }
                  }
                }
                //TODO: //Below commented codes comes into action once the apply theme is implemented
                this.themeBuilder.init();
                this.updateFilterFieldCriteria();
                this.apiService.loaderHide('loader');
                setTimeout(() => {
                  $('#reportContainer').scroll();
                }, 0);
              },
              err => {
                this.apiService.loaderHide('loader');
                this.toastr.error(((err.error || {}).errorMessage || 'Something went wrong. Please check console'), 'FAILED');
                
              }
            );
          }
        }else{
          this.apiService.loaderHide('loader');
        }
      }else if(!isToastrToSkip){
        // Commented since language is not yet implemented in COBIA
        //sc.showErrorAlertModal(scope.gettextCatalog.getString('Mandatory fields are required') + '.');
        this.reports.showErrorAlertModal('Mandatory fields are required.');
      }else{
        this.apiService.loaderHide('loader');
      }
    }
    if(isSubmit && (((this.reports.customizedTab_reportMetaData || {}).customizeTabs || {}).customize)){
      if(this.validateCustomizeTabResponse(this.reports.customizedTab_reportMetaData)){
        execute();
      }
    }else{
      execute();
    }
  }

  getCurrentGridInstance(secObj: any){
    let reportType = secObj.reportType.toUpperCase();
    let componentListType: string;
    if(reportType == 'DATA GRID'){
      componentListType = 'gridComponentList';
    }else if(reportType == 'MATRIX'){
      componentListType = 'matrixComponentList';
    }
    if(componentListType){
      return this[componentListType].toArray().find((compObj: any) => {
        return  compObj.secObj.gridInstanceId == secObj.gridInstanceId;
      });
    }else{
      return null;
    }
  }

  isSatisfied(filterDetails: any, filterList: any, isAutoSubmit: boolean){
    isAutoSubmit = isAutoSubmit || false;
    isAutoSubmit = !isAutoSubmit;
    var returnObj: any = {isSuccess: true};
    if(this.reports.reportMetaData.fieldValidationScript){
      try {
        var userDetails: any = JSON.parse(sessionStorage.getItem('userDetails'));
        var language: string = userDetails.language || 'en';
        returnObj = eval('(function execute(filterDetails, language, filterList, isAutoSubmit, isReportScheduler, CMS){' + this.reports.reportMetaData.fieldValidationScript.selectedStep.script + '})')(filterDetails, language, filterList, isAutoSubmit, {});
      } catch (e) {
        
        return true;
      }
    }
    if(!returnObj.isSuccess){
      if(returnObj.errorMessage != null){
        //toastr.error(scope.gettextCatalog.getString(returnObj.errorMessage || ''));
        //sc.showErrorAlertModal(scope.gettextCatalog.getString(returnObj.errorMessage || ''));
        this.reports.showErrorAlertModal(returnObj.errorMessage || '');
      }
    }
    return returnObj.isSuccess;
  }

  validateCustomizeTabResponse(res: any){
    var validateStatus = true;
    var customizeTabObject = res.customizeTabs;
    if(customizeTabObject.epMultiSelectWidget){
      var selectedTabIds = customizeTabObject.epMultiSelectWidget.getSelectedIdList();
      var errorMessage = '';
      if(selectedTabIds.length  == 0){
        //errorMessage = scope.gettextCatalog.getString('Mandatory tabs cannot be removed') + '.';
        errorMessage = 'Mandatory tabs cannot be removed.';
        validateStatus = false;
      }else{
        var isMandatoryTabDeselected = (customizeTabObject.mandatoryTabList || []).find((tabId: string) => {
          return selectedTabIds.indexOf(tabId) == -1;
        });
        if(isMandatoryTabDeselected){
          // errorMessage = scope.gettextCatalog.getString('Mandatory tabs cannot be removed') + '.';
          errorMessage = 'Mandatory tabs cannot be removed.';
          validateStatus = false;
        }else if((customizeTabObject.minTab || '') != '' && selectedTabIds.length < customizeTabObject.minTab){
          // errorMessage = scope.gettextCatalog.getString('Minimum Tabs required :') + ' ' + customizeTabObject.minTab + '.'
          errorMessage = 'Minimum Tabs required :' + ' ' + customizeTabObject.minTab + '.';
          validateStatus = false;
        }else if((customizeTabObject.maxTab || '') != '' && selectedTabIds.length > customizeTabObject.maxTab){
          // errorMessage = scope.gettextCatalog.getString('Maximum Tabs allowed :') + ' ' + customizeTabObject.maxTab + '.';
          errorMessage = 'Maximum Tabs allowed :' + ' ' + customizeTabObject.maxTab + '.';
          validateStatus = false;
        }
      }
      if(!validateStatus){
        this.reports.showErrorAlertModal(errorMessage);
        if(customizeTabObject.prevCustomizeTabValues) customizeTabObject.epMultiSelectWidget.load(customizeTabObject.prevCustomizeTabValues);
      }
    }
    return validateStatus;
  }

  updateFilterFieldCriteria(){
    var filterMetadata: any = this.reports.filterMetadata || [];
    if(filterMetadata.fieldCriteria && filterMetadata.fieldCriteria.length>0){
      (filterMetadata.fieldCriteria).forEach((fieldCriteriaObj: any) => {
        var updateTabObj = null;
        if(this.reports.reportMetaData.reportViews == 'Single'){
          updateTabObj = this.reports.reportTabResponseList[0];
        }else{
          updateTabObj = (this.reports.reportTabResponseList).filter((tabResponseObj: any) => {
            return tabResponseObj.id == fieldCriteriaObj.tabId;
          })[0];
        }
        var updateSectionObj = (updateTabObj.sectionList || []).filter((secResponseObj: any) => {
          return secResponseObj.sectionId == fieldCriteriaObj.sectionId;
        })[0];
        var filterDisplayFields = {};
        (fieldCriteriaObj.displayFields || []).forEach((dispObj: any) => {
          if(dispObj.name_actual){
            filterDisplayFields[dispObj.name_actual] = dispObj.filterValue;
          }
        });
        (updateSectionObj.displayFields).forEach((updispObj: any) => {
          /*if(!updispObj.filterList){
            var filterList = [];
            if(updateSectionObj.records){
              (updateSectionObj.records).forEach(function(recObj){
                var value = recObj[updispObj.mapping];
                if(value && filterList.indexOf(value) == -1){
                  filterList.push(value);
                }
              });
            }
            updispObj.filterList = filterList;
            //updispObj.filterValue = filterList;
          }*/
          if(filterDisplayFields[updispObj.name_actual]){
            updispObj.filterValue = filterDisplayFields[updispObj.name_actual];
          }/*else{
            if(!updispObj.filterList){
              var filterList = [];
              if(updateSectionObj.records){
                (updateSectionObj.records).forEach(function(recObj){
                  var value = recObj[updispObj.mapping];
                  if(value && filterList.indexOf(value) == -1){
                    filterList.push(value);
                  }
                });
              }
              updispObj.filterList = filterList;
              //updispObj.filterValue = filterList;
            }else{
              //updispObj.filterValue = updispObj.filterList;
            }
          }*/
        });
        /*(fieldCriteriaObj.displayFields || []).forEach(function(fieldDisplayObj){
          var updateDisplayObj = (updateSectionObj.displayFields).filter(function(displayResponseObj){
            return displayResponseObj.name_actual == fieldDisplayObj.name_actual;
          })[0];
          updateDisplayObj.filterValue = fieldDisplayObj.filterValue;
        });*/
      });
    }
  }

  updateItemsPerPage(sectionList: Array<any>){
    (sectionList || []).forEach((secObj: any) => {
      if(secObj.reportType == 'Data Grid' || secObj.reportType == 'Matrix'){
        if(!secObj.itemsPerPage || secObj.itemsPerPage==''){
          secObj.itemsPerPage = '5';
        }
        if(!secObj.defaultEntryList || !secObj.defaultEntryList[0]){
          secObj.defaultEntryList = ['5','10','25','50','75','100'];
        }
      }
    });
  }

  initPaginationDetails(sectionList: Array<any>){
    (sectionList || []).forEach((secObj: any) => {
      if(!secObj.paginationDetails){
        secObj.paginationDetails = {searchText: '', currentPageNumber: 1, itemsPerPage: secObj.itemsPerPage};
        secObj.filteredSectionRecords = [];
        secObj.filteredRecordsPerPage = [];
        this.applyGlobalSearch(secObj);
      }
    });
  }

  applyGlobalSearch(secObj: any){
    var paginationDetails: any = secObj.paginationDetails;
    if(paginationDetails.searchText == ''){
      secObj.filteredSectionRecords = JSON.parse(JSON.stringify(secObj.records));
    }else{
      var displayFieldMappingList: Array<any> = [];
      (secObj.displayFields || []).forEach((fieldObj: any) => {
        if(!fieldObj.hideColumn) displayFieldMappingList.push(fieldObj.mapping);
      });
      secObj.filteredSectionRecords = (secObj.records || []).filter((record: any) => {
        var matchedObj: any = displayFieldMappingList.find((mapping: string) => {
          return ((record[mapping] || '') + '').toLowerCase().includes(paginationDetails.searchText.toLowerCase());
        });
        return matchedObj ? true : false;
      });
      console.log(secObj.filteredSectionRecords);
    }
    this.applyColumnLevelFilter(secObj);
  }

  applyColumnLevelFilter(secObj: any){
		var filterFieldDisplayList = (secObj.displayFields || []).filter((dispObj: any) => {
			if((dispObj.filterValue || []).length > 0){
				return true;
			}
		});
		if(filterFieldDisplayList.length > 0){
			secObj.filteredSectionRecords = secObj.filteredSectionRecords.filter((itemObj: any) => {
				try{
					filterFieldDisplayList.forEach((dispObj: any) => {
						var value = itemObj[dispObj.mapping];
						dispObj.filterWidget = dispObj.filterWidget || "text";
						var widgetType = dispObj.filterWidget.toUpperCase();
						if(widgetType == "DATE"){
							var filterValue = dispObj.filterValue;
							var startDateRange = filterValue[1];
							var endDateRange = filterValue[2];
							var respDateFormat = this.reports.getDateFormat(dispObj, false);
							var dispDateFormat = this.reports.getDateFormat(dispObj, true);
							var momentStartDateRangeObject = moment(startDateRange, dispDateFormat);
							var momentEndDateRangeObject = moment(endDateRange, dispDateFormat);
							var momentCurrentDateObject = moment(value, respDateFormat);
							startDateRange = momentStartDateRangeObject.valueOf();
							endDateRange = momentEndDateRangeObject.valueOf();
							value = momentCurrentDateObject.valueOf();
							if(!(value > startDateRange && value < endDateRange)){
								throw "Record Not Matched";
							}
						}else if(widgetType.toUpperCase() == "NUMBER"){
							var filterType = dispObj.filterValue[0];
							if(filterType == "equal"){
								if(value === undefined || value === null || Number(value) != dispObj.filterValue[1]){
									throw "Record Not Matched";
								}
							}else if(filterType == "notEqual"){
								if(value === null || Number(value) == dispObj.filterValue[1]){
									throw "Record Not Matched";
								}
							}else if(filterType == "greaterThan"){
								if(value === undefined || value === null || Number(value) <= dispObj.filterValue[1]){
									throw "Record Not Matched";
								}
							}else if(filterType == "greaterThanOrEqual"){
								if(value === undefined || value === null || Number(value) < dispObj.filterValue[1]){
									throw "Record Not Matched";
								}
							}else if(filterType == "lesserThan"){
								if(value === undefined || value === null || Number(value) >= dispObj.filterValue[1]){
									throw "Record Not Matched";
								}
							}else if(filterType == "lessThanOrEqual"){
								if(value === undefined || value === null || Number(value) > dispObj.filterValue[1]){
									throw "Record Not Matched";
								}
							}else if(filterType == "between"){
								if(value === undefined || value === null || Number(value) < dispObj.filterValue[1] || Number(value) > dispObj.filterValue[2]){
									throw "Record Not Matched";
								}
							}
						}else if(widgetType == "TEXT"){
							if(!isNaN(value)){
								value = value + "";
							}else{
								value  = value || "";
							}
							if(dispObj.filterValue.indexOf(value) == -1){
								throw "Record Not Matched";
							}
						}
					});
					return true;
				}catch(e){
					return false;
				}
			});
    }
    this.applySort(secObj);
  }
  applySort(secObj: any) {
    var sortPredicate = secObj.sortKey || '';
    var reverseOrder = secObj.reverse;
    var records = secObj.records;
    if(sortPredicate != ''){
      var sortedDisplayFieldObject: any = this.reports.sortedDisplayFieldObject;
      const isString = function (value) { return (typeof value === "string"); };
      const isNumber = function (value) { return (typeof value === "number"); };
      const isBoolean = function (value) { return (typeof value === "boolean"); };
      const copyObj = function (value) { return JSON.parse(JSON.stringify(value)); };
      var filterType: string = (sortedDisplayFieldObject['dataType'] || 'text').toUpperCase();
      if(filterType == 'STRING' || filterType == 'TEXT'){
        filterType = 'TEXT';
      }else if(filterType == 'NUMBER'){
        filterType = 'NUMBER';
      }else if(filterType == 'DATE' || filterType == 'DATETIME' || filterType == 'CUSTOMDATA' || filterType == 'CUSTOMDATETIME'){
        filterType = 'DATE';
      }
      var _sort = function(_array) {
        _array.sort(function (a, b) {
                var valueA = a[sortPredicate];
                var valueB = b[sortPredicate];
                if(filterType == 'NUMBER'){
                  if (valueA) valueA = Number(valueA);
                  if (valueB) valueB = Number(valueB);
                }else if(filterType == 'DATE'){
                  if (valueA) valueA = moment(valueA).valueOf();
                  if (valueB) valueB = moment(valueB).valueOf();
                }else{
                  if (valueA) valueA = valueA.toUpperCase();
                  if (valueB) valueB = valueB.toUpperCase();
                }
                if (isString(valueA))
                    return !reverseOrder ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
                if (isNumber(valueA) || isBoolean(valueA))
                    return !reverseOrder ? valueA - valueB : valueB - valueA;
                return 0;
            });
        return _array;
      }
      let arrayCopy = [];
      let array = (secObj.filteredSectionRecords || []);
      let hierarchyFieldName = "subRecords";
      if (secObj.reportSubType == "hierarchy" && (hierarchyFieldName || "").trim() != "") {
       
        var reformedArray = [];
        var formRecursiveArray= function(){
        var _fn = function(pObj, sObj){
          pObj[hierarchyFieldName] = (pObj[hierarchyFieldName] || []);
          if(sObj.epTreeInfo.parentId == pObj.epTreeInfo.id){
            pObj[hierarchyFieldName].push(copyObj(sObj));
          }else{
            pObj[hierarchyFieldName].forEach(function(cObj){
              _fn(cObj, sObj);
            });
          }
        }
        reformedArray = array.filter(function(obj){ obj[hierarchyFieldName] = []; return !obj.epTreeInfo.rootId;});
        array.filter(function(obj){ return obj.epTreeInfo.rootId;}).forEach(function(_sObj){
          var sObj = copyObj(_sObj);
          var _rootObj = reformedArray.find(function(_rObj){ return (_rObj.epTreeInfo.id == sObj.epTreeInfo.rootId); });
          _rootObj[hierarchyFieldName] = (_rootObj[hierarchyFieldName] || []);
          sObj[hierarchyFieldName] = (sObj[hierarchyFieldName] || []);
          if(sObj.epTreeInfo.parentId == _rootObj.epTreeInfo.id){
            _rootObj[hierarchyFieldName].push(copyObj(sObj));
          }else{
            _rootObj[hierarchyFieldName].forEach(function(cObj){
              _fn(cObj, sObj);
            });
          }
        });
      }
        formRecursiveArray();
        var childRecursive = function(obj) {
          if (obj.epTreeInfo.hasChild) {
            var hierarchyFieldValue = (obj[hierarchyFieldName] || []);
            hierarchyFieldValue = _sort(hierarchyFieldValue);
            hierarchyFieldValue.forEach(function(_obj) {
                childRecursive(_obj);
              });
              var nodeTotalRow = hierarchyFieldValue.find(function(row) {return row.isNodeLevelTotal;});
            if (nodeTotalRow){
              obj[hierarchyFieldName] = hierarchyFieldValue.filter(function(row) {return !row.isNodeLevelTotal;});
              obj[hierarchyFieldName].push(nodeTotalRow);
            }
          }
        }
        
        _sort(reformedArray);
        reformedArray.forEach(function(obj) {
          childRecursive(obj);
        });
        var pushToNewArray = function(obj) {
          arrayCopy.push(obj);
          if (obj.epTreeInfo.hasChild) {
            (obj[hierarchyFieldName] || []).forEach(function(_obj) {
              pushToNewArray(_obj);
            });
          }
        }
        
        reformedArray.forEach(function(obj) {pushToNewArray(obj);});
      } else {
          arrayCopy = _sort(array);
      }
      records = arrayCopy;
    }
    if (!secObj.hidePagination) {
      let currentGridComponentInstance: EpReportDataGridComponent = this.getCurrentGridInstance(secObj);
      if(currentGridComponentInstance) currentGridComponentInstance.setPage(secObj.paginationDetails.currentPageNumber);
    } else {
      secObj.filteredSectionRecords = records;
      secObj.filteredRecordsPerPage = records;
    }
  }
  _applySort(secObj: any){ //jamal sorting code
    var sortKey = secObj.sortKey || '';
    if(sortKey != ''){
      var sortedDisplayFieldObject: any = this.reports.sortedDisplayFieldObject;
      var filterType: string = (sortedDisplayFieldObject['dataType'] || 'text').toUpperCase();
      if(filterType == 'STRING' || filterType == 'TEXT'){
        filterType = 'TEXT';
      }else if(filterType == 'NUMBER'){
        filterType = 'NUMBER';
      }else if(filterType == 'DATE' || filterType == 'DATETIME' || filterType == 'CUSTOMDATA' || filterType == 'CUSTOMDATETIME'){
        filterType = 'DATE';
      }
      var compare: any = (a: object, b: object) => {
        let comparison = 0;
        let sortObjA: any = a[sortKey];
        let sortObjB: any = b[sortKey];
        if(filterType == 'NUMBER'){
          sortObjA = Number(sortObjA);
          sortObjB = Number(sortObjB);
        }else if(filterType == 'DATE'){
          sortObjA = moment(sortObjA).valueOf();
          sortObjB = moment(sortObjB).valueOf();
        }else{
          sortObjA = sortObjA.toUpperCase();
          sortObjB = sortObjB.toUpperCase();
        }
        if(isNaN(sortObjA) || isNaN(sortObjB)) return comparison;
        if (sortObjA > sortObjB) {
          comparison = 1;
        } else if (sortObjB > sortObjA) {
          comparison = -1;
        }
        return (secObj.reverse) ? (comparison * -1) : comparison;
      }
      (secObj.filteredSectionRecords).sort(compare);
    }
    if (!secObj.hidePagination) {
      let currentGridComponentInstance: EpReportDataGridComponent = this.getCurrentGridInstance(secObj);
      if(currentGridComponentInstance) currentGridComponentInstance.setPage(secObj.paginationDetails.currentPageNumber);
    } else {
      secObj.filteredSectionRecords = secObj.records;
      secObj.filteredRecordsPerPage = secObj.records;
    }
  }

  cleanRequestData(req: any){
    var req = JSON.parse(JSON.stringify(req));
    
    var _deleteAttr = (list: Array<any>) => {
      (list || []).forEach((obj: any) => {
        delete obj.attrList;
        delete obj.isAttrLoaded;
        //TODO: remove userValueList additional attrs
      });
    };
    _deleteAttr(req.userValueList);
    _deleteAttr(req.exportUserValueList);
    _deleteAttr(req.tabUserValueList);
    
    if(req.reqMeta){
      _deleteAttr(req.reqMeta.userValueList);
      _deleteAttr(req.reqMeta.exportUserValueList);
      (req.reqMeta.clubbed || []).forEach((clubbedObj:any) => {
        (clubbedObj.sectionList || []).forEach((sectionObj: any) => {
          _deleteAttr((sectionObj.report_metadata || {}).exportUserValueList);
        });
      });
    }
    if(req.template && req.template.templateDetails){
      var templateDetails = req.template.templateDetails;
      Object.keys(templateDetails).forEach((obj: any) => {
        _deleteAttr(obj.reportCriteria);
      });
    }
    return req;
  }

  updateFilterPerRowDetails(res: any){
    res.filtersPerRow = res.filtersPerRow || '4_3';
    res.filterPerRowList = [];
    var filterDetailsSplit = [];
    var userValueListLength: number = (res.userValueList || []).length;
    if((res.customizeTabs || {}).customize) userValueListLength += 1;
    if(res.filtersPerRow == 'custom'){
      var customizedFilterPerRow = [];
      if((res.customizedFilterPerRow || '') != ''){
        customizedFilterPerRow = (res.customizedFilterPerRow || '').split(',')
      }
      for(var i=0; i<userValueListLength; i++){
        res.filterPerRowList.push(Number(customizedFilterPerRow[i]) || 3);
      }
    }else{
      filterDetailsSplit = res.filtersPerRow.split('_');
      for(var j=0; j<userValueListLength; j++){
        res.filterPerRowList.push(isNaN(filterDetailsSplit[1]) ? filterDetailsSplit[1] : Number(filterDetailsSplit[1]));
      }
    }
    if(res.filterPerRowList.length > 0){
      if(isNaN(res.filterPerRowList[0])){
        if(userValueListLength % Number(filterDetailsSplit[0]) == 0){
          res.filterActionBtnCont = false;
        }else{
          res.consolidatedFilterRowSpaceCount = filterDetailsSplit[1];
          res.filterActionBtnCont = true;
        }
      }else{
        var consolidatedFilterRowSpaceCount = 0;
        for(let k=0; k<res.filterPerRowList.length; k++){
          consolidatedFilterRowSpaceCount += res.filterPerRowList[k];
          if(consolidatedFilterRowSpaceCount == 12) consolidatedFilterRowSpaceCount = 0;
          if(consolidatedFilterRowSpaceCount > 12) consolidatedFilterRowSpaceCount = res.filterPerRowList[k];
        }
        if(consolidatedFilterRowSpaceCount == 0){
          res.filterActionBtnCont = false;
        }else{
          res.consolidatedFilterRowSpaceCount = 12 - consolidatedFilterRowSpaceCount;
          res.filterActionBtnCont = true;
        }
      }
      if((res.customizeTabs || {}).customize) res.customizeTabs.filterPerRow = res.filterPerRowList.splice(0,1);
    }
  }

  updateCustomizeTabResponse(res: any){
    (res.customizeTabs.mandatoryTabList || []).forEach((tabId: string) => {
      if(res.customizeTabs.defaultTabList.indexOf(tabId) == -1){
        res.customizeTabs.defaultTabList.push(tabId);
      }
    });
    this.reports.customizedTab_reportMetaData = JSON.parse(JSON.stringify(res));
    var customizeTabObject = this.reports.customizedTab_reportMetaData.customizeTabs || {};
    res.clubbed = (this.reports.customizedTab_reportMetaData.clubbed || []).filter((tabObj: any) => {
      return customizeTabObject.defaultTabList.indexOf(tabObj.id) != -1;
    });
  }

  updateClubbedUserValueList(res: any, isCustomizeTabBuild?: boolean){
    if(isCustomizeTabBuild){
      var getUserValueListObjectRef: any = () => {
        var returnObject = {};
        (res.userValueList || []).forEach((userObj: any) => {
          returnObject[userObj.givenName] = userObj;
        });
        return returnObject;
      }
      var userValueListObjectRef: any = getUserValueListObjectRef();
    }
    res.userValueList = [];
    (res.clubbed || []).forEach((clubObj: any) => {
      (clubObj.sectionList || []).forEach((secObj: any) => {
        if(secObj.report_metadata && secObj.report_metadata.userValueList && secObj.report_metadata.userValueList.length > 0){
          secObj.report_metadata.userValueList.forEach((userObj: any) => {
            userObj.inputType = secObj.report_metadata.inputType;
            userObj.api = secObj.report_metadata.apiContent.dimension.api;
            let matchedFlag: boolean = false;
            (res.userValueList).forEach((userListObj: any) => {
              if(userListObj.givenName == userObj.givenName){
                userListObj.isMandatory = userListObj.isMandatory || userObj.isMandatory;
                matchedFlag = true;
              }
            })
            if(!matchedFlag){
              if(isCustomizeTabBuild && (userValueListObjectRef || {})[userObj.givenName]){
                userObj = userValueListObjectRef[userObj.givenName];
              }else{
                userObj.userValueQuery = secObj.report_metadata.userValueQuery;
              }
              res.userValueList.push(userObj);
            }
          });
        }
      });
    });
  }

  loadDefaultsUserValueList(res: any){
    (res.userValueList || []).forEach((userObj: any) => {
      if(userObj.isRangeSelector || userObj.operation=='BETWEEN' || userObj.widget == 'Number Picker'){
        userObj.enteredValue = ['',''];
      }
                
      if(userObj.isDefaultFilter){
        var dateFormat: string = '';
        var parseInNeeded: any = (data: any) => {
          try{
            data = eval(data);
          }catch(e){}
          return data;
        };
        var getDateFormat: any = () => {
              let format: string = userObj.attrDateFormat || '';
              if(userObj.widget == 'DateTime Picker'){
                if(format == ''){
                  try{
                    format = JSON.parse(sessionStorage.generalConfiguration)[sessionStorage.getItem('ep-accountname')].defaultDateTimeFormat;
                    if(format == ''){
                      format = 'yyyy/MM/dd HH:mm:ss';
                        }
                  }catch(e){
                    
                    format = 'yyyy/MM/dd HH:mm:ss';
                  }
                }
              }else if(userObj.widget == 'Date Picker'){
                if(format == ''){
                    try{
                      format = JSON.parse(sessionStorage.generalConfiguration)[sessionStorage.getItem('ep-accountname')].defaultDateFormat;
                      if(format == ''){
                        format = 'yyyy/MM/dd';
                          }
                    }catch(e){
                      
                      format = 'yyyy/MM/dd';
                    }
                  }
              }else if(userObj.widget == 'Month Picker'){
                try{
                  format = JSON.parse(sessionStorage.generalConfiguration)[sessionStorage.getItem('ep-accountname')].defaultDateFormat;
                  if(format != ''){
                    format = format.toUpperCase();
                    format = this.strings.replaceAll(format, 'D', '').trim();
                    if(format.startsWith('-') || format.startsWith('/')){
                      format = format.substring(1);
                    }else if(format.endsWith('-') || format.endsWith('/')){
                      format = format.substring(0, format.length - 1);
                    }
                      }else{
                    format = 'yyyy/MM';
                  }
                }catch(e){
                  
                  format = 'yyyy/MM';
                }
              }else if(userObj.widget == 'Year Picker'){
                format = 'yyyy';
              }
              return format;
        };
        
        var getParamValue: any = (key: any) => {
          var regExp = /\(([^)]+)\)/;
          return regExp.exec(key);
        };
        
        var getUpdatedEnteredValue = (attrValue: string) => {
          if(attrValue == 'DATETIME'){
            return userObj.attrDateKey;
          }else if(attrValue == 'CURRENT_MONTH'){
            this.monthFormatUpdate(userObj);
          }else if(attrValue == 'CURRENT_YEAR'){
            this.yearFormatUpdate(userObj);
          }else if(attrValue == 'CURRENT_DATETIME'){
            dateFormat = getDateFormat();
            return moment().format(this.reports.getMomentDateFormat(dateFormat));
          }else if(attrValue.startsWith('CALCULATE_DATETIME(')){
            var paramVal = getParamValue(attrValue);
            try{
              if(paramVal){
                var splitStr = paramVal[1].split(', ');
                var value = splitStr[0];
                var type = splitStr[1]; 
                dateFormat = getDateFormat();
                return moment().add(value,type).format(this.reports.getMomentDateFormat(dateFormat));
              }
            }catch(e){
              console.log('Exception Caught' + e);
              return '';
            }
          }else if(attrValue.startsWith('CUSTOM_DATETIME(')){
            var paramVal = getParamValue(attrValue);
            try{
              if(paramVal){
                dateFormat = paramVal[1];
                return moment().add(value,type).format(this.reports.getMomentDateFormat(dateFormat));
              }
            }catch(e){
              console.log('Exception Caught' + e);
              return '';
            }
          }else{
            return parseInNeeded(attrValue);
          }
          return '';
        }
        if(userObj.isRangeSelector && userObj.attrValue && userObj.attrEndValue){
          //userObj.enteredValue = ['',''];
          if(userObj.attrValue == 'DATETIME'){
            userObj.enteredValue[0] = userObj.attrDateKey;
          }else if(userObj.attrValue == 'CURRENT_MONTH'){
            this.monthFormatUpdate(userObj);
          }else if(userObj.attrValue == 'CURRENT_YEAR'){
            this.yearFormatUpdate(userObj);
          }else{
            userObj.enteredValue[0] = getUpdatedEnteredValue(userObj.attrValue);
            userObj.defaultClearValue = userObj.defaultClearValue || [];
            userObj.defaultClearValue[0] = userObj.enteredValue[0];
          }
          userObj.enteredValue[1] = getUpdatedEnteredValue(userObj.attrEndValue);
          userObj.defaultClearValue = userObj.defaultClearValue || [];
          userObj.defaultClearValue[1] = userObj.enteredValue[1];
        }else if(userObj.attrValue && userObj.attrValue != '') {
          userObj.enteredValue = getUpdatedEnteredValue(userObj.attrValue);
          userObj.defaultClearValue = userObj.enteredValue;
        }
      }
      let locationObj: any = this.currentRouteParamObject.keys;
      if (locationObj[userObj.givenName]) {
        var locationValue: any = null;
        this.reports.isLocationFilter = true;
        if (locationObj[userObj.givenName].startsWith('[') && locationObj[userObj.givenName].endsWith(']')) {
          try {
            locationValue = eval(locationObj[userObj.givenName]);
          } catch (e) { }
        } else {
          locationValue = [];
          locationValue.push(locationObj[userObj.givenName]);
        }
        userObj.enteredValue = locationValue;
        userObj.defaultClearValue = locationValue;
      }
    });
  }

  monthFormatUpdate(userObj: any){
    var format: string = '';
    try {
      format = JSON.parse(sessionStorage.generalConfiguration)[sessionStorage.getItem('ep-accountname')].defaultDateFormat;
      if (format != '') {
        format = format.toUpperCase();
        format = this.strings.replaceAll(format, 'D', '').trim();
        if (format.startsWith('-') || format.startsWith('/')) {
          format = format.substring(1);
        } else if (format.endsWith('-') || format.endsWith('/')) {
          format = format.substring(0, format.length - 1);
        }
      } else {
        format = 'YYYY/MM';
      }
    } catch (e) {
      
      format = 'YYYY/MM';
    }
    var parseInNeeded: any = (data: any) => {
      try {
        data = eval(data);
      } catch (e) { }
      return data;
    };
    if (userObj != '') {
      let today: Date = new Date();
      let year: any = today.getFullYear();
      let month: any = today.getMonth() + 1 + userObj.interval;
      if (month < 10) {
        month = '0' + month;
      }
      if (userObj.isDefaultFilter) {
        if (userObj.isRangeSelector && userObj.attrValue && userObj.attrEndValue) {
          userObj.enteredValue = ['', ''];
          userObj.enteredValue[0] = this.strings.replaceAll(format, 'YYYY', year);
          userObj.enteredValue[0] = this.strings.replaceAll(userObj.enteredValue[0], 'MM', month);
          //userObj.enteredValue[0] = userObj.attrValue;
          userObj.enteredValue[1] = userObj.attrEndValue;
        } else if (userObj.attrValue && userObj.attrValue != '') {
          userObj.enteredValue = this.strings.replaceAll(format, 'YYYY', year);
          userObj.enteredValue = this.strings.replaceAll(userObj.enteredValue, 'MM', month);
        }
      }
    }
  }

  yearFormatUpdate(userObj: any){
    let format: string = 'YYYY';
    //var userObj = scope.$parent.rep || '';
    if (userObj != '') {
      let today: Date = new Date();
      let year: string = today.getFullYear() + (userObj.interval || 0);
      if (userObj.isDefaultFilter) {
        if (userObj.isRangeSelector && userObj.attrValue && userObj.attrEndValue) {
          userObj.enteredValue = ['', ''];
          userObj.enteredValue[0] = this.strings.replaceAll(format, 'YYYY', year);
          //userObj.enteredValue[0] = userObj.attrValue;
          userObj.enteredValue[1] = userObj.attrEndValue;
        } else if (userObj.attrValue && userObj.attrValue != '') {
          userObj.enteredValue = this.strings.replaceAll(format, 'YYYY', year);
          //userObj.enteredValue = parseInNeeded(userObj.attrValue);
        }
      }
    }
  }

  manipulateClubbedUserValueList(isCustomizeTabBuild?: boolean){
    this.buildUserList();
    this.arrangeUserList();
    this.apiService.invokePlatformApi('/eportal/api/object/getMetaData', 'POST', {}).subscribe(
      (objData: any) => {
        objData = objData.body || {};
        if(objData.objects){
					objData.objects.forEach((obj: any) => {
						if(obj.type == 'OBJECT'){
							this.reports.objectMetaData.objectData[obj.model] = obj;
						}else if(obj.type == 'ENUM'){
							this.reports.objectMetaData.enumData[obj.model] = obj;
						}
					});
					/*sc.reports.cloneUserList = res.userValueList; 
					_this.buildUserList();
					_this.arrangeUserList();*/
					
					this.updateEnumObjects();
					/*sc.$$postDigest(function(){
            $('.attrMultiSelect').select2();
					});*/
				}
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        
      }
    );
    if(!isCustomizeTabBuild){
      setTimeout(() => {
        this.executeEnteredValue(true);
      }, 0);
    }
  }

  buildUserList(){
    var optionalMandatoryUserList: Array<any> = [];
    var optionalMandatoryGivenNameList: Array<any> = [];
    var filteredUserList: Array<any> = [];
    this.reports.cloneUserList = this.reports.cloneUserList || [];
    if(this.reports.reportMetaData.userValueList.length > 0 && this.reports.cloneUserList.length == 0){
      this.reports.cloneUserList = JSON.parse(JSON.stringify(this.reports.reportMetaData.userValueList));
    }
    (this.reports.cloneUserList || []).forEach((userObj: any) => {
      userObj.isAttrLoaded = false;
      if(userObj.mandatoryType && userObj.mandatoryType == 'group'){
        optionalMandatoryUserList.push(userObj); 
        optionalMandatoryGivenNameList.push(userObj.givenName);
      }else{
        filteredUserList.push(userObj); 
      }
    });
    if(optionalMandatoryGivenNameList.length > 0){
      var newObj: object = {};
      newObj['type'] = 'combinedList';
      (optionalMandatoryUserList).forEach((opUserObj) => {
        if(opUserObj.isSelected && opUserObj.enteredValue){
          newObj['selectedGroupName'] = opUserObj.givenName;
          Object.keys(opUserObj).forEach((key: any) => {
            newObj[key] = opUserObj[key];
          });
        }
      });
      newObj['givenNameList'] = optionalMandatoryGivenNameList;
      filteredUserList.push(newObj);
    }
    this.reports.reportMetaData.userValueList = filteredUserList;
    console.log(optionalMandatoryUserList);
    console.log(filteredUserList);
  }

  arrangeUserList(){
    var groupUserList: Array<any> = [];
    var mandatoryUserList: Array<any> = [];
    var optionalUserList: Array<any> = [];
    var orderedList: Array<any> = [];
    (this.reports.reportMetaData.userValueList || []).forEach((userObj: any) => {
      if(userObj.mandatoryType == 'group' || userObj.type == 'combinedList'){
        groupUserList.push(userObj);
      }else if(userObj.mandatoryType == 'mandatory'){
        mandatoryUserList.push(userObj);
      }else{
        optionalUserList.push(userObj);
      }
    });
    orderedList = groupUserList.concat(mandatoryUserList,optionalUserList); 
    this.reports.reportMetaData.userValueList = orderedList;
    (this.reports.reportMetaData.userValueList || []).forEach((orderedObj: any, index: number) => {
      if(orderedObj.type == 'combinedList' && !orderedObj.givenName){
        this.reports.updateUserGroup(index, orderedObj.givenNameList[0]);
      }
    });
    this.reports.isUserListLoaded = true;
  }

  updateEnumObjects(){
    var callCount: number = 0;
    var recieveCount: number = 0;
    var parseInNeeded = (data: any) => {
      try{
        data = eval(data);
      }catch(e){}
      return data;
    };
    (this.reports.cloneUserList || []).forEach((userObj: any) => {
      if(userObj.attrValue != 'CURRENT_YEAR' && userObj.attrValue != 'CURRENT_DATETIME' && userObj.attrValue != 'CURRENT_MONTH' 
        && userObj.attrValue != 'CURRENT_DAY' && userObj.attrValue != 'LAST_12_MONTH' && userObj.attrValue != 'DATETIME'){
        var nodeObj = this.reports.objectMetaData.objectData[userObj.nodeName] || {};
        (nodeObj.attributes || []).forEach((attrObj: any) => {
          if(attrObj.name == userObj.attr.substring(userObj.attr.indexOf('.')+1)){
            if(attrObj.isEnum == true){
              userObj.attrList = JSON.parse(JSON.stringify(attrObj.enumList));
              if(userObj.mandatoryType == 'group'){
                (this.reports.reportMetaData.userValueList || []).forEach((grpObj: any) => {
                  if(grpObj.type == 'combinedList' && (grpObj.givenName == userObj.givenName)){
                    grpObj.attrList = JSON.parse(JSON.stringify(attrObj.enumList));
                  }
                });
              }
            }else if(userObj.givenEnum && userObj.givenEnum != ''){
              userObj.attrList = eval(userObj.givenEnum);   // userObj.givenEnum.split(',');
              if(userObj.mandatoryType == 'group'){
                (this.reports.reportMetaData.userValueList || []).forEach((grpObj: any) => {
                  if(grpObj.type == 'combinedList' && (grpObj.givenName == userObj.givenName)){
                    grpObj.attrList = eval(userObj.givenEnum); 
                  }
                });
              }
            }else if((userObj.isMandatory && userObj.isDefaultFilter) || userObj.onLoad){
              var distinctQuery = userObj.userValueQuery || this.reports.reportMetaData.userValueQuery || '';
              var apiFlag = false;
              var apiId = '';
              var inputType = this.reports.reportMetaData.inputType;
              if(this.reports.reportMetaData.reportViews == 'Clubbed'){
                inputType = userObj.inputType;
              }
              if(inputType=='DATABASE' && distinctQuery != ''){
                distinctQuery += ' RETURN DISTINCT (' + userObj.attr + ')';
                apiFlag = true;
              }else if(inputType=='API'){
                apiFlag = true;
                if(this.reports.reportMetaData.reportViews == 'Clubbed'){
                  apiId = userObj.api;
                }else{
                  apiId = this.reports.reportMetaData.apiContent.dimension.api;										
                }
              }
              if(apiFlag){
                var userListId = this.strings.getRandomId();
                userObj.id = userListId;
                callCount++;
                let reqObj: object = {id: userListId, query: distinctQuery, modelName: userObj.nodeName, inputType: inputType, apiId: apiId, filterField: userObj.attr}
                this.apiService.invokePlatformApi('/eportal/api/execute/report/distinctData', 'POST', reqObj).subscribe(
                  (res: any) => {
                    var _resp: any = res.body;
                    (this.reports.cloneUserList).forEach((userFindObj: any) => {
                      if(userFindObj.id == _resp.id){
                        userFindObj.attrList = _resp.attrList;
                        userFindObj.isAttrLoaded = true;
                        if(userFindObj.hideLoaderFunction) userFindObj.hideLoaderFunction();
                        if(userFindObj.mandatoryType == 'group'){
                          (this.reports.reportMetaData.userValueList || []).forEach((grpObj: any) => {
                            if(grpObj.type == 'combinedList' && (grpObj.givenName == userFindObj.givenName)){
                              grpObj.attrList = _resp.attrList;
                            }
                          });
                        }
                      }
                    });
                    recieveCount++;
                    if(callCount == recieveCount){
                      this.reports.isUserListLoaded = true;
                      this.applyDefaultFilter();
                    }
                  },
                  (err: any) => {
                    recieveCount++;
                    this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
                    
                  }
                );
              }
            }
          }
        })
      }
    });
  }

  applyDefaultFilter(){
    //if(sc.reports.isReportExecuted && sc.reports.isUserListLoaded){
    if(this.reports.isFiltersLoaded && this.reports.isUserListLoaded){
      var matchedObj = (this.reports.reportFilters).filter((filObj: object) => {
        return filObj['isDefault'] == 'YES';
      })[0];
      this.reports.isUserListLoaded = false;
      if(matchedObj){
        if(!this.reports.isLocationFilter){
          this.applyFilter(matchedObj.filterId);	
        }
      }else{
        this.reports.isApplicationFilterDefault = true;
        this.reports.appliedFilterId = 'applicationFilter';
      }
    }
  }

  applyFilter(filterId: string){
    var matchedObj: any = (this.reports.reportFilters).filter((filObj) => {
      return filObj.filterId == filterId;
    })[0];
    this.reports.filterMetadata = JSON.parse(matchedObj.metadata);
    //load customized tab object
    if(this.reports.filterMetadata.tabListCriteria && (((this.reports.customizedTab_reportMetaData || {}).customizeTabs || {}).customize)){
      var customizedTabReportMetaData = this.reports.customizedTab_reportMetaData;
      var customizeTabObject = customizedTabReportMetaData.customizeTabs || {};
      var getCurrentTabObject: any = (tabId: string) => {
        return (customizedTabReportMetaData.clubbed || []).find((tabObj: any) => {
          return tabObj.id == tabId;
        });
      }
      var getSelectedOptionList = () => {
        var returnList: string[] = [];
        (this.reports.filterMetadata.tabListCriteria || []).forEach((tabId: any) => {
          var current_tabObject = getCurrentTabObject(tabId);
          if(current_tabObject) returnList.push(current_tabObject.tabName);
        });
        return returnList;
      }
      var getUpdatedClubbedList = () => {
        var selectedTabIds: any = customizeTabObject.epMultiSelectWidget.getSelectedIdList();
        return (customizedTabReportMetaData.clubbed || []).filter((tabObj: any) => {
              return selectedTabIds.indexOf(tabObj.id) != -1;
        });
      }
      var applyTabListCriteria = () => {
        var reportMetaData = this.reports.reportMetaData;
        reportMetaData.clubbed = getUpdatedClubbedList();
        this.updateClubbedUserValueList(reportMetaData, true);
      }
      customizeTabObject.epMultiSelectLoadObject.selectedOptionList = getSelectedOptionList();
      customizeTabObject.epMultiSelectWidget.load(customizeTabObject.epMultiSelectLoadObject);
      applyTabListCriteria();
    }
    
    var filterMetadata: any = {};
    (this.reports.filterMetadata.userCriteria || []).forEach((criObj: any) => {
      if(criObj.givenName){
        var tempObj = {enteredValue : criObj.enteredValue, isSelectedAll : criObj.isSelectedAll};
        filterMetadata[criObj.givenName] = tempObj;
      }
    });
    var mandatoryGroupObj = (this.reports.cloneUserList).filter((clObj: any) => {
      if(filterMetadata[clObj.givenName]){
        return clObj.mandatoryType == 'group';
      }
    })[0];
    if(mandatoryGroupObj){
      this.reports.updateUserGroup(0,mandatoryGroupObj.givenName);
    }
    (this.reports.reportMetaData.userValueList).forEach((userObj: any) => {
      let dateWidgetType: string;
      if(userObj.widget == 'DateTime Picker'){
        dateWidgetType = 'DATETIME';
      }else if(userObj.widget == 'Date Picker'){
        dateWidgetType = 'DATE';
      }
      if(filterMetadata[userObj.givenName]){
        if(dateWidgetType){
          this.updateDateWidgetModelValues(filterMetadata, userObj, dateWidgetType);
        }else{
          userObj.enteredValue = filterMetadata[userObj.givenName].enteredValue;
        }
      }else if(userObj.isRangeSelector || userObj.widget == 'Number Picker'){
        userObj.enteredValue = ['',''];
      }else{
        userObj.enteredValue = '';
      }
    });
    setTimeout(() => {
      this.executeEnteredValue(null,true);
      this.reports.appliedFilterId = filterId;
      $('#manage_filter_Modal').modal('hide');
    }, 0);
  }

  clearFilter(){
    this.reports.disableSaveFilter = true;
    this.reports.disableExport = true;
    var parseInNeeded = (data: any) => {
      try{
        data = eval(data);
      }catch(e){}
      return data;
    };
    
    (this.reports.reportMetaData.userValueList || []).forEach((userObj: any) => {
      if(userObj.isRangeSelector || (userObj.isMandatory && userObj.mandatoryType == "group")){
        userObj.enteredValue = [];	
        delete userObj.enteredStartDateModel;
        delete userObj.enteredEndDateModel;			
      }else if(userObj.widget == "Number Picker"){
        userObj.enteredValue = ['',''];
      }else{
        delete userObj.enteredDateModel;
        delete userObj.enteredValue;
      }
      if(userObj.epMultiSelectWidget){
        userObj.isSelectedAll = false;
      }
      if(userObj.isDefaultFilter){
        if(userObj.defaultClearValue){
          userObj.enteredValue = userObj.defaultClearValue;
        }else{
          userObj.enteredValue = parseInNeeded(userObj.attrValue);
        }
        
      }
    });
    
    var res: any = this.reports.reportMetaData;
    if(res.reportViews === "Clubbed" && (res.customizeTabs || {} ).customize){
      try{
        var customizeTabObject = res.customizeTabs || {};
        var epMultiSelectWidget = this.reports.customizedTab_reportMetaData.customizeTabs.epMultiSelectWidget;
        if(epMultiSelectWidget){
          epMultiSelectWidget.load({
            optionList: epMultiSelectWidget._optionList.concat([]),
            optionList_id: epMultiSelectWidget._optionList_id.concat([]),
            selectedOptionList:  epMultiSelectWidget._optionList.concat([])
        });
          res.clubbed  = (this.reports.customizedTab_reportMetaData.clubbed || []).filter((tabObj: any) => {
                    return customizeTabObject.defaultTabList.indexOf(tabObj.id) != -1;
                  });						
        }
      }
      catch(e){
        
      }
      
    }
    
  }

  customizeTabOnClose(){
    this.updateClubbedUserValueList(this.reports.reportMetaData, true);
    if(this.reports.reportMetaData.userValueList.length > 0){
      this.updateFilterPerRowDetails(this.reports.reportMetaData);
      this.loadDefaultsUserValueList(this.reports.reportMetaData);
      this.reports.cloneUserList = JSON.parse(JSON.stringify(this.reports.reportMetaData.userValueList)); 
      this.manipulateClubbedUserValueList(true);
    }
    this.apiService.loaderShow('loader', ' Loading...');
    this.reports.hideUserValueList = true;
    setTimeout(() => {
      this.reports.hideUserValueList = false;
      setTimeout(() => {
        this.apiService.loaderHide('loader');
      }, 500);
    }, 100);
  }

  exportReport(isExportAll: boolean){
    this.reports.isSingleAvailable = false;
    if(this.reports.reportMetaData.hasOwnProperty('typesVisibility')){
      var visibilitiesType: Array<string> = ['isExcelVisible', 'isPdfVisible', 'isWordVisible','isCsvVisible'];
      var typesVisibility = this.reports.reportMetaData.typesVisibility;
      if(typesVisibility.isExcelVisible){
        this.reports.exportType = 'excel';
      }else if(typesVisibility.isPdfVisible){
        this.reports.exportType = 'pdf';
      }else if(typesVisibility.isCsvVisible){
        this.reports.exportType = 'csv';
      }else{
        this.reports.exportType = 'word';
      }
      var visibilityLength = 0;
      visibilitiesType.forEach((type: string) => {
        if(typesVisibility[type]){
          visibilityLength = visibilityLength + 1;
        }
      });
      if(visibilityLength < 2){
        this.reports.isSingleAvailable = true;
      }
    }else{
      this.reports.exportType = 'excel';
    }
    this.reports.isExportAll = isExportAll;
    this.reports.imgData = [];
    if(this.reports.actualReportResponse.reportViews == 'Single'){
      this.reports.actualReportResponse.single.updatedTemplateId = this.reports.actualReportResponse.single.templateId;
      this.reports.actualReportResponse.single.imageContent = [];
      this.customizeCoverPage(this.reports.actualReportResponse.single.updatedTemplateId);
    }else if(this.reports.actualReportResponse.reportViews == 'Multiple'){
      this.reports.actualReportResponse.multiple.forEach((mulObj: any) => {
        mulObj.updatedTemplateId = mulObj.templateId;
      });
    }else if(this.reports.actualReportResponse.reportViews == 'Clubbed'){
      this.reports.actualReportResponse.clubbed.forEach((mulObj: any) => {
        mulObj.updatedTemplateId = mulObj.templateId;
      });
      if(this.reports.isExportAll){
        this.customizeCoverPage(this.reports.actualReportResponse.clubbed[0].updatedTemplateId);
      }else{
        var selectedTabObject = this.reports.actualReportResponse.clubbed.find((tab: any) => {
          return tab.id == this.reports.activeTab.id;
        });
        this.customizeCoverPage((selectedTabObject || {}).updatedTemplateId);
      }
    }
    $('#export-report-dlg').modal('show');
    //this.processChartFromFrames();
  }

  customizeCoverPage(updatedTemplateId: string){
    var selectedTemplateObject = this.reports.templateDetails[updatedTemplateId] || {};
    if(selectedTemplateObject.isCoverPageNeeded && selectedTemplateObject.isCustomExportCoverPage){
      this.reports.isValidUpdatedTmpltIdSelected = true;
      this.reports.actualReportResponse.includeCoverPage = true;
    }else{
      this.reports.isValidUpdatedTmpltIdSelected = false;
      this.reports.actualReportResponse.includeCoverPage = false;
    }
  }

  download(){
    var loadImageContent = (clonedReportSection: any) => {
      this.reports.charts.find((chartObj: any) => {
        if(chartObj.sectionId == clonedReportSection.sectionId){
          clonedReportSection.imageContent = chartObj.imageContent;
          return true;
        }
      });
    };
    var headers: object = JSON.parse(JSON.stringify(this.apiService.getDefaultHeaders()));
    var requestObj: any = JSON.parse(JSON.stringify(this.reports.actualReportResponse));
    requestObj.userValueList = [];
    (this.reports.reportMetaData.userValueList || []).forEach((userObj: any) => {
      if(userObj.givenName){
        (this.reports.cloneUserList || []).forEach((cloneUserObj: any) => {
          if(cloneUserObj.givenName == userObj.givenName){
            requestObj.userValueList.push(cloneUserObj);
          }
        });
      }
    });
    requestObj.exportType = this.reports.exportType;
    var clonedReportMetaData: any = JSON.parse(JSON.stringify(this.reports.reportMetaData));
    //clonedReportMetaData.name = sc.gettextCatalog.getString(clonedReportMetaData.name);
    clonedReportMetaData.exportType = this.reports.exportType;
    var reportViews: string = requestObj.reportViews;
    var curTabIndex = null;
    if(!this.reports.isExportAll){
      if(reportViews == 'Clubbed'){
        var activeTabId = this.reports.activeTab.id;
        requestObj.clubbed = requestObj.clubbed.filter((tabObj: any, index: number) => {
          if(tabObj.id == activeTabId){
            curTabIndex = index;
            return tabObj;
          }
        });
        if(curTabIndex != null){
          clonedReportMetaData.clubbed = clonedReportMetaData.clubbed.splice(curTabIndex, 1);
        }
      }
    }
    var postEntity: any = {reqMeta: requestObj , template:{reportViews: 'Template', templateDetails : {}, includeCoverPage: requestObj.includeCoverPage}};
    if(requestObj.reportViews == 'Single'){
      var _reportTabResponse: any = this.reports.reportTabResponseList[0] || {};
      var _reportSectionResponse: any = (_reportTabResponse.sectionList || [])[0] || {};
      var _reportTabTemplateDetails: any = _reportSectionResponse.templateDetails;
      if(requestObj.single.isDrillDownReportResult){
        clonedReportMetaData.single = requestObj.single;
        clonedReportMetaData.single.isExternal = 'false';
        clonedReportMetaData.single.templateDetails = _reportTabTemplateDetails;
      }else{
        if(!clonedReportMetaData.single.showFilter && (clonedReportMetaData.single.customExport || 'external') == 'external'){
          clonedReportMetaData.single.isExternal = 'true';
        }else{
          clonedReportMetaData.single = requestObj.single;
          clonedReportMetaData.single.isExternal = 'false';
          clonedReportMetaData.single.templateDetails = _reportTabTemplateDetails;
          //TODO: Yet to be implemented
          //clonedReportMetaData.single.records = paginationService.getFilteredRecord(requestObj.single.sectionId); // requestObj.single.records;
        }
      }

      clonedReportMetaData.single.uiFilter = {};
      clonedReportMetaData.single.uiFilter.globalSearch = this.reports.activeTab.sectionList[0].searchTable || '';
      //clonedReportMetaData.singleTabName = scope.gettextCatalog.getString(clonedReportMetaData.singleTabName);
      clonedReportMetaData.single.uiFilter.fieldSearch = '';
      var fieldSearchData = [];
      (requestObj.single.displayFields || []).forEach((secDisplayObj: any) => {
        if(secDisplayObj.filterValue && secDisplayObj.filterValue.length > 0){
          var filterValue_copy: Array<any> = [].concat(secDisplayObj.filterValue || []);
          var blankDataIndex: number = filterValue_copy.indexOf('');
          //below codes are commented because multilanguage is not yet implemented
          // if(secDisplayObj.epMultiSelectWidget && blankDataIndex != -1){
          //   filterValue_copy[blankDataIndex] = sc.gettextCatalog.getString('(Blanks)');
          // }
          var filterData: string = secDisplayObj.name + ': ' + (filterValue_copy).join(', ');
          fieldSearchData.push(filterData);
        }
      });
      clonedReportMetaData.single.uiFilter.fieldSearch = fieldSearchData.join(' AND ');
      if(_reportTabTemplateDetails && clonedReportMetaData.single.uiFilter){
        (_reportTabTemplateDetails.title_rowList || []).forEach((tempRowObj: any) => {
          (tempRowObj.columnList || []).forEach((tempColObj: any) => {
            if(tempColObj.isGlobalSearch){
              tempColObj.text = clonedReportMetaData.single.uiFilter.globalSearch;
            }else if(tempColObj.isFieldSearch){
              tempColObj.text = clonedReportMetaData.single.uiFilter.fieldSearch;
            }
          });
        });
      }
      
      let printSettingsObj: any = ((clonedReportMetaData.single.templateDetails || {}).printSettings || {});
      if(printSettingsObj.exportDateTimeFileName)
        printSettingsObj.fileName = this.updateDynamicValue(printSettingsObj, 'exportDateTimeFileName', printSettingsObj.fileName, headers);
      loadImageContent(clonedReportMetaData.single);
      clonedReportMetaData.single.showTemplate = true;
      clonedReportMetaData.userValueList = clonedReportMetaData.exportUserValueList;
      postEntity.template.parentTabId = requestObj.single.id;
      postEntity.template.templateDetails[requestObj.single.id] = {templateId: requestObj.single.updatedTemplateId, matrixData: {}, exportFileName: requestObj.name, name: requestObj.name, reportCriteria: requestObj.userValueList};
    }else if(requestObj.reportViews == 'Clubbed'){
      requestObj.clubbed.forEach((tabObj: any, index: number) => {
        var tabUserList: Array<any> = [];
        var filteredRecord: Array<any> = [];
        tabObj.sectionList.forEach((sectionObj: any, sectionIndex: number) => {
          var clonedReportSection: any = clonedReportMetaData.clubbed[index].sectionList[sectionIndex];
          var clonedSectionReportMeta: any = clonedReportSection.report_metadata;
          if(sectionIndex == 0){
            clonedSectionReportMeta.callTemplateFlag = true;
          }
          if(tabObj.id == this.reports.activeTab.id){
            clonedSectionReportMeta.uiFilter = {};
            clonedSectionReportMeta.uiFilter.globalSearch = this.reports.activeTab.sectionList[sectionIndex].searchTable || '';
            clonedSectionReportMeta.uiFilter.fieldSearch = '';
            var fieldSearchData: Array<any> = [];
            (sectionObj.displayFields || []).forEach((secDisplayObj: any) => {
              if(secDisplayObj.filterValue && secDisplayObj.filterValue.length > 0){
                var filterData = secDisplayObj.name + ': ' + (secDisplayObj.filterValue || []).join(', ');
                fieldSearchData.push(filterData);
              }
            });
            clonedSectionReportMeta.uiFilter.fieldSearch = fieldSearchData.join(' AND ');
          }
          clonedSectionReportMeta.isClubViewReport = true;
          var exportUserValueList: Array<any> = JSON.parse(JSON.stringify(clonedSectionReportMeta.exportUserValueList || []));
          clonedSectionReportMeta.userValueList = exportUserValueList;
          clonedSectionReportMeta.single.templateId = tabObj.templateId;
          clonedSectionReportMeta.single.showTemplate = tabObj.showTemplate;
          if(sectionObj.isDrillDownReportResult){
            clonedReportSection.sectionName = sectionObj.sectionName;
            clonedSectionReportMeta.single = sectionObj;
            clonedSectionReportMeta.single.isExternal = 'false';
            if(!this.reports.isExportAll && curTabIndex != null){
              clonedSectionReportMeta.single.templateDetails = this.reports.reportTabResponseList[curTabIndex].templateDetails || {};
            }else{
              clonedSectionReportMeta.single.templateDetails = this.reports.reportTabResponseList[index].templateDetails || {};
            }
            if(clonedSectionReportMeta.single.templateDetails && clonedSectionReportMeta.uiFilter){
              (clonedSectionReportMeta.single.templateDetails.title_rowList || []).forEach((tempRowObj: any) => {
                (tempRowObj.columnList || []).forEach((tempColObj: any) => {
                  if(tempColObj.isGlobalSearch){
                    tempColObj.text = clonedSectionReportMeta.uiFilter.globalSearch;
                  }else if(tempColObj.isFieldSearch){
                    tempColObj.text = clonedSectionReportMeta.uiFilter.fieldSearch;
                  }
                });
              });
            }
            let printSettingsObj: any = ((clonedReportMetaData.single.templateDetails || {}).printSettings || {});
            if(printSettingsObj.exportDateTimeFileName)
              printSettingsObj.fileName = this.updateDynamicValue(printSettingsObj, 'exportDateTimeFileName', printSettingsObj.fileName, headers);
            loadImageContent(clonedSectionReportMeta.single);
          }else{
            if(!clonedReportSection.report_metadata.single.showFilter && (clonedReportSection.report_metadata.single.customExport || 'external') == 'external'){
              clonedSectionReportMeta.single.isExternal = 'true';
            }
            else{
              clonedSectionReportMeta.single = sectionObj;
              clonedSectionReportMeta.single.isExternal = 'false';
              if(!this.reports.isExportAll && curTabIndex != null){
                clonedSectionReportMeta.single.templateDetails = this.reports.reportTabResponseList[curTabIndex].templateDetails || {};
              }else{
                clonedSectionReportMeta.single.templateDetails = this.reports.reportTabResponseList[index].templateDetails || {};
              }
              if(clonedSectionReportMeta.single.templateDetails && clonedSectionReportMeta.uiFilter){
                (clonedSectionReportMeta.single.templateDetails.title_rowList || []).forEach((tempRowObj: any) => {
                  (tempRowObj.columnList || []).forEach((tempColObj: any) => {
                    if(tempColObj.isGlobalSearch){
                      tempColObj.text = clonedSectionReportMeta.uiFilter.globalSearch;
                    }else if(tempColObj.isFieldSearch){
                      tempColObj.text = clonedSectionReportMeta.uiFilter.fieldSearch;
                    }
                  });
                });
              }
              //TODO: yet pagination to be implemented
              // filteredRecord = paginationService.getFilteredRecord(clonedReportSection.sectionId);
              // if(filteredRecord && filteredRecord[0]){
              //   clonedSectionReportMeta.single.records = filteredRecord;
              // }
            }
            let printSettingsObj: any = ((clonedReportMetaData.single.templateDetails || {}).printSettings || {});
            if(printSettingsObj.exportDateTimeFileName)
              printSettingsObj.fileName = this.updateDynamicValue(printSettingsObj, 'exportDateTimeFileName', printSettingsObj.fileName, headers);
            loadImageContent(clonedReportSection);
          }
          tabUserList = tabUserList.concat(exportUserValueList);
        });
        var sectionList: Array<any> = (clonedReportMetaData.clubbed[index] || {}).sectionList;
        if(sectionList.length > 0){
          sectionList[0].report_metadata.tabUserValueList = tabUserList;
          sectionList[0].report_metadata.exportTemplateId = tabObj.id;
        }
        if(index == 0){
          postEntity.template.parentTabId = tabObj.id;							
        }
        var userValueList: Array<any> = [];
        var userValueNameList: Array<any> = [];
        ((this.reports.reportMetaData.clubbed[index] || {}).sectionList || []).forEach((sectionObj: any, index: number) => {
          //tabObj.sectionList[index].sectionName = sectionObj.sectionName;
          ((sectionObj.report_metadata || {}).userValueList || []).forEach((userValueObj: any) => {
            if(userValueNameList.indexOf(userValueObj.givenName) == -1){
              var currentUserValueObj = requestObj.userValueList.find((obj: any) => {
                return obj.givenName == userValueObj.givenName;
              });
              if(currentUserValueObj){
                userValueList.push(currentUserValueObj);
                userValueNameList.push(userValueObj.givenName);
              }
            }
          });
        });
        postEntity.template.templateDetails[tabObj.id] = {templateId: tabObj.updatedTemplateId, matrixData: {}, exportFileName: requestObj.name, name: requestObj.name, reportCriteria: userValueList};
      });
    }
    //TODO: below lines commented because multilanguage is not yet implemented
    // (clonedReportMetaData.clubbed || []).forEach((tabObj: any) => {
    //   var secObj = (tabObj.sectionList || [])[0] || {};
    //   if(secObj.customExport == 'internal'){
    //      tabObj.tabName = scope.gettextCatalog.getString(tabObj.tabName);
    //   }
    // });
    clonedReportMetaData.report_pageId = this.reports.report_pageId;
    postEntity.reqMeta = clonedReportMetaData;
    if(document.getElementById('eportal_download_file_form')){
      document.getElementById('eportal_download_file_form').remove();
    }
    var createElement = (type: string, name: string, value: string) => {
      var domObj: any = document.createElement('INPUT');
      domObj.type = type; domObj.name = name; domObj.value = value;
      return domObj;
    }
    // (this.headersData || []).forEach(function(obj){
    //   if(obj.headKey != ''){
    //     headers[obj.headKey] = obj.headValue;       
    //   }
    // });

    if((this.apiService.generalConfiguration.reportCache || 'N') == 'Y') headers['ep-report-cache-timeout'] = this.apiService.generalConfiguration.reportCacheTimeout;
      
    var my_form: any = document.createElement('FORM');
    my_form.id = 'eportal_download_file_form';
    my_form.style.display = 'none !important';
    my_form.method = 'POST';
    my_form.setAttribute('accept-charset', 'UTF-8');
    my_form.setAttribute('target', '_blank');
    my_form.enctype = 'application/x-www-form-urlencoded';
    my_form.action = location.origin + '/filerouter/' + 'reportServlet';
    if(my_form.action.indexOf('filerouter') != -1){
      my_form.action = '../../../filerouter/reportServlet';
    }

    my_form.appendChild(createElement('hidden', 'HEADER', JSON.stringify(headers)));
    
    postEntity.reportExportId = 'EXPORT-REPORTID-' + this.strings.getRandomId();
    postEntity = this.cleanRequestData(postEntity);
    my_form.appendChild(createElement('hidden', 'REQUEST', JSON.stringify(postEntity)));

    document.body.appendChild(my_form);
    my_form.submit();

    /*sc.loaderShow();
    var exportStatusInterval = setInterval(function(){
      if(document.cookie.indexOf(postEntity.reportExportId + '=') != -1){
        clearInterval(exportStatusInterval);
        sc.loaderHide();
      }
    }, 1000);*/
  }

  reportClubInit(){
    (this.reports.reportMetaData.clubbed || []).forEach((obj: any, index: number) => {
      obj.href_prefix = this.reports.href_prefix;
      obj.isSelected = (index == 0);
    });
  }

  reportClubSwitchTab(tabObj: any, index: number, lazyLoadingDetails?: any){
    if(this.reports.activeTab.id !== this.reports.reportTabResponseList[index].id){
      (this.reports.reportMetaData.clubbed || []).forEach((obj: any) => {
        obj.isSelected = (obj.id == tabObj.id);
      });
      if(lazyLoadingDetails){
        this.reports.activeTab.sectionList[lazyLoadingDetails.clubbed.sectionIndex].records = this.reports.reportTabResponseList[index].sectionList[lazyLoadingDetails.clubbed.sectionIndex].records;
        this.reports.activeTab.sectionList[lazyLoadingDetails.clubbed.sectionIndex].totalRecordObject = this.reports.reportTabResponseList[index].sectionList[lazyLoadingDetails.clubbed.sectionIndex].totalRecordObject;
      }else{
        this.reports.activeTab = this.reports.reportTabResponseList[index];
      }
      //TODO: floating scroll implementation yet to be done
      //sc.reports.updateTabFloatingScroll();
      this.themeBuilder.init();
      this.report_template.applyTheme();
      this.updateItemsPerPage(this.reports.activeTab.sectionList);
      this.initPaginationDetails(this.reports.activeTab.sectionList);
      this.reports.previewTemplate = null;
      if(this.reports.activeTab.showTemplate && this.reports.activeTab.templateDetails){
        this.reports.previewTemplate = this.reports.activeTab.templateDetails;
      }
    }
    this.apiService.loaderHide('loader');
  }

  applyApplicationFilterDefault(){
    var matchedFilters: any[] = [];
    (this.reports.reportFilters || []).forEach((filObj: any) => {
      if(filObj.isDefault == "YES"){
        matchedFilters.push(filObj);
      }
    })
    var callCount: number = 0;
    (matchedFilters || []).forEach((matchedObj: any) => {
      matchedObj.isDefault = "NO";
      matchedObj.reportId = this.reports.reportMetaData.id;
      this.apiService.invokePlatformApi('/eportal/api/save/report/filter', 'POST', matchedObj).subscribe(
        (res: any) => {
          var _resp: any = res.body || {};
          callCount++;
          if(callCount == matchedFilters.length && _resp.status == "SUCCESS"){
            this.toastr.success('Updated Successfully');
            this.getReportFilterFrmId();
          }
          this.reports.clonedFilter = null;
        },
        (err: any) => {
          this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
          
        }
      );
    });
    this.reports.isApplicationFilterDefault = true;
  }

  clearAllFilters(){
    this.clearFilter();
    (this.reports.reportTabResponseList || []).forEach((tabObj: any) => {
      (tabObj.sectionList || []).forEach((secObj: any) => {
        if(secObj.showFilter){
          (secObj.displayFields || []).forEach((dispObj: any) => {
            delete dispObj.filterValue;
          });
        }
      });
    });
    this.reports.appliedFilterId = "applicationFilter";
    $("#manage_filter_Modal").modal("hide");
  }

  reportsFilterUpdateReportFilter(filterObj: any, isDefault?: boolean, isClone?: boolean, createNew?: boolean){
    if(isClone){
      this.reports.clonedFilter = JSON.parse(JSON.stringify(filterObj));
    }else if(!isDefault && (this.reports.filterNameList || []).indexOf(filterObj.filterName) != -1){
      //$("#manage_filter_Modal").modal("hide");
      //$("#saveAlert_Modal").modal("show");
      this.reports.updateFilterAlert = true;
      /*$.confirm({
        title: "Alert!",
        content: "Given Name Already Exists!!",
        confirm: function(){
          sc.reports.getReportFilterFrmId();
        },
        cancel: function(){
          sc.reports.getReportFilterFrmId();
        }
      });*/
    }else{
      var matchedObj: any = JSON.parse(JSON.stringify(filterObj));
      matchedObj.reportId = this.reports.reportMetaData.id;
      if(isDefault){
        matchedObj.isDefault = "YES";
        this.reports.isApplicationFilterDefault = false;
      }else{
        matchedObj.isDefault = "NO";
      }
      if(createNew){
        matchedObj.filterId = this.strings.getRandomId();
      }
      this.apiService.invokePlatformApi('/eportal/api/save/report/filter', 'POST', matchedObj).subscribe(
        (res: any) => {
          var _resp: any = res.body || {};
          if(_resp.status == "SUCCESS"){
            this.toastr.success('Updated Successfully!!!');
            this.getReportFilterFrmId();
          }
          this.reports.clonedFilter = null;
        },
        (err: any) => {
          this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
          
        }
      );
    }
  }

  reportsFilterOpenDelete(filterId: string, filterName: string){
    this.reports.deleteFilterId = filterId;
    this.reports.deleteFilterName = filterName;
    //$("#manage_filter_Modal").modal("hide");
    this.reports.deleteFilterAlert = true;
    //$("#deleteAlert_Modal").modal("show");
  }

  reportsFilterDelete(){
    this.apiService.invokePlatformApi('/eportal/api/delete/filter/' + this.reports.deleteFilterId, 'DELETE', { filterId: this.reports.deleteFilterId }).subscribe(
      (res: any) => {
        var _resp: any = res.body || {};
        if(_resp.status == "SUCCESS"){
          this.toastr.success("Deleted Successfully!!!");
          this.getReportFilterFrmId();
        }
        this.reports.deleteFilterAlert = false;
        //$("#manage_filter_Modal").modal("show");
      },
      (err: any) => {
        this.toastr.error("Failed to save");
        
      }
    );
  }

  reportFilterValidateFilterName(isUpdate?: boolean){
    if(!isUpdate && (this.reports.filterNameList || []).indexOf(this.reports.currentFilterName) != -1){
      //$("#save_filter_Modal").modal("hide");
      //$("#saveAlert_Modal").modal("show");
      this.reports.saveFilterAlert = true;
    }else{
      var reportFilter_id: string = null;
      var metadata: any = {userCriteria:[], fieldCriteria:[]};
      /*var isDefault = null;
      if(sc.reports.reportFilters && sc.reports.reportFilters.length == 0){
        isDefault = "YES";
      }else{
        isDefault = "NO";
      }*/
      var isDefault: string = "NO";
      if(isUpdate){
        var matchedObj = (this.reports.reportFilters || []).filter((filObj: any) => {
          return filObj.filterName == this.reports.currentFilterName;
        })[0];
        if(matchedObj){
          reportFilter_id = matchedObj.filterId;
        }
      }else{
        reportFilter_id = this.strings.getRandomId();
      }
      //(sc.reports.reportMetaData.userValueList || []).forEach(function(userObj){
      (this.reports.cloneUserFilterList || []).forEach((userObj: any) => {
        if(userObj.enteredValue && userObj.enteredValue != ""){
          var newObj: any = {};
          newObj.givenName = userObj.givenName;
          newObj.enteredValue = userObj.enteredValue;
          //if(userObj.epMultiSelectWidget) newObj.isSelectedAll = userObj.epMultiSelectWidget.isSelectedAll();
          metadata.userCriteria.push(newObj);
        }
      });
      //load fieldCriteria
      (this.reports.reportTabResponseList || []).forEach((tabObj: any) => {
        (tabObj.sectionList || []).forEach((secObj: any) => {
          if(secObj.showFilter){
            var isFiltered: boolean = false;
            var newObj: any = {};
            newObj.tabId = tabObj.id;
            newObj.sectionId = secObj.sectionId;
            newObj.displayFields = [];
            (secObj.displayFields || []).forEach((dispObj: any) => {
              if(dispObj.filterValue){
                var fieldCriteriaObj: any = {};
                fieldCriteriaObj.name_actual = dispObj.name_actual;
                fieldCriteriaObj.filterValue = dispObj.filterValue;
                newObj.displayFields.push(fieldCriteriaObj);
                isFiltered = true;
              }
            });
            metadata.fieldCriteria.push(newObj);
          }
        });
      });
      //load custmomized tabs filter criteria
      // if((((this.reports.customizedTab_reportMetaData || {}).customizeTabs || {}).customize)){
      //   metadata.tabListCriteria = this.reports.customizedTab_reportMetaData.customizeTabs.epMultiSelectWidget.getSelectedIdList();
      // }
      let reqObj = {
          filterId: reportFilter_id,
          filterName: this.reports.currentFilterName,
          reportId: this.reports.reportMetaData.id,
          isDefault: isDefault,
          metadata: metadata
      };
      this.apiService.invokePlatformApi('/eportal/api/save/report/filter', 'POST', reqObj).subscribe(
        (res: any) => {
          var _resp: any = res.body || {};
          if(_resp.status == "SUCCESS"){
            if(isUpdate){
              this.toastr.success("Updated Successfully!!!");
            }else{
              this.toastr.success("Saved Successfully!!!");
            }
            this.getReportFilterFrmId();
            $("#save_filter_Modal").modal("hide");
            this.reports.appliedFilterId = reportFilter_id;
          }else{
            this.toastr.error("Failed to save");
          }
        },
        (err: any) => {
          this.toastr.error("Failed to save");
          
        }
      );
    }
  }

  reportsFilterOpenManageFilter(){
    $("#manage_filter_Modal").modal("show");
    this.reports.clonedFilter = null;
    this.reports.updateFilterAlert = false;
    this.reports.deleteFilterAlert = false;
  }

  reportsFilterOpenSaveFilterModal(){
    this.reports.currentFilterName = "";
    $("#save_filter_Modal").modal("show");
    this.reports.saveFilterAlert = false;
  }

  updateDateWidgetModelValues(filterMetadata: any, userObj: any, dateWidgetType: string){
    let inputDatetimeFormat = userObj.attrDateFormat || '';
    inputDatetimeFormat = this.reports.updateInputDateTimeFormat(dateWidgetType, inputDatetimeFormat);
    let formattedMomentDateString: string = this.reports.getMomentDateFormat(inputDatetimeFormat);
    if (userObj.isRangeSelector) {
      userObj.enteredStartDateModel = moment(filterMetadata[userObj.givenName].enteredValue[0], formattedMomentDateString);
      userObj.enteredEndDateModel = moment(filterMetadata[userObj.givenName].enteredValue[1], formattedMomentDateString);
    } else {
      userObj.enteredDateModel = moment(filterMetadata[userObj.givenName].enteredValue, formattedMomentDateString);
    }
  }

  updateDynamicValue(obj: any, key: string, defaultValue: string, headers: any){
		var value: string = obj[key] || '';
		if(value == ''){
			value = defaultValue || '';
		}
		var startIndex: number = value.indexOf('<<');
		var endIndex: number = value.indexOf('>>');
		while(startIndex != -1 && endIndex != -1 && startIndex < endIndex){
			var keyword = value.substring(startIndex + 2, endIndex);
      value = value.replace('<<' + keyword + '>>', this.getReplacedValue(keyword, headers));
      startIndex = value.indexOf('<<');
      endIndex = value.indexOf('>>');
		}
		return value;
  }
  
  getReplacedValue(key: string, headers: any){
    key = key.trim();
    var currentDateTimeTempScript = "";
		var currentDateTimeScriptResp = null;
    if(key == "ExportDate"){
      return this.getCurrentUserDate(headers);
    }else if(key == "ExportDateTime"){
      return this.getCurrentUserDateTime(headers);
    }else if(key.startsWith("ExportDate('") && key.endsWith("')")){
      currentDateTimeTempScript = "function ExportDate(format, timezone) { return {format, timezone} };" + key;
      currentDateTimeScriptResp = eval(currentDateTimeTempScript);
      return this.getCurrentUserDate({"ep-dateformat": currentDateTimeScriptResp.format, "ep-timezone": currentDateTimeScriptResp.timezone || headers["ep-timezone"] || "", "accessedtimezone": headers["accessedtimezone"]});
    }else if(key.startsWith("ExportDateTime('") && key.endsWith("')")){
      currentDateTimeTempScript = "function ExportDateTime(format, timezone) { return {format, timezone} };" + key;
      currentDateTimeScriptResp = eval(currentDateTimeTempScript);
      return this.getCurrentUserDateTime({"ep-datetimeformat": currentDateTimeScriptResp.format, "ep-timezone": currentDateTimeScriptResp.timezone || headers["ep-timezone"] || "", "accessedtimezone": headers["accessedtimezone"]});
    }
		return key;
  }
  
  getCurrentUserDate(headers: any) {
    var dateObj: any = moment().clone();
    this.convertTimeZoneWithChaningTime(headers, dateObj);
    return dateObj.format(this.getFormat(headers, 'Date'));
  }

  convertTimeZoneWithChaningTime(headers: any, date: any){
    return this.convertTimeZone(headers, date, false);
  }

  convertTimeZone(headers: any, date: any, withoutChangeTime: boolean){
    switch (this.getUserTimeZone(headers)) {
      case "Pacific Standard Time":
      case "Pacific Daylight Time":
      case "Pacific Time (US & Canada)":
        date.tz("America/Tijuana", withoutChangeTime);
        break;
      case "Mountain Daylight Time":
      case "Mountain Standard Time":
      case "Mountain Time (US & Canada)":
        date.tz("America/Denver", withoutChangeTime);
        break;
      case "Central Daylight Time":
      case "Central Standard Time":
      case "Central Time (US & Canada)":
        date.tz("America/Chicago", withoutChangeTime);
        break;
      case "Eastern Daylight Time":
      case "Eastern Standard Time":
      case "Eastern Time (US & Canada)":
        date.tz("America/Iqaluit", withoutChangeTime);
        break;
      case "Atlantic Daylight Time":
      case "Atlantic Standard Time":
      case "Atlantic Time (Canada)":
        date.tz("America/Halifax", withoutChangeTime);
        break;
      case "Newfoundland Daylight Time":
      case "Newfoundland Standard Time":
      case "Newfoundland":
        date.tz("America/St_Johns", withoutChangeTime);
        break;
      default:
        date.utcOffset(this.getUserTimeOffset(headers), withoutChangeTime);
      break;
    }
    return date;
  }

  getUserTimeZone(headers: any) {
    headers = headers || {};
    var timezone = headers["ep-timezone"] || headers["accessedtimezone"] || (new Date() + "");
    timezone = timezone.substring(timezone.indexOf("GMT"));
    return timezone.substring(timezone.indexOf("(")+1, timezone.length-1);
  }

  getUserTimeOffset(headers: any) {
    headers = headers || {};
    var timezone: string = headers["ep-timezone"] || headers["accessedtimezone"] || (new Date() + "");
    timezone = timezone.substring(timezone.indexOf("GMT"));
    timezone = timezone.substring(3, timezone.indexOf(" ("));
    return timezone.substring(0, 3) + ":" + timezone.substring(3); 
  }

  getFormat(headers: any, type: string) {
    headers = headers || {};
    var format: string = this.getFormatFromHeaders(headers, type);
    return this.reports.getMomentDateFormat(format);
  }

  getFormatFromHeaders(headers: any, type: string) {
    var format: string = "";
    if(type == 'Date'){
      format = headers["ep-dateformat"] || "";
      if(format == ""){
        format = "yyyy/MM/dd" //Default EPortal Date Format
      }
    }else if(type == 'DateTime'){
      format = headers["ep-datetimeformat"] || "";
      if(format == ""){
        format = "yyyy/MM/dd HH:mm:ss" //Default EPortal DateTime Format
      }
    }
    return format;
  }

  getCurrentUserDateTime(headers: any) {
    var dateObj = moment().clone();
    this.convertTimeZoneWithChaningTime(headers, dateObj);
    return dateObj.format(this.getFormat(headers, 'DateTime'));
  }

}