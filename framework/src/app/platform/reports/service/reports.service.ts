import { Injectable } from '@angular/core';
import { StringUtilService } from './stringUtil.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import moment from 'moment';
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  disableSaveFilter: boolean = false;
  disableExport: boolean = false;
  templateDetails: object = {};
  href_prefix: string = '';
  showTableControls: boolean = false;;
  hideUserValueList: boolean = false;
	showUserValueListContainer: boolean = true;
  reportId: string = null;
  searchTable: string =  '';
	sortKey: string = '';
	columnFiterObj: any = {};
	reverse: boolean =  false;
	isPageBuilder: boolean = true;
	frameId: string = null;
  reportName: string = '';
  itemsPerPage: string = '';
  records:Array<any> = [];
  reportMetaData: any = {};
  customizedTab_reportMetaData: any;
  showReportTableContainer: boolean = true;
  dateFormat: any = {'moment':{'EEE':'ddd','EEEE':'dddd','d':'D','dd':'DD','M':'M','MM':'MM','MMM':'MMM','MMMM':'MMMM','yy':'YY','yyyy':'YYYY','h':'h','hh':'hh','H':'H','HH':'HH','a':'A','mm':'mm','ss':'ss','S':'ms'}};
  chartInfo:any = [{"name":"Float Bar","widget":{"type":"chart","chartInfo":{"category":"2-Dimension","chart":{"type":"column","icon":"<i class='fa fa-bar-chart fa-3x'></i>"}}},"columnList":["","CALCULATED_DATA"],"displayFieldList":["title","xAxisName","yAxisName"],"returnObjects":["X Axis","Y Axis","Series"]},{"name":"Horizontal Bar","widget":{"type":"chart","chartInfo":{"category":"2-Dimension","chart":{"type":"bar","icon":"<i class='material-icons'>sort</i>"}}},"columnList":["","CALCULATED_DATA"],"displayFieldList":["title","xAxisName","yAxisName"],"returnObjects":["X Axis","Y Axis","Series"]},{"name":"Line","widget":{"type":"chart","chartInfo":{"category":"2-Dimension","chart":{"type":"line","icon":"<i class='fa fa-line-chart fa-3x'>"}}},"columnList":["","CALCULATED_DATA"],"displayFieldList":["title","xAxisName","yAxisName"],"returnObjects":["X Axis","Y Axis","Series"]},{"name":"area","widget":{"type":"chart","chartInfo":{"category":"2-Dimension","chart":{"type":"area","icon":"<i class='fa fa-area-chart fa-3x'></i>"}}},"columnList":["","CALCULATED_DATA"],"displayFieldList":["title","xAxisName","yAxisName"],"returnObjects":["X Axis","Y Axis","Series"]}];
  numberFilterCriteriaList: any = [{"label" : "All", "value" : "all"}, {"label" : "Equal", "value" : "equal"}, {"label" : "Not Equal", "value" : "notEqual"}, {"label" : "Greater Than", "value" : "greaterThan"}, {"label" : "Greater Than Or Equal To", "value" : "greaterThanOrEqual"}, {"label" : "Less Than", "value" : "lesserThan"}, {"label" : "Less Than Or Equal To", "value" : "lessThanOrEqual"}, {"label" : "Between", "value" : "between"}];
  isLocationFilter: boolean;
  cloneUserList: Array<any> = [];
  isUserListLoaded:boolean = false;
  objectMetaData:any = {objectData:{},enumData:{}};
  isFiltersLoaded: boolean;
  reportFilters: Array<any> = [];
  isApplicationFilterDefault: boolean;
  appliedFilterId: string;
  filterMetadata: any;
  alertMessage: string;
  cloneUserFilterList: Array<any>;
  charts: Array<any>;
  actualReportResponse: any = {};
  reportTabResponseList: Array<any> = [];
  prevReportTabResponseList: Array<any>;
  report_pageId: string = this.strings.getRandomId().substr(0,8);
  isReportSubmitTriggered: boolean = false;
  previewTemplate: any = {};
  activeTab: any = {};
  filterNameList: any;
  isSingleAvailable: boolean;
  exportType: string;
  renderChartData: Array<any> = [];
	resultDetails: any = {};
  isExportAll: boolean = true;
  clonedFilter: any = null;
  reportClubView: boolean = false;
  imgData: any;
  isValidUpdatedTmpltIdSelected: boolean;
  sortedDisplayFieldObject: object;
  filter_IsDelete: boolean;
  deleteFilterAlert: boolean;
  updateFilterAlert: boolean;
  saveFilterAlert: boolean;
  deleteFilterId: string;
  deleteFilterName: string;
  currentFilterName: string;
  epMultiSelectWidgetDefaultConfigObject: any = {
    allowDeselectionMode: false,
    hideTotalCount: true,
    maxSelectDeSelectCount: 10000,
    maxSelectSizeInKB: 1024,
  };


  constructor( private strings: StringUtilService, private _sanitizer: DomSanitizer ) { }

  commonValidation: any = {
    isEmpty: (obj: any) => {
      return Object.keys(obj || {}).length == 0;
    },
    isNullOrEmpty: (data: any) => {
      data = data || '';
      return data == '';
    }
  };

  editProperties: any = {
    updateLinkName : (record: any, field: any) => {
      var linkName: string = null;
      if(!field.isLinkCondition){
        linkName = field.hyperlink || null;				
        do{
          var startIndex: number = linkName.indexOf('{{');
          var endIndex: number = linkName.indexOf('}}');
          if(startIndex != -1){
            var givenName: string = linkName.substring(startIndex + 2, endIndex);
            if(record[givenName]){
              linkName = linkName.replace(linkName.substring(startIndex, endIndex+2), record[givenName]);
            }else{
              linkName = linkName.replace(linkName.substring(startIndex, endIndex+2), '');
            }
          }
        }while(linkName.indexOf('{{')!=-1 && linkName.indexOf('}}')!=-1);
      }else if(field.linkScript){
        var linkScript = field.linkScript;
        if(linkScript.selectedStep && linkScript.selectedStep.script){
          try{
            linkName = eval('(function execute(value, rowObject){' + linkScript.selectedStep.script + '})')(record[field.mapping], record);
          }catch(e){
            
            linkName = null;
          }
        }
        field.hyperlink = linkName;
      }
      if(linkName != null && !linkName.startsWith('http:') && !linkName.startsWith('https:')){
        if(!linkName.startsWith('/')){
          linkName = '/' + linkName;
        }
        linkName = this.href_prefix + linkName;
      }
      return linkName;
    }
  }

  getCellStyle(cell: any){
    var styleList: Array<any> = [];
    var reportTitle: any = this.previewTemplate.reportTitle || {}; 
    var border: any = reportTitle.border || {};
    var styles: any = this.previewTemplate.styles || {};
    
    var background: string = reportTitle.background || '';
    var color: string = reportTitle.color || '';
    var align: string = reportTitle.align || '';
    var verticalAlign: string = reportTitle.verticalAlign || '';

    var borderType: string = border.type || '';
    var borderColor: string = border.color || '';
    var borderThickness: string = border.thickness || '';

    var fontSize: string = styles.fontSize || '';
    var fontFamily: string = styles.fontFamily || '';
    var fontWeight: string = styles.fontWeight || '';

    if(cell.needCustomTheme){
      var cellTheme = cell.theme || {};
      background = (cellTheme.background || '') != '' ? cellTheme.background : background;
      color = (cellTheme.color || '') != '' ? cellTheme.color : color;
      align = (cellTheme.align || '') != '' ? cellTheme.align : align;
      verticalAlign = (cellTheme.verticalAlign || '') != '' ? cellTheme.verticalAlign : verticalAlign;
      fontSize = (cellTheme.fontSize || '') != '' ? cellTheme.fontSize : fontSize;
      fontFamily = (cellTheme.fontFamily || '') != '' ? cellTheme.fontFamily : fontFamily;
      fontWeight = (cellTheme.fontWeight || '') != '' ? cellTheme.fontWeight : fontWeight;
    }
    if(background != '') styleList.push('background: ' + background);
    if(color != '') styleList.push('color: ' + color);
    if(align != '') styleList.push('text-align: ' + align);
    if(verticalAlign != '') styleList.push('vertical-align: ' + verticalAlign);
    
    if(borderType == 'All'){
      styleList.push('border: ' + borderThickness + 'px');
      styleList.push('border-style: solid');
      styleList.push('border-color: ' + borderColor);
    }else if(borderType == 'Vertical'){
      styleList.push('border: ' + borderThickness + 'px');
      styleList.push('border-style: solid');
      styleList.push('border-color: ' + borderColor);
      styleList.push('border-top: 0px');
      styleList.push('border-bottom: 0px');
    }else if(borderType == 'Horizontal'){
      styleList.push('border: ' + borderThickness + 'px');
      styleList.push('border-style: solid');
      styleList.push('border-color: ' + borderColor);
      styleList.push('border-left: 0px');
      styleList.push('border-right: 0px');
    }else if(borderType == 'None'){
      styleList.push('border: 0px');
    }

    if(fontSize != ''){
      styleList.push('font-size: ' + fontSize + 'pt');
    }
    if(fontFamily != ''){
      styleList.push('font-family: ' + fontFamily);
    }
    if(fontWeight != ''){
      styleList.push('font-weight: ' + fontWeight);
    }
    return this._sanitizer.bypassSecurityTrustStyle(styleList.join('; '));
  }

  getGridTitleHeaderCellStyle(cell: any){
    var gridTitleHeader: any = this.activeTab.sectionList[0].gridTitleHeader || {};
    var styleList: Array<any> = [];
    var reportTitle: any = gridTitleHeader.titleTheme || {};
    var border: any = reportTitle.border || {};
    var styles: any = gridTitleHeader.styles || {};
    
    var background: string = reportTitle.background || '';
    var color: string = reportTitle.color || '';
    var align: string = reportTitle.align || '';
    var verticalAlign: string = reportTitle.verticalAlign || '';

    var borderType: string = border.type || '';
    var borderColor: string = border.color || '';
    var borderThickness: string = border.thickness || '';

    var fontSize: string = styles.fontSize || '';
    var fontFamily: string = styles.fontFamily || '';
    var fontWeight: string = styles.fontWeight || '';

    if(cell.needCustomTheme){
      var cellTheme: any = cell.theme || {};
      background = (cellTheme.background || '') != '' ? cellTheme.background : background;
      color = (cellTheme.color || '') != '' ? cellTheme.color : color;
      align = (cellTheme.align || '') != '' ? cellTheme.align : align;
      verticalAlign = (cellTheme.verticalAlign || '') != '' ? cellTheme.verticalAlign : verticalAlign;
      fontSize = (cellTheme.fontSize || '') != '' ? cellTheme.fontSize : fontSize;
      fontFamily = (cellTheme.fontFamily || '') != '' ? cellTheme.fontFamily : fontFamily;
      fontWeight = (cellTheme.fontWeight || '') != '' ? cellTheme.fontWeight : fontWeight;
      var customBorder = cellTheme.border || {};
      borderType = (customBorder.type || '') != '' ? customBorder.type : borderType;
      borderColor = (customBorder.color || '') != '' ? customBorder.color : borderColor;
      borderThickness = (customBorder.thickness || '') != '' ? customBorder.thickness : borderThickness;
    }
    if(background != '') styleList.push('background: ' + background +' !important;');
    if(color != '') styleList.push('color: ' + color +' !important;');
    if(align != '') styleList.push('text-align: ' + align +' !important;');
    if(verticalAlign != '') styleList.push('vertical-align: ' + verticalAlign +' !important;');
    
    if(borderType == 'All'){
      styleList.push('border: ' + borderThickness + 'px !important');
      styleList.push('border-style: solid !important');
      styleList.push('border-color: ' + borderColor +' !important;');
    }else if(borderType == 'Vertical'){
      styleList.push('border: ' + borderThickness + 'px !important');
      styleList.push('border-style: solid !important');
      styleList.push('border-color: ' + borderColor + ' !important');
      styleList.push('border-top: 0px !important');
      styleList.push('border-bottom: 0px !important');
    }else if(borderType == 'Horizontal'){
      styleList.push('border: ' + borderThickness + 'px !important');
      styleList.push('border-style: solid !important');
      styleList.push('border-color: ' + borderColor + ' !important');
      styleList.push('border-left: 0px !important');
      styleList.push('border-right: 0px !important');
    }else if(borderType == 'None'){
      styleList.push('border: 0px !important');
    }

    if(fontSize != ''){
      styleList.push('font-size: ' + fontSize + 'pt !important');
    }
    if(fontFamily != ''){
      styleList.push('font-family: ' + fontFamily + ' !important');
    }
    if(fontWeight != ''){
      styleList.push('font-weight: ' + fontWeight + ' !important');
    }
    return this._sanitizer.bypassSecurityTrustStyle(styleList.join('; '));
  }

  calculateWidth(displayFields: any){
		var width = 0;
		displayFields.forEach((field: any) => {
			field.hideColumn = typeof(field.hideColumn) === 'string' ?  JSON.parse(field.hideColumn) : field.hideColumn;
			if(!field.hideColumn){
				width = width + parseInt(field.width);
			}
		});
		return width;
  }
  
  getUpdatedFieldVal(secObj: any, recordObj: any, field: any){
    var needConversionList = ['Date', 'DateTime', 'CustomDate', 'CustomDateTime'];
    var fieldVal = recordObj[field.mapping];
    var add_info = field.add_info || '';;
    var disp_add_info = field.disp_add_info;
    var resp_dataType = field.dataType;
    var disp_dataType = field.disp_dataType;
    if(needConversionList.indexOf(resp_dataType) != -1 && needConversionList.indexOf(disp_dataType) != -1){
      fieldVal = convertUserDateToUTCDate();
    }else if(resp_dataType == 'Number' && add_info != ''){
      if(!isNaN(fieldVal)){
        fieldVal = Number(fieldVal).toFixed(add_info);
      }else if(fieldVal && fieldVal.contains('%')){
        var newVal: any = fieldVal.replaceAll('%','') + '';
        if(!isNaN(newVal)){
          newVal = Number(newVal).toFixed(add_info);
        }
        fieldVal = newVal+'%';
      } 
    }
    return fieldVal;
    
    function convertUserDateToUTCDate(){
      var dateObj = moment(fieldVal, this.getMomentDateFormat(add_info));
      if(dateObj.isValid()){
        return dateObj.format(this.getMomentDateFormat(disp_add_info));
      }else{
        return '';
      }
    }
  }

  getMomentDateFormat(format: string){
    return this.updateFormat(this.dateFormat.moment, format, '%')
  }

  updateFormat(dateFormatObj: any, format: string, additionKey: string){
    additionKey = additionKey || '';
    Object.keys(dateFormatObj).sort().reverse().forEach((key: string) => {
      var temp_format = format.replace(key, additionKey + dateFormatObj[key]);
      if(temp_format.indexOf('%%') == -1){
        format = temp_format;
      }
    });
    if(additionKey != ''){
      var reg = new RegExp(additionKey, 'g');
      format = format.replace(reg, '');			
    }
    if(format.indexOf('XXXXX') != -1){
      format = format.replace('XXXXX', 'SS');
    }
    return format;
  }

  getDateFormat(fieldObj: any, display: boolean){
    var fieldDisplayType: string = "";
    var format: string = "";
    if(display){
      fieldObj.disp_dataType = fieldObj.disp_dataType || "DATETIME";
      fieldDisplayType = fieldObj.disp_dataType.toUpperCase();
      format = fieldObj.disp_add_info || "";
    }else{
      fieldObj.dataType = fieldObj.dataType || "DATETIME";
      fieldDisplayType = fieldObj.dataType.toUpperCase();
      format = fieldObj.add_info || "";
    }
    var fieldObjType = "";
    if(fieldDisplayType == "DATE" || fieldDisplayType == "CUSTOMDATE"){
      fieldObjType = "date";
    }else if(fieldDisplayType == "DATETIME" || fieldDisplayType == "CUSTOMDATETIME"){
      fieldObjType = "datetime";
    }
    var defaultFormat = "";
    if(fieldObjType == "date"){
      if(fieldDisplayType == "CUSTOMDATE"){
        defaultFormat = format;
      }
      if(defaultFormat == ""){
        defaultFormat = JSON.parse(sessionStorage.generalConfiguration || '{}')[sessionStorage.getItem('ep-accountname')].defaultDateFormat;
      }
      if(defaultFormat == ""){
        defaultFormat = "yyyy/MM/dd";
      }
    }
    else if(fieldObjType == "datetime"){
      if(fieldDisplayType == "CUSTOMDATETIME"){
        defaultFormat = format;
      }
      if(defaultFormat == ""){
        defaultFormat = JSON.parse(sessionStorage.generalConfiguration || '{}')[sessionStorage.getItem('ep-accountname')].defaultDateTimeFormat;
      }
      if(defaultFormat == ""){
        defaultFormat = "yyyy/MM/dd HH:mm:ss";
      }
    }
    if(defaultFormat != ""){
      defaultFormat = this.getMomentDateFormat(defaultFormat);
    }
    return defaultFormat;
  }

  getGeneralConfigDateTimeWidgetFormat(format: string){
    if (format == "") {
      try {
        format = ((JSON.parse(sessionStorage.generalConfiguration || '{}')[sessionStorage.getItem('ep-accountname')] || {}).defaultDateTimeFormat || '');
        if (format == "") {
          format = "yyyy/MM/dd HH:mm:ss";
        }
      } catch (e) {
        
        format = "yyyy/MM/dd HH:mm:ss";
      }
    }
    return format;
  }

  getGeneralConfigDateWidgetFormat(format: string) {
    if (format == "") {
      try {
        format = ((JSON.parse(sessionStorage.generalConfiguration || '{}')[sessionStorage.getItem('ep-accountname')] || {}).defaultDateFormat || '');
        if (format == "") {
          format = "yyyy/MM/dd";
        }
      } catch (e) {
        
        format = "yyyy/MM/dd";
      }
    }
    return format;
  }

  updateUserEnteredDateFieldOptions(currentValueObj: any, options: any){
    var dateConditionObj: any = {};
    try{
      let returnValue = eval('(function execute(key){' + currentValueObj.dateRangeScript.selectedStep.script + '})')(currentValueObj.givenName);
      dateConditionObj = returnValue;
    }catch(e){
      
      dateConditionObj = {};
    }	
    if(dateConditionObj.startDate){
      var startDateModel: Date = new Date(dateConditionObj.startDate); 
      options.minDate = {year: startDateModel.getFullYear(), month: startDateModel.getMonth(), day: startDateModel.getDay()};
    }
    if(dateConditionObj.endDate){
      var endDateModel: Date = new Date(dateConditionObj.endDate);
      options.maxDate = {year: endDateModel.getFullYear(), month: endDateModel.getMonth(), day: endDateModel.getDay()};
    }
    if(dateConditionObj.defaultValue || dateConditionObj.defaultDate){
      options.defaultDate = new Date(dateConditionObj.defaultValue || dateConditionObj.defaultDate);
    }
    if(dateConditionObj.isReadOnly){
      currentValueObj.isReadOnly = dateConditionObj.isReadOnly;
    }
  }

  updateInputDateTimeFormat(dateWidgetType: string, inputDatetimeFormat: string){
    let return_inputDatetimeFormat: string;
    if(dateWidgetType == 'DATETIME'){
      return_inputDatetimeFormat = this.getGeneralConfigDateTimeWidgetFormat(inputDatetimeFormat);
    }else if(dateWidgetType == 'DATE'){
      return_inputDatetimeFormat = this.getGeneralConfigDateWidgetFormat(inputDatetimeFormat);
    }
    return return_inputDatetimeFormat;
  }

  validateCustomizeTabResponse(res: any){
    var validateStatus: boolean = true;
    var customizeTabObject: any = res.customizeTabs;
    if(customizeTabObject.isAttrLoaded){
      var selectedTabIds: any[] = customizeTabObject.getSelectedIdList();
      var errorMessage: string = "";
      if(selectedTabIds.length  == 0){
        errorMessage = "Mandatory tabs cannot be removed.";
        validateStatus = false;
      }else{
        var isMandatoryTabDeselected: any = (customizeTabObject.mandatoryTabList || []).find((tabId: any) => {
          return selectedTabIds.indexOf(tabId) == -1;
        });
        if(isMandatoryTabDeselected){
          errorMessage = "Mandatory tabs cannot be removed."
          validateStatus = false;
        }else if((customizeTabObject.minTab || "") != "" && selectedTabIds.length < customizeTabObject.minTab){
          errorMessage = "Minimum Tabs required : " + customizeTabObject.minTab + ".";
          validateStatus = false;
        }else if((customizeTabObject.maxTab || "") != "" && selectedTabIds.length > customizeTabObject.maxTab){
          errorMessage = "Maximum Tabs allowed : " + customizeTabObject.maxTab + ".";
          validateStatus = false;
        }
      }
      if(!validateStatus){
        this.showErrorAlertModal(errorMessage);
        if(customizeTabObject.prevCustomizeTabValues) {
          setTimeout(() => {
            customizeTabObject.attrList = customizeTabObject.prevCustomizeTabValues.attrList;
            customizeTabObject.attrIdList = customizeTabObject.prevCustomizeTabValues.attrIdList;
            customizeTabObject.enteredValue = customizeTabObject.prevCustomizeTabValues.selectedOptionList;   
          }, 100);
        }
      }
    }
    return validateStatus;
  }

  showErrorAlertModal(errorMessage: string){
		this.alertMessage = errorMessage;
		$('#errorAlert_Modal').modal('show');
  }
  
  updateUserGroup(index: number, groupName: string){
    (this.cloneUserList || []).forEach((cloneUserObj: any) => {
      if(cloneUserObj.givenName == groupName){
        let currentObj: any = this.reportMetaData.userValueList[index];
        currentObj.selectedGroupName = groupName;
        Object.keys(cloneUserObj).forEach((key: any) => {
          currentObj[key] = cloneUserObj[key];
        });
        if(currentObj.isRangeSelector || currentObj.operation=='BETWEEN' || currentObj.widget == 'Number Picker'){
          delete currentObj.enteredStartDateModel;
          delete currentObj.enteredEndDateModel;
          currentObj.enteredValue = ['',''];
        }else{
          delete currentObj.enteredDateModel;
          delete currentObj.enteredValue;
        }
      }
    });
  }

}
