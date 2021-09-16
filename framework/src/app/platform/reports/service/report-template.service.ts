import { Injectable } from '@angular/core';
import { ReportsService } from './reports.service';

@Injectable({
  providedIn: 'root'
})
export class ReportTemplateService {

  constructor( private reports: ReportsService ) { }

  applyTheme(){
    var css: Array<any> = [];
    (this.reports.activeTab.sectionList || []).forEach((secObj: any) => {
      if(secObj.reportId != "" && secObj.legend){
        if(secObj.legend.templateDetails){
          css.push(this.generateTheme(secObj,"legend"));
        }
      }
      if(secObj.reportId != "" && secObj.form && secObj.reportType == "Form"){
        if(secObj.form.templateDetails){
          css.push(this.generateTheme(secObj,"form"));
        }
      }
    });
    var reportThemeObj: any = document.getElementById("style_report_legend_theme");
    if(!reportThemeObj){
      reportThemeObj = document.createElement("style");
      reportThemeObj.type = "text/css";
      reportThemeObj.id = "style_report_legend_theme";
      document.head.append(reportThemeObj);
    }
    reportThemeObj.innerHTML = css.join("\n");
  }

  generateTheme(currentSection: any, type: string){
    var css: Array<any> = [];
    var secId: string = currentSection.sectionId;
    var sc: any = this.reports;
    var currentSectionTheme: any = {};
    if(type && type.toLowerCase() == "form"){
      this.getReportTitleCss(css, currentSection, "form");
      currentSectionTheme = currentSection.form.templateDetails.theme;
    }
    else{
      this.getReportTitleCss(css, currentSection, "legend");
      currentSectionTheme = currentSection.legend.templateDetails.theme;
    }
    (currentSectionTheme || []).forEach((themeObj: any) => {
      var themeId: string = themeObj.id;
      css.push("."+themeId + " {");
      if(!sc.commonValidation.isNullOrEmpty(themeObj.background)){
        css.push("\tbackground:" + themeObj.background +" !important;");
      }
      if(!sc.commonValidation.isNullOrEmpty(themeObj.color)){
        css.push("\tcolor:" + themeObj.color +" !important;");
      }
      if(!sc.commonValidation.isNullOrEmpty(themeObj.align)){
        css.push("\ttext-align:" + themeObj.align +" !important;");
      }
      if(!sc.commonValidation.isNullOrEmpty(themeObj.verticalAlign)){
        css.push("\tvertical-align:" + themeObj.verticalAlign +" !important;");
      }
      if(!sc.commonValidation.isNullOrEmpty(themeObj.fontFamily)){
        css.push("\tfont-family:" + themeObj.fontFamily +" !important;");
      }
      if(!sc.commonValidation.isNullOrEmpty(themeObj.fontSize)){
        css.push("\tfont-size:" + themeObj.fontSize +"pt !important;");
      }
      if(!sc.commonValidation.isNullOrEmpty(themeObj.fontWeight)){
        css.push("\tfont-weight:" + themeObj.fontWeight +" !important;");
      }
      var border: any = themeObj.border || {};
      if(border.type){
        border.type = border.type || "";
        border.thickness = border.thickness|| "";
        border.color = border.color || "";
        if(!sc.commonValidation.isNullOrEmpty(border.type)){
          if(border.type == "All"){
            css.push("\tborder: " + border.thickness +"px !important;");
            css.push("\tborder-style: solid !important;");
            css.push("\tborder-color: " + border.color +" !important;");
          }else if(border.type == "Vertical"){
            css.push("\tborder: " + border.thickness +"px !important;");
            css.push("\tborder-style: solid !important;");
            css.push("\border-color: " + border.color +" !important;");
            css.push("\tborder-top: 0px !important;");
            css.push("\tborder-bottom: 0px !important;");
          }else if(border.type == "Horizontal"){
            css.push("\tborder: " + border.thickness + "px !important;");
            css.push("\tborder-style: solid !important;");
            css.push("\tborder-color: " + border.color +" !important;");
            css.push("\tborder-left: 0px !important;");
            css.push("\tborder-right: 0px !important;");
          }else if(border.type == "None"){
            css.push("\tborder: 0px !important;");
          }
        }
      }
      css.push("}");
    });
    return css.join("\n");
  }

  getReportTitleCss(css: Array<any>, currentSection: any, type: string){
    var templateDetails: any = currentSection[type].templateDetails;
    var sectionId: string = currentSection.sectionId;
    var sc = this.reports;
    if(templateDetails){
      var reportTitle: any = templateDetails.reportTitle || {};
      var border: any = reportTitle.border || {};
      var styles: any = templateDetails.styles || {};
      var checkStat = !sc.commonValidation.isNullOrEmpty(reportTitle.background) ||
              !sc.commonValidation.isNullOrEmpty(reportTitle.color) || 
              !sc.commonValidation.isNullOrEmpty(reportTitle.align) ||
              !sc.commonValidation.isNullOrEmpty(reportTitle.verticalAlign) ||
              !sc.commonValidation.isNullOrEmpty(styles.fontFamily) || 
              !sc.commonValidation.isNullOrEmpty(styles.fontSize) ||
              !sc.commonValidation.isNullOrEmpty(styles.fontWeight) || 
              !sc.commonValidation.isNullOrEmpty(border.color) ||
              !sc.commonValidation.isNullOrEmpty(border.thickness) ||
              !sc.commonValidation.isNullOrEmpty(border.type) ;
      
      if(checkStat) {
        if(type == "form"){
          css.push("#template_table_"+sectionId+".table-gen tbody td.report-grid-cells.tableCell, #template_table_"+sectionId+".table-gen tbody td.report-grid-cells.tableCell input, #template_table_"+sectionId+".table-gen tbody td.report-grid-cells.tableCell textarea {");
        }
        if(type == "legend"){
          css.push("#legend_table_"+sectionId+".table-gen tbody td.report-grid-cells.tableCell {");
        }
        if(!sc.commonValidation.isNullOrEmpty(reportTitle.background)){
          css.push("\tbackground:" + reportTitle.background +";");
        }
        if(!sc.commonValidation.isNullOrEmpty(reportTitle.color)){
          css.push("\tcolor:" + reportTitle.color +";");
        }
        if(!sc.commonValidation.isNullOrEmpty(reportTitle.align)){
          css.push("\ttext-align:" + reportTitle.align +";");
        }
        if(!sc.commonValidation.isNullOrEmpty(reportTitle.verticalAlign)){
          css.push("\tvertical-align:" + reportTitle.verticalAlign +";");
        }
        if(!sc.commonValidation.isNullOrEmpty(styles.fontSize)){
          css.push("\tfont-size: " + styles.fontSize + "pt;");
        }
        if(!sc.commonValidation.isNullOrEmpty(styles.fontFamily)){
          css.push("\tfont-family: " + styles.fontFamily + ";");
        }
        if(!sc.commonValidation.isNullOrEmpty(styles.fontWeight)){
          css.push("\tfont-weight: " + styles.fontWeight + ";");
        }
        border.type = border.type || "";
        border.thickness = border.thickness|| "";
        border.color = border.color || "";
        if(!sc.commonValidation.isNullOrEmpty(border.type)){
          if(border.type == "All"){
            css.push("\tborder: " + border.thickness +"px;");
            css.push("\tborder-style: solid;");
            css.push("\tborder-color: " + border.color +";");
          }else if(border.type == "Vertical"){
            css.push("\tborder: " + border.thickness +"px;");
            css.push("\tborder-style: solid;");
            css.push("\border-color: " + border.color +";");
            css.push("\tborder-top: 0px;");
            css.push("\tborder-bottom: 0px;");
          }else if(border.type == "Horizontal"){
            css.push("\tborder: " + border.thickness + "px;");
            css.push("\tborder-style: solid;");
            css.push("\tborder-color: " + border.color +";");
            css.push("\tborder-left: 0px;");
            css.push("\tborder-right: 0px;");
          }else if(border.typ == "None"){
            css.push("\tborder: 0px;");
          }
        }
        css.push("}");
      }
    }
  }
  
  updateFreeHandText(handText: any, secObj: any, objIndex: number, rowIndex: number, colIndex: number, element? :Event){
    var sectionId = secObj.sectionId;
    var freeHandText: object = secObj.freeHandText || {};
    secObj.freeHandText = freeHandText || {};
    freeHandText[objIndex] = freeHandText[objIndex] || {};
    freeHandText[objIndex][rowIndex] = freeHandText[objIndex][rowIndex] || {};
    if(element != undefined){
      handText = $(element.target).val();
    }
    freeHandText[objIndex][rowIndex][colIndex] = handText || "";
    secObj.freeHandText = freeHandText;
    var reportViews: string = this.reports.reportMetaData.reportViews;
    if(reportViews == "Single"){
      this.reports.reportMetaData.single.form.freeHandText = freeHandText;
    }else if(reportViews == "Clubbed"){
      (this.reports.reportMetaData.clubbed || []).forEach((clubObj: any) => {
        if(clubObj.id == this.reports.activeTab.id){
          (clubObj.sectionList || []).forEach((secObj: any) => {
            if(sectionId == secObj.sectionId){
              secObj.report_metadata.single.form.freeHandText = freeHandText;
            }
          });
        }
      });
    }
  }
}
