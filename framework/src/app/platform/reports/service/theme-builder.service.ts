import { Injectable } from '@angular/core';
import { ReportsService } from './reports.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeBuilderService {
  rowThemeName: string;
  
  constructor( private reports: ReportsService ) { }

  init(){
    this.rowThemeName = null;
    this.applyTheme();
  }

  applyTheme(){
    var css = [];
    if(this.reports.activeTab){
      this.reports.activeTab.sectionList.forEach((secObj: any) => {
        css = this.executeTheme(css,secObj);
        if(this.reports.reportMetaData.reportViews === 'Clubbed'){
          css = this.tabColorExecuteTheme(css);
        }
      });
    }
    var reportThemeObj: any = document.getElementById('style_report_custom_theme');
    if(!reportThemeObj){
      reportThemeObj = document.createElement('style');
      reportThemeObj.type = 'text/css';
      reportThemeObj.id = 'style_report_custom_theme';
      document.head.append(reportThemeObj);
    }
    reportThemeObj.innerHTML = css.join('\n');
  }

  executeTheme(css: Array<any>, secObj: any){
    var sectionId = secObj.sectionId;
    css.push(this.getHeaderTheme(secObj.theme,sectionId));
    css.push(this.getCustomHeaderTheme(secObj.theme, sectionId));
    css.push(this.getBorderTheme(secObj.theme,sectionId));
    css.push(this.getCellTheme(secObj.theme,sectionId));
    css.push(this.getRowTheme(secObj.theme,sectionId));
    css.push(this.getSectionTheme(secObj.theme,sectionId));
    css.push(this.getSectionHeaderTheme(secObj.sectionHeaderTheme, sectionId));
    return css;
  }

  getHeaderTheme(currentSectionTheme: any, sectionId: string){
    var css: Array<any> = [];
    sectionId = '#' +sectionId+ ' ';
    var headerStyleObj = currentSectionTheme.header || {};
    var sc: any = this.reports;
    
    var checkStat = !sc.commonValidation.isNullOrEmpty(headerStyleObj.background) || 
            !sc.commonValidation.isNullOrEmpty(headerStyleObj.color) ||
            !sc.commonValidation.isNullOrEmpty(headerStyleObj.align) || 
            !sc.commonValidation.isNullOrEmpty(headerStyleObj.verticalAlign);
    
    if(checkStat){
      css.push(sectionId+'.ep-report > table.matrix-table-header > thead > tr.colHeaders >th.report-grid-cells {');
      if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.background)){
        css.push('\tbackground:' + headerStyleObj.background +' !important;');
      }
      if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.color)){
        css.push('\tcolor:' + headerStyleObj.color +' !important;');
      }
      if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.align)){
        css.push('\ttext-align:' + headerStyleObj.align +' !important;');
      }
      if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.verticalAlign)){
        css.push('\tvertical-align:' + headerStyleObj.verticalAlign +' !important;');
      }
      if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.fontFamily)){
        css.push('\tfont-family:' + headerStyleObj.fontFamily +' !important;');
      }
      if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.fontSize)){
        css.push('\tfont-size:' + headerStyleObj.fontSize +'pt !important;');
      }
      if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.fontWeight)){
        css.push('\tfont-weight:' + headerStyleObj.fontWeight +' !important;');
      }else{
        css.push('\tfont-weight: normal !important;');
      }
      css.push('}');
    }
    return css.join('\n');
  }

  getCustomHeaderTheme(currentSectionTheme: any, sectionId: string){
    var css: Array<any> = [];
    sectionId = '#' + sectionId + ' ';
    var customHeaderStyleObj: Array<any> = currentSectionTheme.header_custom || [];
    var sc: any = this.reports;
    customHeaderStyleObj.forEach((headerStyleObj: any, headerIndex: number) => {
      var checkStat = !sc.commonValidation.isNullOrEmpty(headerStyleObj.background) || 
              !sc.commonValidation.isNullOrEmpty(headerStyleObj.color) ||
              !sc.commonValidation.isNullOrEmpty(headerStyleObj.align) || 
              !sc.commonValidation.isNullOrEmpty(headerStyleObj.verticalAlign);
      if(checkStat){
        css.push(sectionId+'.ep-report table.matrix-table-header > thead > tr.repeatMatrixHeader:nth-child('+(headerIndex+1)+') th.report-grid-cells {');
        if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.background)){
          css.push('\tbackground:' + headerStyleObj.background +' !important;');
        }
        if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.color)){
          css.push('\tcolor:' + headerStyleObj.color +' !important;');
        }
        if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.align)){
          css.push('\ttext-align:' + headerStyleObj.align +' !important;');
        }
        if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.verticalAlign)){
          css.push('\tvertical-align:' + headerStyleObj.verticalAlign +' !important;');
        }
        if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.fontFamily)){
          css.push('\tfont-family:' + headerStyleObj.fontFamily +' !important;');
        }
        if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.fontSize)){
          css.push('\tfont-size:' + headerStyleObj.fontSize +'pt !important;');
        }
        if(!sc.commonValidation.isNullOrEmpty(headerStyleObj.fontWeight)){
          css.push('\tfont-weight:' + headerStyleObj.fontWeight +' !important;');
        }else{
          css.push('\tfont-weight: normal !important;');
        }
        css.push('}');
      }
    });
    return css.join('\n');
  }

  getBorderTheme(currentSectionTheme: any, sectionId: string){
    var css: Array<any> = [];
    sectionId = '#' + sectionId + ' ';
    var borderStyleObj: any = currentSectionTheme.border || {};
    var borderThickness: any = parseFloat(borderStyleObj.thickness);
    borderThickness = isNaN(borderThickness) ? '1px' : (borderThickness + 'px');
    var borderColor: string = borderStyleObj.color || '';
    
    if(borderStyleObj.type == 'All' || borderStyleObj.type == 'Vertical'){
      css.push(sectionId+'.ep-report table th.report-grid-cells,');
      css.push(sectionId+'.ep-report table td.report-grid-cells {');
      css.push('\tborder-left: ' + borderThickness + ' solid ' + borderColor + ' !important;');
      css.push('}');
    }
    if(borderStyleObj.type == 'All' || borderStyleObj.type == 'Horizontal'){
      css.push(sectionId+'.ep-report table th.report-grid-cells,');
      css.push(sectionId+'.ep-report table tr:not(:first-child) > td.report-grid-cells {');
      css.push('\tborder-top: ' + borderThickness + ' solid ' + borderColor + ' !important;');
      css.push('}');
    }
    if(borderStyleObj.type == 'All' || borderStyleObj.type == 'Horizontal'){
      css.push(sectionId+'.ep-report table>thead>tr>th.report-grid-cells {');
      css.push('\tborder-bottom:' + borderThickness + ' solid ' + borderColor + ' !important;');
      css.push('}');
    }
    if(borderStyleObj.type == 'All' || borderStyleObj.type == 'Vertical'){
      css.push(sectionId+'.ep-report table th.report-grid-cells:last-child,');
      css.push(sectionId+'.ep-report table td.report-grid-cells:last-child {');
      css.push('\tborder-right:' + borderThickness + ' solid ' + borderColor + ' !important;');
      css.push('}');
    }
    if(borderStyleObj.type == 'All' || borderStyleObj.type == 'Horizontal'){
      css.push(sectionId+'.ep-report table tr:last-child > th.report-grid-cells,');
      css.push(sectionId+'.ep-report table tr:last-child > td.report-grid-cells {');
      css.push('\tborder-bottom:' + borderThickness + ' solid ' + borderColor + ' !important;');
      css.push('}');
    }
    return css.join('\n');
  }

  getRowTheme(currentSectionTheme: any, sectionId: string){
    var css: any = [];
    sectionId = '#' + sectionId + ' ';
    var rowObj: any = currentSectionTheme.row || {};
    var oddRowObj: any = rowObj.odd || {};
    var evenRowObj: any = rowObj.even || {};
    var sc = this.reports;

    css.push(sectionId + '.ep-report table > tbody > tr > td.report-grid-cells {');
    if(!sc.commonValidation.isNullOrEmpty(rowObj.align)){
      css.push('\ttext-align:' + rowObj.align +';');
      css.push('\tword-break:' + 'break-word;');
    }
    if(!sc.commonValidation.isNullOrEmpty(rowObj.verticalAlign)){
      css.push('\tvertical-align:' + rowObj.verticalAlign +';');
    }
    if(!sc.commonValidation.isNullOrEmpty(rowObj.fontFamily)){
      css.push('\tfont-family:' + rowObj.fontFamily +';');
    }
    if(!sc.commonValidation.isNullOrEmpty(rowObj.fontSize)){
      css.push('\tfont-size:' + rowObj.fontSize +'pt !important;');
    }
    css.push('}');
    if(!sc.commonValidation.isNullOrEmpty(oddRowObj.background) || !sc.commonValidation.isNullOrEmpty(oddRowObj.color)){
      css.push(sectionId+'.ep-report table > tbody > tr:nth-child(odd) > td.report-grid-cells {');
      if(!sc.commonValidation.isNullOrEmpty(oddRowObj.background)){
        css.push('\tbackground:' + oddRowObj.background +';');
      }
      if(!sc.commonValidation.isNullOrEmpty(oddRowObj.color)){
        css.push('\tcolor:' + oddRowObj.color +';');
      }
      css.push('}');
    }
    if(!sc.commonValidation.isNullOrEmpty(evenRowObj.background) || !sc.commonValidation.isNullOrEmpty(evenRowObj.color)){
      css.push(sectionId+'.ep-report table > tbody > tr:nth-child(even) > td.report-grid-cells {');
      if(!sc.commonValidation.isNullOrEmpty(evenRowObj.background)){
        css.push('\tbackground:' + evenRowObj.background +';');
      }
      if(!sc.commonValidation.isNullOrEmpty(evenRowObj.color)){
        css.push('\tcolor:' + evenRowObj.color +';');
      }
      css.push('}');
    }
    return css.join('\n');
  }

  getCellTheme(currentSectionTheme: any, sectionId: string){
    var css: Array<any> = [];
    var secId: string = sectionId;
    sectionId = '#' + sectionId +' ';
    var condition_ref: any = {};
    var theme: any = {};
    var sc: any = this.reports;

    (currentSectionTheme.condition || []).forEach((condObj: any, index: number) => {
      var themeName: string = secId + '_ep-cond-theme_' + (index + 1);
      condition_ref[condObj.field] = condition_ref[condObj.field] || [];
      condition_ref[condObj.field].push({
        condition: condObj.condition,
        value: condObj.value,
        endValue: condObj.endValue || '',
        applyTheme: condObj.applyTheme,
        themeName: themeName,
        compareScript: condObj.compareScript,
        isCompareCondition: condObj.isCompareCondition
      });
      theme[themeName] = {background: condObj.background, color: condObj.color, fontFamily: condObj.fontFamily, fontSize: condObj.fontSize, fontWeight: condObj.fontWeight, align: condObj.align, verticalAlign: condObj.verticalAlign};
      
      if(condObj.field == 'HEADER'){
        css.push(sectionId + '.ep-report table > thead > tr.colHeaders.cellCustom > th.report-grid-cells.' + themeName + ' {');
      }else{
        css.push('.ep-report table td.report-grid-cells.' + themeName + ' {');
      }
      if(!sc.commonValidation.isNullOrEmpty(condObj.background)){
        css.push('\tbackground:' + condObj.background +' !important;');
      }
      if(!sc.commonValidation.isNullOrEmpty(condObj.color)){
        css.push('\tcolor:' + condObj.color +' !important;');
      }
      if(!sc.commonValidation.isNullOrEmpty(condObj.align)){
        css.push('\ttext-align:' + condObj.align +' !important;');
      }
      if(!sc.commonValidation.isNullOrEmpty(condObj.verticalAlign)){
        css.push('\tvertical-align:' + condObj.verticalAlign +' !important;');
      }
      if(!sc.commonValidation.isNullOrEmpty(condObj.fontFamily)){
        css.push('\tfont-family:' + condObj.fontFamily +' !important;');
      }
      if(!sc.commonValidation.isNullOrEmpty(condObj.fontSize)){
        css.push('\tfont-size:' + condObj.fontSize +'pt !important;');
      }
      if(!sc.commonValidation.isNullOrEmpty(condObj.fontWeight)){
        css.push('\tfont-weight:' + condObj.fontWeight +' !important;');
      }else{
        css.push('\tfont-weight: normal !important;');
      }
      css.push('}');
      
    });
    currentSectionTheme.body = theme;
    currentSectionTheme.condition_ref = condition_ref;
    return css.join('\n');
  }

  getSectionTheme(currentSectionTheme: any,sectionId: string){
    var css: Array<any> = [];
    var customSectionTheme: any = currentSectionTheme.customSectionTheme || {};
    var sectionTheme: any = this.reports.reportMetaData.sectionTheme || {};
    this.updateSectionTheme(css, sectionTheme, undefined, false);
    this.updateSectionTheme(css, customSectionTheme, sectionId, false);
    return css.join('\n');
  }

  getSectionHeaderTheme(currentSectionTheme: any,sectionId: string){
    var css: Array<any> = [];
    var sectionTheme: any = currentSectionTheme || {};
    this.updateSectionTheme(css, sectionTheme, sectionId, true);
    return css.join('\n');
  }

  updateSectionTheme(css: Array<any>, sectionTheme: any, sectionId: string, sectionHeaderTheme: any){
    var isCustom = false;
    var sc: any = this.reports;
    if(!sectionHeaderTheme && sectionId != undefined){
      isCustom = true;
    }
    var isSectionContThemeExist = !sc.commonValidation.isNullOrEmpty(sectionTheme.textAlign) || 
                    !sc.commonValidation.isNullOrEmpty(sectionTheme.background) || 
                      !sc.commonValidation.isNullOrEmpty(sectionTheme.spacing) ||
                      !sc.commonValidation.isNullOrEmpty(sectionTheme.height) ||
                      !sc.commonValidation.isNullOrEmpty(sectionTheme.border) ;
    if(isSectionContThemeExist){
      if(isCustom){
        css.push('#ep_report_section_' + sectionId +' {');
      }else if(sectionHeaderTheme){
        css.push('#'+ sectionId + ' .ep_report_section_additional_header_container {');
      }else{
        css.push('.ep_report_section_container {');
      }
      if(!sc.commonValidation.isNullOrEmpty(sectionTheme.textAlign)){
        css.push('\ttext-align:' + sectionTheme.textAlign + ';');
      }
      if(!sc.commonValidation.isNullOrEmpty(sectionTheme.background)){
        css.push('\tbackground:' + sectionTheme.background + ';');
      }
      if(!sc.commonValidation.isNullOrEmpty(sectionTheme.spacing)){
        css.push('\tmargin-bottom:' + sectionTheme.spacing + 'px;');
      }
      if(!sc.commonValidation.isNullOrEmpty(sectionTheme.height)){
        css.push('\theight:' + sectionTheme.height + 'px;');
      }
      var border = sectionTheme.border || {};
      border.type = border.type || '';
      border.thickness = border.thickness|| '';
      border.color = border.color || '';
      if(!sc.commonValidation.isNullOrEmpty(border.type)){
        if(border.type == 'All'){
          css.push('\tborder: ' + border.thickness +'px !important;');
          css.push('\tborder-style: solid !important;');
          css.push('\tborder-color: ' + border.color +' !important;');
        }else if(border.type == 'Vertical'){
          css.push('\tborder: ' + border.thickness +'px !important;');
          css.push('\tborder-style: solid !important;');
          css.push('\border-color: ' + border.color +' !important;');
          css.push('\tborder-top: 0px !important;');
          css.push('\tborder-bottom: 0px !important;');
        }else if(border.type == 'Horizontal'){
          css.push('\tborder: ' + border.thickness + 'px !important;');
          css.push('\tborder-style: solid !important;');
          css.push('\tborder-color: ' + border.color +' !important;');
          css.push('\tborder-left: 0px !important;');
          css.push('\tborder-right: 0px !important;');
        }else if(border.type == 'None'){
          css.push('\tborder: 0px !important;');
        }
      }
      css.push('}');
    }
    var isSectionHeaderThemeExist = !sc.commonValidation.isNullOrEmpty(sectionTheme.color) ||
                    !sc.commonValidation.isNullOrEmpty(sectionTheme.fontWeight) ||
                    !sc.commonValidation.isNullOrEmpty(sectionTheme.fontSize) ||
                    !sc.commonValidation.isNullOrEmpty(sectionTheme.fontFamily) ||
                    !sc.commonValidation.isNullOrEmpty(sectionTheme.verticalAlign) ;
    if(isSectionHeaderThemeExist){
      if(isCustom){
        css.push('#ep_report_section_' + sectionId +' > .ep_report_section_header {');
      }else if(sectionHeaderTheme){
        css.push('#'+ sectionId + ' .ep_report_section_additional_header {');
      }else{
        css.push('.ep_report_section_header {');
      }
      if(!sc.commonValidation.isNullOrEmpty(sectionTheme.color)){
        css.push('\tcolor:' +sectionTheme.color+ ';');
      }
      if(!sc.commonValidation.isNullOrEmpty(sectionTheme.fontWeight) && sectionTheme.fontWeight != ''){
        css.push('\tfont-weight:' +sectionTheme.fontWeight+ ';');
      }
      if(!sc.commonValidation.isNullOrEmpty(sectionTheme.fontSize)){
        css.push('\tfont-size:' +sectionTheme.fontSize+ 'pt !important;');
      }
      if(!sc.commonValidation.isNullOrEmpty(sectionTheme.fontFamily)){
        css.push('\tfont-family:' +sectionTheme.fontFamily+ ';');
      }
      if(!sc.commonValidation.isNullOrEmpty(sectionTheme.verticalAlign)){
        css.push('\tvertical-align:' +sectionTheme.verticalAlign+ ';');
      }
      css.push('}');
    }
  }

  tabColorExecuteTheme(css: Array<any>){
    var clubberReport = this.reports.reportMetaData.clubbed;
    clubberReport.forEach((tabObj: any, indx: number) => {
      var currTabIndx: number = indx + 1;
      var tabColorObj: any = tabObj.sectionList[0].tabColor;
      for (var k in tabColorObj){
        if(k === 'default'){
          css.push('.tabPanel:nth-child('+currTabIndx+'){');
          if(tabColorObj['default'].color != ''){
            css.push('\tcolor:'+tabColorObj[k].color+' !important;');
          }
          if(tabColorObj['default'].background != ''){
            css.push('\tbackground:'+tabColorObj[k].background+' !important;');
          }
          css.push('}');
        }else if(k === 'active'){
          css.push('.tabPanel.tabButton:nth-child('+currTabIndx+'){');
          if(tabColorObj.active.color != ''){
            css.push('\tcolor:'+tabColorObj[k].color+' !important;');
          }
          if(tabColorObj.active.background != ''){
            css.push('\tbackground:'+tabColorObj[k].background+' !important;');
          }
          css.push('}');
        }else if(k === 'hover'){
          css.push('.tabPanel:hover:nth-child('+currTabIndx+'){');
          if(tabColorObj.hover.color != ''){
            css.push('\tcolor:'+tabColorObj[k].color+' !important;');
          }
          if(tabColorObj.hover.background != ''){
            css.push('\tbackground:'+tabColorObj[k].background+' !important;');
          }
          css.push('}');
        }
       }
    });
    return css;
  }

  getThemeNameByCondition(record: any, fieldObj: any, rowIndex: number, columIndex: number, displayFieldList: any, themeType: string, currentReportSection: any){
    var themeName: string = null;
    var currentSection: any = null;
    currentReportSection = currentReportSection || {};
    var reportViews = this.reports.reportMetaData.reportViews;
    if(this.reports.activeTab){
      this.reports.activeTab.sectionList.forEach((secObj: any, index: number) => {
        if(secObj.sectionId == currentReportSection.sectionId){
          currentSection = secObj;
        }
      });
    }
    if(currentSection){
      var theme: any = currentSection.theme || {};
      var condition_ref: any = theme.condition_ref || {};
      if(columIndex == 0){
        this.rowThemeName = null;
        (displayFieldList || []).forEach((displayField: any) => {
          var displayFieldType = '';
          if(themeType == 'rowCount' || themeType == 'rowCount_title'){
            displayFieldType = 'ROW_COUNT';
          }else if(record.isRowCummulative==true){
            displayFieldType = 'CUMMULATIVE';
          }else if(displayField.type == 'calculatedData'){
            displayFieldType = 'CALCULATED_DATA';
          }else if(displayField.type == 'columnTotal'){
            displayFieldType = 'COLUMN_COUNT';
          }else{
            displayFieldType = displayField.name_actual;
          }
          (condition_ref[displayFieldType] || []).forEach((themeInfo: any) => {
            if(this.rowThemeName == null && themeInfo.applyTheme == 'Row' && this.isConditionMatched(themeInfo, record[displayField.mapping], record, displayField.mapping)){
              this.rowThemeName = themeInfo.themeName;
            }
          });
        });
      }
      var fielObjType = '';
      if(themeType == 'rowCount'){
        fielObjType = 'ROW_COUNT';
      }else if(themeType == 'rowCount_title'){
        fielObjType = 'ROW_COUNT_TITLE';
      }else if(record.isRowCummulative==true){
        fielObjType = 'CUMMULATIVE';
      }else if(fieldObj.type == 'calculatedData'){
        fielObjType = 'CALCULATED_DATA';
      }else if(fieldObj.type == 'columnTotal'){
        fielObjType = 'COLUMN_COUNT';
      }else{
        fielObjType = fieldObj.name_actual;
      }
      (condition_ref[fielObjType] || []).forEach((themeInfo: any) => {
        if(themeName == null && themeInfo.applyTheme == 'Cell' && this.isConditionMatched(themeInfo, record[fieldObj.mapping], record, fieldObj.mapping)){
          themeName = themeInfo.themeName;
        }
      });
    }
    return themeName || this.rowThemeName || '';
  }

  getHeaderThemeNameByCondition(fieldObj: any, currentReportSection: any, rowIndex: number, columnIndex: number, isAdditionalHeader: boolean){
    var themeName: string = null;
    var currentSection: any = null;
    currentReportSection = currentReportSection || {};
    if(this.reports.activeTab){
      this.reports.activeTab.sectionList.forEach((secObj: any, index: number) => {
        if(secObj.sectionId == currentReportSection.sectionId){
          currentSection = secObj;
        }
      });
    }
    if(currentSection){
      var theme = currentSection.theme || {};
      var condition_ref = theme.condition_ref || {};
      var additionalDetails = {isAdditionalHeader: isAdditionalHeader, headerColumnList: currentReportSection.displayFields, additionalHeaderList: currentReportSection.additionalHeaderList, currentHeaderRowIndex: rowIndex, currentColumnIndex: columnIndex};
      (condition_ref['HEADER'] || []).forEach((themeInfo: any) => {
        if(themeName == null && this.isConditionMatched(themeInfo, fieldObj['name_actual'], null, fieldObj.mapping, additionalDetails)){
          themeName = themeInfo.themeName;
        }
      });
    }
    return themeName || this.rowThemeName || '';
  }

  isConditionMatched(themeInfo: any, value: any, record: any, mapping: string , additionalDetails?: any){
    value = value || '';
    additionalDetails = additionalDetails || {};
    var returnValue = false;
    if(!themeInfo.isCompareCondition){
      switch(themeInfo.condition || ''){
      case '=':
        return  (value == themeInfo.value);
      case '!=':
        return  (value != themeInfo.value);
      case '>':
        if(!isNaN(value)){
          return  (value > themeInfo.value);
        }
        break;
      case '<':
        if(!isNaN(value)){
          return  (value < themeInfo.value);
        }
        break;
      case 'Contains':
        return  (value.indexOf(themeInfo.value) != -1);
      case 'Not Contains':
        return  (value.indexOf(themeInfo.value) == -1);
      case '>=':
        if(!isNaN(value)){
          return  (value >= themeInfo.value);
        }
        break;
      case '<=':
        if(!isNaN(value)){
          return  (value <= themeInfo.value);
        }
        break;
      case 'Between':
        if(!isNaN(value)){
          return  ((value <= themeInfo.endValue) && (value >= themeInfo.value));
        }
        break;
      default:
        break;
      }
    }else{
      if (themeInfo.compareScript && themeInfo.compareScript.selectedStep && themeInfo.compareScript.selectedStep.script) {
        try {
          returnValue = eval('(function execute(value, rowObject, mapping){' + themeInfo.compareScript.selectedStep.script + '})')(value, record, mapping, additionalDetails);
          if (typeof returnValue == 'boolean') {
          } else {
            returnValue = false;
          }
        } catch (e) {
          
        }
      }
    }
    return returnValue;
  }

}
