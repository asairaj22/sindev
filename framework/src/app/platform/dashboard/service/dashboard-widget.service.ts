import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '@platform/util/api.service';
import { StringUtilService } from './stringUtil.service';

import * as Highcharts from 'highcharts';
import highcharts3D from 'highcharts/highcharts-3d.src';
declare var $: any;

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');
let Exporting = require('highcharts/modules/exporting');
let ExportData = require('highcharts/modules/export-data');
let Funnel = require('highcharts/modules/funnel');
let SolidGauge = require('highcharts/modules/solid-gauge');
let Stock =  require('highcharts/modules/stock');

var sand_url = "assets/images/sand.png";
var progress_gif_url = "assets/images/in-progress-circle.gif";

highcharts3D(Highcharts);
Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
Exporting(Highcharts);
ExportData(Highcharts);
Funnel(Highcharts);
SolidGauge(Highcharts);
Stock(Highcharts);

Highcharts.wrap(Highcharts.Axis.prototype, 'getPlotLinePath', function(proceed) {
  var path = proceed.apply(this, Array.prototype.slice.call(arguments, 1));
  if (path) {
      path.flat = false;
  }
  return path;
});

@Injectable({
  providedIn: 'root'
})
export class DashboardWidgetService {

  isAdminPrivilege: boolean = true;
  grid: any = null;
  isAdminUser: boolean = false;
  epDashboardType: string = 'User';
  dashboardInfo: any = {};
  currentDasboardInfo: any = {};
  nameList: any[] = [];
  appName: string;
  predefinedDasboardInfo: any = {};
  widgetTemplateContainers: any = null;
  widgetNameListClone: Array<string> = [];
  isAdvanceViewOpen: boolean = false;
  hasDashboardAdminAccess: boolean = false;
  hasDashboardBasicAccesss: boolean = false;
  _intervalTimer: any = null;
  _default:any = {
    name: "Dashboard_Default",
    isSaved: false,
    chartTheme : "1",
    position: 1, 
    isActive: true,
    state: "Active",
    isAutoAlign: true,
    columnPerRow: "3",
    refreshInterval: 0,
    widgetInfo: {},
    widgetNameList: []
  };
  static_data:any = {
    date_format: [
      {format: "EEE", desc: "Abbreviated weekday name (Sun to Sat)"},
      {format: "EEEE", desc: "Weekday name in full (Sunday to Saturday)"},
      {format: "d", desc: "Day of the month as a numeric value (0 to 31)"},
      {format: "dd", desc: "Day of the month as a numeric value (01 to 31)"},
      {format: "M", desc: "Numeric month name (0 to 12)"},
      {format: "MM", desc: "Month name as a numeric value (00 to 12)"},
      {format: "MMM", desc: "Abbreviated month name (Jan to Dec)"},
      {format: "MMMM", desc: "Month name in full (January to December)"},
      {format: "yy", desc: "Year as a numeric, 2-digit value"},
      {format: "yyyy", desc: "Year as a numeric, 4-digit value"},
      {format: "h", desc: "Hour (1 to 12)"},
      {format: "hh", desc: "Hour (00 to 12)"},
      {format: "a", desc: "AM or PM"},
      {format: "H", desc: "Hour (0 to 23)"},
      {format: "HH", desc: "Hour (00 to 23)"},
      {format: "mm", desc: "Minutes (00 to 59)"},
      {format: "ss", desc: "Seconds (00 to 59)"},
      {format: "S", desc: "Microseconds (000000 to 999999)"}
    ],
    intervalType: ["HOUR", "MINUTE", "DAY", "WEEK", "MONTH", "QUARTER", "YEAR"]
  }
  chartInfo: any = {
    "column": {
      name: "Float Bar",
      img: "", //TODO:
      additionalInfo: {
        category: "2-Dimension",
        chart:{
          type: "column",
        },
        plotOptions: {
          series: {
            pointPadding: 0, // Defaults to 0.1
            groupPadding: 0.05// Defaults to 0.2
          }
        }
      },
      isFillPlotOptionRequired: true,
      displayFieldList: ["title", "xAxisName", "yAxisName"],
      returnObjects:["xAxis","yAxis","series"],
      advanceConfig: ["3D", "3D-Depth", "3D-Thickness", "3D-ViewDistance", "Legend","LegendRadius","Advance", "Label", "Label-YPosition", "Series", "Zoom", "X-Axis-Type", "Y-Axis-Type", "Views", "PlotLines"]
    },
    "bar": {
      name: "Horizontal Bar",
      img: "", //TODO:
      additionalInfo: {
        category: "2-Dimension",
        chart:{type: "bar"}
      },
      isFillPlotOptionRequired: true,
      displayFieldList: ["title", "xAxisName", "yAxisName"],
      returnObjects:["xAxis","yAxis","series"],
      advanceConfig: ["3D", "3D-Depth", "3D-Thickness", "3D-ViewDistance", "Legend", "LegendRadius", "Advance", "Label", "Label-YPosition", "Series", "Zoom", "X-Axis-Type", "Y-Axis-Type", "Views", "PlotLines"]
    },
    "pie": {
      name: "Pie",
      img: "", //TODO:
      additionalInfo: {
        category: "1-Dimension", 
        chart: {type: "pie"},
        plotOptions: {
          series: {allowPointSelect: true, cursor: "pointer", dataLabels: {enabled: false}, showInLegend: true}
        }
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title"],
      returnObjects:["series", "count"],
      advanceConfig: ["3D", "3D-Thickness", "Legend", "LegendRadius", "Advance", "Label", "Views", "Series"]
    },
    "donut": {
      name: "Donut",
      img: "", //TODO:
      additionalInfo: {
        category: "1-Dimension", 
        chart: {type: "pie"},
        plotOptions: {
          series: {innerSize: "60%",dataLabels: {enabled: false}, showInLegend: true}
        }
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title"],
      returnObjects:["series", "count"],
      advanceConfig: ["3D", "3D-Thickness", "Legend", "LegendRadius", "Advance", "Label", "Views", "Series"]
    },
    "line": {
      name: "Line",
      img: "", //TODO:
      additionalInfo: {
        category: "2-Dimension", 
        chart:{type: "line"}
      },
      beforeChartRender: function(chartObj, widgetInfo){
        chartObj.chart = chartObj.chart || {};
        chartObj.chart.type = chartObj.chart.type_ref == "spline" ? "spline" : "line";
        if(chartObj.xAxis&& chartObj.xAxis.type == "datetime"){
          chartObj.xAxis.categories.forEach(function(xAxis, index){
            var date: any = new Date(xAxis);
            if(date == "Invalid Date"){
              date = xAxis;
            }else{
              date = date.getTime()
            }
            chartObj.series.forEach(function(series){
              series.data[index] = [date, series.data[index]];
            });
          });
        }
      },
      isFillPlotOptionRequired: true,
      displayFieldList: ["title", "xAxisName", "yAxisName"],
      returnObjects:["xAxis","yAxis","series"],
      advanceConfig: ["Legend", "Advance", "Label", "Label-YPosition", "LineType", "Zoom", "X-Axis-Type", "Y-Axis-Type", "Plot-Symbol", "Views", "PlotLines", "Series"]
    },
    "bubble": {
      name: "Bubble",
      img: "", //TODO:
      additionalInfo: {
        category: "3-Dimension", 
        chart:{
          type: "bubble",
          zoomType: "xy",
        },
        plotOptions: {
          series: {dataLabels: {enabled: true,  format: "{point.name}"}}
        },
        legend: {enabled:false}
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title","xAxisName", "yAxisName"],
      returnObjects:["xAxis","yAxis","zAxis","data1","data2"],
    },
    "gauge": {
      name: "Gauge",
      img: "", //TODO:
      additionalInfo: {
        category: "Gauge",
        chart:{
          type: "gauge"
        },
        pane: {startAngle: -150, endAngle: 150},
      },
      beforeChartRender: function(chartObj, widgetInfo){
        var gaugeValue = chartObj.series[0].data[0];
        chartObj.yAxis.min = 0;
        chartObj.yAxis.max = Math.ceil(gaugeValue/100)*100;
        var percentage = chartObj.yAxis.max / 100;
        chartObj.yAxis.plotBands = [
          {from: chartObj.yAxis.min, to: percentage*60, color: '#55BF3B'},
          {from: percentage*60, to: percentage*80, color: '#DDDF0D'},
          {from: percentage*80, to: percentage*100, color: '#DF5353'}
        ];
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title"],
      returnObjects:["count"],
    },
    "solidgauge": {
      name: "Solid Gauge",
      img: "", //TODO:
      additionalInfo: {
        category: "Gauge",
        chart:{
           type: "solidgauge"
        },
        pane: {
              size: "140%",
              center: ["50%", "70%"],
              startAngle: -90,
              endAngle: 90,
              background: {
                  backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || "#EEE",
                  innerRadius: "60%",
                  outerRadius: "100%",
                  shape: "arc"
              }
        },
        yAxis: {
          lineWidth: 0,
              minorTickInterval: null,
              tickAmount: 2,
        }
      },
      beforeChartRender: function(chartObj, widgetInfo, series){
        try {
          var gaugeValue = (chartObj.series || series)[0].data[0];
          chartObj.yAxis.min = 0;
          chartObj.yAxis.max = Math.ceil(gaugeValue/100)*100;
          var flag = true;
          (chartObj.bgColorRangeList || []).forEach(function(bgInfo){
            var cond = bgInfo.cond || "";
            var value1 = bgInfo.value1 || "";
            var value2 = bgInfo.value2 || "";
            var bgColor = bgInfo.bgColor || "";
            if(flag && cond != "" && value1 != "" && bgColor != ""){
              if(cond == "Between"){
                if(gaugeValue >= value1 && gaugeValue <= value2){
                  chartObj.yAxis.stops = [[1, bgColor]];
                  flag = false;
                }
              }else{
                if(eval(gaugeValue + " " + cond + " " + value1)){
                  chartObj.yAxis.stops = [[1, bgColor]];
                  flag = false;
                }
              }
            }
          });
          delete chartObj.bgColorRangeList;
        }catch(e){
          
        }
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title"],
      returnObjects:["count"],
      advanceConfig: ["BackgroundAndSeriesRange", "pane-Background", "Range-Selection", "Advance", "Chart-Position", "Views", "Series"]
    },
    "candlestick": {
      name: "Candlestick",
      img: "", //TODO:
      additionalInfo: {
        category: "Candlestick",
        xAxis: {
           type: "datetime"
        },
        legend: {enabled:false}
      },
      beforeChartRender: function(chartObj, widgetInfo){
        chartObj.series[0].type = "candlestick";
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title", "xAxisName", "yAxisName"],
      returnObjects:["xAxis","data1","data2","data3","data4"],
    },
    "funnel": {
      name: "Funnel",
      img: "", //TODO:
      additionalInfo: {
        category: "1-Dimension",
        /*plotOptions: {
          series: {neckWidth: "50%", neckHeight: "25%"}
        }*/
        chart:{
          type: "funnel",
          marginRight: 100,
        },
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title"],
      returnObjects:["series","count"],
    },
    "area": {
      name: "area",
      img: "", //TODO:
      additionalInfo: {
        category: "2-Dimension",
        chart:{
          type: "area",
        },
        plotOptions: {
          series: {
            pointPadding: 0, // Defaults to 0.1
            groupPadding: 0.05// Defaults to 0.2
          }
        },
      },
      beforeChartRender: function(chartObj, widgetInfo){
        chartObj.chart = chartObj.chart || {};
        chartObj.chart.type = chartObj.chart.type_ref == "spline" ? "areaspline" : "area";
      },
      isFillPlotOptionRequired: true,
      displayFieldList: ["title", "xAxisName", "yAxisName"],
      returnObjects:["xAxis","yAxis","series"],
      advanceConfig: ["Legend", "LegendRadius", "Advance", "Label", "Label-YPosition", "Series", "LineType", "Zoom", "X-Axis-Type", "Y-Axis-Type","Plot-Symbol", "Views", "PlotLines"]
    },
    "scatter": {
      name: "scatter",
      img: "", //TODO:
      additionalInfo: {
        category: "3-Dimension", 
        chart:{
          type: "scatter",
          zoomType: "xy",
        },
        plotOptions: {
          series: {dataLabels: {enabled: true,  format: "{point.name}"}}
        },
        legend: {enabled:false}
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title","xAxisName", "yAxisName"],
      returnObjects:["xAxis","yAxis","zAxis","data1","data2"],
    }
  };

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private strings: StringUtilService 
  ) { }

  loadAppName(){
    this.appName = (JSON.parse(sessionStorage.getItem('ep-proj-active')) || {}).contextPath;
  }

  updateAutoAlign(){
    if(this.currentDasboardInfo.isAutoAlign){
      var columnPerRow = this.currentDasboardInfo.columnPerRow;
      $('#dashboard-grid-stack > .grid-stack-item').each((index: any, element: any) => {
        var x=0,y,width,height=6;
        if(columnPerRow == 1){
          width = 12;
          y = (index * height);
        }else if(columnPerRow == 2){
          width = 6;
          x = (index%2 == 0) ? 0 : 6;
          y = parseInt((index/2) + '') * height;
        }else if(columnPerRow == 3){
          width = 4;
          x = (index%3 == 0) ? 0 : (index%3 == 1) ? 4 : 8;
          y = parseInt((index/3) + '') * height;
        }
        this.grid.update(element, x, y, width, height);
        var render_widgetId = 'render_' + element.id;
        if($('#' + render_widgetId + '_table').length > 0){
          this.widget.refreshTable('render_' + element.id, true);
        }else{
          this.widget.refreshChart('render_' + element.id, true);
        }
      });
      this.grid.disable();
    }else{
      this.grid.enable();
      $('.ui-resizable-handle').unbind('click').click((e: any) => {
        var obj = e.target.parentElement;
        if(obj) this.widget.refreshChart('render_' + obj.id, true);
      });
    }
  }

  loadingWidget: any = {
    _dashboard: this,
    show(identifier: string, imagePath?: string): void{
      $(identifier).LoadingOverlay('show',{
        image: imagePath || progress_gif_url,
        color: '#e6e6e6',
        'z-index': 21474,
        maxSize : '100%'
      });
    },
    hide(identifier: string): void{
      $(identifier).LoadingOverlay('hide');
    }
  }

  validation: any = {
    isEmpty(obj: any) : boolean {
      return Object.keys(obj || {}).length == 0;
    },
    isNullOrEmpty(data: any) : boolean {
      data = data || '';
      return data == '';
    }
  }

  widget: any = {
    _dashboard: this,
    response: {},
    schedular: {},
    libraryWidgetTemplate: null,
    widgetInfo: {}, // Group of widgetInfo for current dahsboard as a map
    predefinedWidgetInfo: {},
    renderAll(library?: any): void { //Render all the All the widget in the current dashboard
      var _this = this;
      if (library) {
        if (typeof this._dashboard.predefinedDasboardInfo.widgetNameList != "undefined") {
          this._dashboard.dashboard.predefinedDasboardInfo.widgetNameList.forEach(function (widgetName: any) {
            _this.renderLibrary(widgetName);
          });
          var dom = $("div.library_widget");
          for (var i = 0; i < dom.children().length; i += 2) {
            var wrap = dom.children().slice(i, i + 2).wrap('<div class="col-md-4 p-0 p-2"/>');
          }
        }
      }
      else {
        if (typeof this._dashboard.currentDasboardInfo.widgetNameList != "undefined") {
          var s: number = this._dashboard.currentDasboardInfo.widgetNameList.length;
          this._dashboard.currentDasboardInfo.widgetNameList.forEach(function (widgetName: any) {
            _this.render(widgetName);
            s--;
            if(s == 0){
              setTimeout(() => {
                _this._dashboard.widgetNameListClone = [];
                $(".dashboard-widget-options").css('display', 'block');
              }, 100);
            }
          });
        }
      }
    },
    renderLibrary(widgetName: string): void{ //Render individual widget in the current dahsboard
      var _this = this;
      var widgetInfo = this.predefinedWidgetInfo[widgetName];
      if(!widgetInfo) return;
      var widgetId = widgetInfo.widget.id;
      var widget_render_id = "render_lWId_" + widgetId;
      var widget_offset = widgetInfo.offset;
      var renderedObj = $("#lWId_" + widgetId);
      if(renderedObj.length > 0){
        if(widgetInfo.widget.type == "chart") this.destroyChart(widget_render_id);
        renderedObj.attr("widget-name", widgetName);
        renderedObj.attr("widget-type", widgetInfo.widget.type);
      }else{
        var widgetTemplate_clone = this.libraryWidgetTemplate.clone();
        widgetTemplate_clone.attr("id", "lWId_" + widgetId);
        widgetTemplate_clone.attr("widget-id", widgetId);
        widgetTemplate_clone.attr("widget-name", widgetName);
        widgetTemplate_clone.attr("widget-type", widgetInfo.widget.type);
        widgetTemplate_clone.find(".widget-body-render").attr("id", widget_render_id);
      }
      $(".library_widget").append(widgetTemplate_clone);
      if(this.schedular[widgetId]) clearInterval(this.schedular[widgetId]);
      function _render() {
        var predefinedData = JSON.parse(widgetInfo.displayDetails.predefinedData);
        _this._dashboard.loadingWidget.show("#lWId_"+widgetId +" > section");
        _this.response[widgetId] = predefinedData;
        if(widgetInfo.widget.type == "chart"){
          _this.renderChart(widget_render_id, predefinedData, widgetInfo);
        }else if(widgetInfo.widget.type == "table") {
          _this.renderTable(widget_render_id, predefinedData, widgetInfo);
        }
        _this._dashboard.loadingWidget.hide("#lWId_"+widgetId+" > section");
      }
      var refreshInterval = widgetInfo.displayDetails.refreshInterval || "";
      if(!isNaN(refreshInterval) && refreshInterval > 0){
        _this.schedular[widgetId] = setInterval(_render, refreshInterval * 60 * 1000);
      }
      _render();
    },
    render(widgetName: any){ //Render individual widget in the current dahsboard
      var _this = this;
      var widgetInfo = this.widgetInfo[widgetName];
      if(!widgetInfo) return;
      var isPredefined = widgetInfo.displayDetails.predefinedValue;
      var widgetId = widgetInfo.widget.id;
      var widget_render_id = "render_widgetId_" + widgetName;
      var widget_offset = widgetInfo.offset;
      var renderedObj = document.querySelector("#widgetId_" + widgetName);
      if(renderedObj){
        if(widgetInfo.widget.type == "chart") this.destroyChart(widget_render_id);
        renderedObj.setAttribute("widget-name", widgetName);
        renderedObj.setAttribute("widget-type", widgetInfo.widget.type);
      }else{
        var curWidgetNativeElement = _this._dashboard.widgetTemplateContainers.toArray().find((compObj: any) => {
          return  compObj.nativeElement.getAttribute('widget-template-name') == widgetName;
        });
        var widgetTemplate_clone = curWidgetNativeElement.nativeElement;
        widgetTemplate_clone.setAttribute("id", "widgetId_" + widgetName);
        widgetTemplate_clone.setAttribute("widget-id", widgetId);
        widgetTemplate_clone.setAttribute("widget-name", widgetName);
        widgetTemplate_clone.setAttribute("widget-type", widgetInfo.widget.type);
        widgetTemplate_clone.querySelector(".widget-body-render").setAttribute("id", widget_render_id);
      
        _this._dashboard.grid.addWidget(widgetTemplate_clone, widget_offset.x, widget_offset.y, widget_offset.width, widget_offset.height);
        
        $("#widgetId_" + widgetName).resize(function(){
          if($("#render_"+widgetId+"_table").length == 0){
            _this.refreshChart(widget_render_id);
          }
        });
        $("#widgetId_" + widgetName).bind("drag-start", function(event: any, a: any , b: any) {
          if(!a.toElement.classList.contains("ui-resizable-handle") && !a.toElement.matches(".widget-move")){
            a.preventDefault();									
          }
        });
      }
      
      this._dashboard.updateAutoAlign();
      if(this.schedular[widgetId]) clearInterval(this.schedular[widgetId]);
      function _render() {
        var getWidgetDataReqDetails = (widgetInfo: any) => {
          let reqDetails: any = {};
          if(widgetInfo.isCreatedNew || widgetInfo.isModified || widgetInfo.isPartialModify){
            reqDetails['reqObj'] = { widget: widgetInfo.widget, filter: _this.getSelectedViewFilterDetails(widgetInfo), appName: _this._dashboard.appName };
            reqDetails['reqURL'] = '/dashboardAdmin/getWidgetData';
          }else{
            reqDetails['reqObj'] = { widgetId: widgetInfo.widget.id, epDashboardType: _this._dashboard.epDashboardType, appName: _this._dashboard.appName, selectedViewId: widgetInfo.widget.selectedViewId || null };
            reqDetails['reqURL'] = '/dashboard/getWidgetData/' + widgetInfo.widget.id;
          }
          return reqDetails;
        }
        _this._dashboard.loadingWidget.show("#widgetId_"+ widgetName +" > section");
        $("#widgetId_"+ widgetName + " .widget-body").css("overflow","hidden");
        $("#widgetId_"+ widgetName + " .highcharts-data-table").remove();
        let reqDetails: any = getWidgetDataReqDetails(widgetInfo);
        _this._dashboard.apiService.invokePlatformServiceApi(reqDetails['reqURL'], 'POST', reqDetails['reqObj']).subscribe(
          (res: any) => {
            var _resp = res.body || {};
            if (_resp.status == "SUCCESS") {
              _this.response[widgetId] = _resp;
              if (widgetInfo.widget.type == "chart") {
                _this.renderChart(widget_render_id, _resp, widgetInfo);
              } else if (widgetInfo.widget.type == "table") {
                _this.renderTable(widget_render_id, _resp, widgetInfo);
              }
            } else {
              delete _this.response[widgetId];
              var widgetErrorMsg = _resp.error;
              $("#" + widget_render_id)[0].innerHTML = "<div align='center' style='color:aqua;background-color: #dd5826; margin: 50px 15px;'>" + widgetErrorMsg + "</div>";
            }
            _this._dashboard.loadingWidget.hide("#widgetId_" + widgetName + " > section");
          },
          (err: any) => {
            _this._dashboard.toastr.error((_this._dashboard.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
            
          }
        );
      }
      function _renderLibraryWidget(){
        var predefinedData = JSON.parse(widgetInfo.displayDetails.predefinedData);
        _this._dashboard.loadingWidget.show("#widgetId_"+ widgetName +" > section");
        _this.response[widgetId] = predefinedData;
        if(widgetInfo.widget.type == "chart"){
          _this.renderChart(widget_render_id, predefinedData, widgetInfo);
        }else if(widgetInfo.widget.type == "table") {
          _this.renderTable(widget_render_id, predefinedData, widgetInfo);
        }
        _this._dashboard.loadingWidget.hide("#widgetId_"+ widgetName +" > section");
      }
      var refreshInterval = widgetInfo.displayDetails.refreshInterval || "";
      if(!isNaN(refreshInterval) && refreshInterval > 0){
        _this.schedular[widgetId] = setInterval(_render, refreshInterval * 60 * 1000);
      }
      if(isPredefined){
        _renderLibraryWidget();
      }
      else{
        _render();
      }
    },
    getSelectedViewFilterDetails(widgetInfo: any): any{
      var filterDetails = widgetInfo.filter;
      var viewList = widgetInfo.widget.viewList || [];
      var currentViewId = widgetInfo.widget.selectedViewId || null;
      if(viewList.length > 1){
        viewList.forEach((view: any) => {
          if((currentViewId && currentViewId == view.id) || (!currentViewId && view.isDefault)){
            filterDetails = view.filter;
          }
        });
      }
      return filterDetails;
    },
    renderChart(id: string, resp: any, _widgetInfo: any): void {
      var widgetInfo = JSON.parse(JSON.stringify(_widgetInfo));
      var selectedViewId = widgetInfo.widget.selectedViewId;
      if(selectedViewId){
        widgetInfo.widget.viewList.forEach(function(obj: any){
          if(obj.id == selectedViewId){
            //widgetInfo.displayDetails = obj.displayDetails; //TODO:need to uncomment this line
            widgetInfo.displayDetails.xAxisName = obj.name;
          }
        });
      }
      var _chartInfo = widgetInfo.widget.chartInfo || {};
      var displayDetails = widgetInfo.displayDetails;
      var chartObj: any = {
        series: resp.series,
        exporting: {enabled: false},
        chart: {}, title: {}, subtitle: {}, xAxis: {}, yAxis: {}, plotOptions: {}, legend: {itemStyle: {}}
      };
      var _validation = this._dashboard.validation;
      if(!_validation.isNullOrEmpty(displayDetails.title))
        chartObj.title.text = displayDetails.title;

      if(!_validation.isNullOrEmpty(displayDetails.subTitle))
        chartObj.subtitle.text = displayDetails.subTitle;

      if(!_validation.isNullOrEmpty(resp.xAxis))
        chartObj.xAxis.categories = resp.xAxis;
      
      if(!_validation.isNullOrEmpty(displayDetails.xAxisName))
        chartObj.xAxis.title =  {text: displayDetails.xAxisName};
      
      if(!_validation.isNullOrEmpty(displayDetails.yAxisName))
        chartObj.yAxis.title =  {text: displayDetails.yAxisName};
      
      var _chartInfoClone = JSON.parse(JSON.stringify(_chartInfo));
      delete _chartInfo.series;
      chartObj = angularMerge(chartObj, _chartInfo);
      if((_chartInfoClone.series || {}).hasOwnProperty('enabled')) chartObj.series.enabled = _chartInfoClone.series.enabled;
      var beforeChartRender = this._dashboard.chartInfo[widgetInfo.widget.chart_type].beforeChartRender;
      if(beforeChartRender){
        try{beforeChartRender(chartObj, widgetInfo);}catch(e){}
      }
      var domObj = $("#"+id);
      chartObj.legend.itemStyle.width = domObj.width() - 20;
      chartObj.chart.height = domObj.height();
      chartObj.credits = {enabled: false};
      var clonedChartInfo = JSON.parse(JSON.stringify(chartObj));
      if(!clonedChartInfo.colors){
        var chartOptions = Highcharts.getOptions();
        clonedChartInfo.colors = JSON.parse(JSON.stringify(chartOptions.colors));
      }
      return Highcharts.chart(id, clonedChartInfo);
    },
    renderConfiguringChart(target: any): void {
      var widgetName = this.getWidgetName(target);
      this._dashboard.advanceChartConfiguration.init(widgetName);
    },
    renderTable(id: string, resp: any, widgetInfo: any): void {
      widgetInfo.widgetTable_resp = JSON.parse(JSON.stringify(resp));
      $(window).trigger('resize');
    },
    refreshChart(id: string, needDelay?: boolean): void{
      if(id != null){
        var domObj = $("#" + id);
        var _chartRef = domObj.highcharts();
        var _refresh = function(timeout: number){
          setTimeout(function(){
            try {
              _chartRef.update({chart: {height: domObj.height()}, legend: {itemStyle: {width: domObj.width() - 20}}});
              window.dispatchEvent(new Event("resize"));
            } catch (error) {
              
            }
          }, timeout);
        }
        if(domObj.children().length > 0 && _chartRef){
          if(needDelay)_refresh(150);
          else _chartRef.reflow();
        }
      }else{
        setTimeout(function(){
          $("#dashboard-grid-stack [data-highcharts-chart]").each(function(index, element){
            var domObj = $("#" + element.id);
            domObj.highcharts().legend.update({chart: {height: domObj.height()}, itemStyle: {width: domObj.width() - 20}});
          });
          window.dispatchEvent(new Event("resize"));
        }, 100);
      }
    },
    refreshTable(id: string, needDelay?: boolean): void{
      if(needDelay){
        setTimeout(function(){
          $("#"+id+"_table").resize();
        }, 150);
      }else{
        $("#"+id+"_table").resize();
      }
    },
    destroyChart(chart_render_id: string): void{
      var _chartRef = $("#" + chart_render_id).highcharts();
      if(_chartRef)_chartRef.destroy();
    },
    destroyAllCharts(): void{
      var _this = this;
      Object.keys(this.schedular).forEach(function(widgetId){
        clearInterval(_this.schedular[widgetId])
      })
      $("#dashboard-grid-stack [data-highcharts-chart]").each(function(index: number, element: any){
        $("#" + element.id).highcharts().destroy();
      });
    },
    _getExport_TableData(widgetId: string, isTableView?: boolean): any{
      var resp = [];
      var _actualResp = this.response[widgetId]
      if(isTableView) resp.push(_actualResp.keyList.join(","));
      else resp.push(_actualResp.keyList);
      _actualResp.dbData.forEach((rowObj: any) => {
        var rowData = [];
        _actualResp.keyList.forEach((key: any) => {
          rowData.push(rowObj[key.replace(".", "_")] || "");
        });
        if(isTableView) resp.push(rowData.join(","));
        else resp.push(rowData);
      });
      if(isTableView) return resp.join("\n");
      else return resp;
    },
    _export(target: any, exportType: string) {
      var parentObj = getParentWidgetObject("[widget-name]", target);
      var widgetId = parentObj.getAttribute("widget-id");
      var widgetName = parentObj.getAttribute("widget-name");
      var widgetType = parentObj.getAttribute("widget-type");
      var chartTitle: string = '';
      if(widgetType == 'chart'){
        var highChartObj = $("#widgetId_" + widgetName + " .widget-body-render").highcharts();
        chartTitle = highChartObj.title.textStr;
      }else if(widgetType == 'table'){
        chartTitle = $(parentObj).find("div.tabletitle").text().trim();
      }
      if (exportType == "Excel" || (exportType == "Pdf" && widgetType == "table")) {
        var createElement = (type: string, name: string, value: any) => {
          var domObj: any = document.createElement("INPUT");
          domObj.type = type; domObj.name = name; domObj.value = value;
          return domObj;
        }

        var chartData = [];
        var exportFileName = chartTitle + (exportType == "Excel" ? ".xlsx" : ".pdf");
        if (widgetType == "chart") {
          chartData = highChartObj.getDataRows();
        } else if (widgetType == "table") {
          chartData = this._getExport_TableData(widgetId);
        }
        var requestData: any = { title: chartTitle, header: chartData.splice(0, 1), body: chartData };
        requestData.maxColumn = requestData.header[0].length;

        var my_form: any = document.getElementById("uploadWidget_form");
        if (my_form) my_form.remove();

        my_form = document.createElement("FORM");
        my_form.id = "uploadWidget_form";
        my_form.style.display = "none";
        my_form.method = "POST";
        my_form.setAttribute("accept-charset", 'UTF-8');
        my_form.enctype = 'application/x-www-form-urlencoded';

        my_form.action = this._dashboard.apiService.serviceURL + "/downloadWidgetServlet";

        let headers: any = this._dashboard.apiService.getDefaultHeaders();
        my_form.appendChild(createElement("hidden", "X-XSRF-TOKEN", headers["X-XSRF-TOKEN"]));
        my_form.appendChild(createElement("hidden", "XSRF-TOKEN", headers["XSRF-TOKEN"]));
        my_form.appendChild(createElement("hidden", "DOWNLOAD_FILE_NAME", exportFileName));
        my_form.appendChild(createElement("hidden", "REQUEST_DATA", JSON.stringify(requestData)));
        my_form.appendChild(createElement("hidden", "EXPORT_TYPE", exportType));

        document.body.appendChild(my_form);
        my_form.submit();
        //this._dashboard.strings.getDocumentObject("uploadWidget_form").submit();
      } else if (exportType == "CSV") {
        if (widgetType == "table") {
          var data = this._getExport_TableData(widgetId, true);
          this._exportCSV(chartTitle, data);
        } else {
          highChartObj.options.exporting.filename = chartTitle;
          highChartObj.downloadCSV();
        }
      } else {
        highChartObj.exportChart({ filename: chartTitle, type: (exportType == "Pdf" ? "application/pdf" : exportType) });
      }
    },
    _exportCSV(name: string, content: string): void {
      var a, blobObject, url = "http://www.highcharts.com/studies/csv-export/download.php";
      if (window.Blob && window.navigator.msSaveOrOpenBlob) {
        blobObject = new Blob([content]);
        window.navigator.msSaveOrOpenBlob(blobObject, name + ".csv");
      } else if (document.createElement("a").download !== undefined) {
        a = document.createElement("a");
        a.href = "data:text/csv,\uFEFF" + encodeURIComponent(content);
        a.target = "_blank";
        a.download = name + ".csv";
        document.body.append(a);
        a.click();
        a.remove();
      } else {
        Highcharts.post(url, {
          data: content,
          type: "text/csv",
          extension: "csv"
        });
      }
    },
    fullScreen(target: any): void{
      $("nav.page-controls").hide();
      var obj = getParentWidgetObject("[widget-name]", target);
      obj.classList.add("widget-fullscreen-mode");
      document.body.style.overflow = "hidden";
      var _this = this;
      setTimeout(function(){
        _this.refresh(target);
      }, 100);
    },
    exitFullScreen(target: any): void{
      $("nav.page-controls").show();
      var obj = getParentWidgetObject("[widget-name]", target);
      obj.classList.remove("widget-fullscreen-mode");
      document.body.style.removeProperty("overflow");
      var _this = this;
      setTimeout(function(){
        _this.refresh(target);
      }, 100);
    },
    _delete(target: any): void {
      if (target) {
        $("#widget_del_modal_widgetName")
          .text(this.getWidgetName(target))
          .attr("delete-widget-id", this.getWidgetId(target));
        $("#widget_del_modal").modal("show");
      } else {
        var widgetId = $("#widget_del_modal_widgetName").attr("delete-widget-id");
        var widgetName = $("#" + widgetId).attr("widget-name");
        delete this.widgetInfo[widgetName];
        var _currentDasboardInfo = this._dashboard.currentDasboardInfo;
        _currentDasboardInfo.widgetNameList.splice(_currentDasboardInfo.widgetNameList.indexOf(widgetName), 1);
        this._dashboard.grid.removeWidget(document.getElementById(widgetId));
        this._dashboard.updateAutoAlign();
        $("#widget_del_modal").modal("hide");
        this._dashboard.toastr.success('Deleted Successfully..!!', 'SUCCESS');
      }
    },
    getWidgetName(target: any): any{
      return getParentWidgetObject("[widget-name]", target).getAttribute("widget-name");
    },
    edit(target: any): any{
      this.wizard.init(false, this.getWidgetName(target));
    },
    refresh(target: any): void{
      this.render((typeof(target) == "string") ? target : this.getWidgetName(target));
    },
    toggleView(target: any, viewId: string){
      var widgetName = (typeof(target) == "string") ? target : this.getWidgetName(target);
      var widgetInfo = this.widgetInfo[widgetName];
      widgetInfo.widget.selectedViewId = viewId;
      this.render(widgetName);
    },
    print(target: any): void{
      $("#" + this.getWidgetId(target) + " .widget-body-render").highcharts().print();
    },
    getWidgetId(target: any): void{
      return getParentWidgetObject("[widget-name]", target).id;
    },
    calculatePosition(currentDasboardInfo: any): any{
      var offset = {x: 0, y: 0, width: 4, height: 6};
      var offsetYvalue = [];
      if(currentDasboardInfo.widgetNameList.length >0){
        currentDasboardInfo.widgetNameList.forEach((widgetname: string) => {
          var s_offset = currentDasboardInfo.widgetInfo[widgetname].offset;
          var noSpaceInXRow = offset.x + offset.width >= 8;
          if(noSpaceInXRow == false){
            offset.x = 4 + s_offset.x;
            offsetYvalue.push(offset.height);
          }else{
            offset.x = 0;
            offset.y = Math.max.apply(Math, offsetYvalue);
            offsetYvalue = [];
          }
        });
      }
      return offset;
    },
    wizard: {
      _dashboard: this,
      isNew: true, //To Identify is this create or edit view for the widget
      existingChart_type: null,
      predefinedWidget: false,
      widgetInfo_edit: null,
      selectedData: {widget: {},filter: {}, displayDetails: {}},
      sectionList: ["widget","filter", "displayDetails"],
      displayFieldList: [],
      activeSection: "widget",
      init(isNew: boolean, widgetName?: string): void { //Initialize create and edit widget view
        this.predefinedWidget = false;
        this._dashboard.isAdvanceViewOpen = false;
        this.widgetInfo_edit = null;
        this.isNew = isNew || false;
        this.existingChart_type = null;
        this.show();
        this._dashboard.databaseInfo.init();
        if(isNew){
          this.selectedData.widget.id = this._dashboard.strings.getRandomId();
          var newId = 0;
          Object.keys(this._dashboard.currentDasboardInfo.widgetInfo).forEach(function(key){
            var id = parseInt(key.replace("Widget_", ""));
            if(id > newId) newId = id;
          });
          this.selectedData.widget.name = "Widget_" + (newId + 1);
        }else{
          this.widgetInfo_edit = JSON.parse(JSON.stringify(this._dashboard.currentDasboardInfo.widgetInfo[widgetName]));
          this.existingChart_type = this.widgetInfo_edit.widget.chart_type;
          if(this.widgetInfo_edit.widget.type == "table"){
            this.existingChart_type = "table";
          }
          var _selectedData = this.selectedData;
          Object.keys(this.selectedData).forEach((key: any) => {
            var _targerObj = _selectedData[key];
            var _sourceObj = this.widgetInfo_edit[key];
            Object.keys(_sourceObj).forEach((key: any) => {
              _targerObj[key] = _sourceObj[key];
            });	
            _targerObj.isValid = false;
          });
        }
        this.queryBuilder.convertEQLToDynamic(this.selectedData.filter.EQL_query || "");
        var accObj: any = document.getElementById('dynamicAccordion').querySelector("h6[href='#acc'][aria-expanded='false']");
        if(accObj) accObj.click();
      },
      resetAll(): void { //Reset all selected details in side the widget wizard
        var _this = this;
        Object.keys(this.selectedData).forEach(function(key){
          var _obj = _this.selectedData[key];
          Object.keys(_obj).forEach(function(key){
            delete _obj[key];
          });
        });
      },
      show():  void{ //Open create and edit widget view
        this.resetAll();
        this.activeSection = "widget";
        this.validation.resetAll();
        $("#wizard_CreateOrEditWidget").modal("show");
      },
      hide(): void{ //Close create and edit widget view
        $("#wizard_CreateOrEditWidget").modal("hide");
      },
      toggleVisitedSection(sectionName: string): void{ //Close create and edit widget view
        if(this.activeSection != sectionName && this.selectedData[sectionName].isValid){
          this.activeSection = sectionName;
        }
      },
      next(): void{
        if(this.validation[this.activeSection](this.selectedData[this.activeSection])){
          var index = this.sectionList.indexOf(this.activeSection);
          this.activeSection = this.sectionList[index + 1];
          this.toDynamicQuerySection();
        }
      },
      back(): void{
        var index = this.sectionList.indexOf(this.activeSection);
        this.activeSection = this.sectionList[index - 1];
      },
      toCustomQuerySection(): void{
        var wizard_selectedData_filter = this._dashboard.widget.wizard.selectedData.filter;
        wizard_selectedData_filter.type = "Custom Query";
        wizard_selectedData_filter.EQL_query = this.queryBuilder.buildEqlQuery();
      },
      toDynamicQuerySection(): void{
        var wizard_selectedData_filter = this._dashboard.widget.wizard.selectedData.filter;
        wizard_selectedData_filter.type = "Build Query";
        this.queryBuilder.convertEQLToDynamic(wizard_selectedData_filter.EQL_query || "");
      },
      create(): void{
        if(this.validation.displayDetails(this.selectedData.displayDetails)){
          this.selectedData.displayDetails.id = this.selectedData.widget.id;
          var _widgetInfo = JSON.parse(JSON.stringify(this.selectedData));
          var _currentDasboardInfo = this._dashboard.currentDasboardInfo;
          _widgetInfo.offset = this._dashboard.widget.calculatePosition(_currentDasboardInfo);
          _widgetInfo.isCreatedNew = true;
          _currentDasboardInfo.widgetInfo[_widgetInfo.widget.name] = _widgetInfo;
          _currentDasboardInfo.widgetNameList.push(_widgetInfo.widget.name);
          this.hide();
          delete _widgetInfo.filter.queryAttributes;
          if(_widgetInfo.filter.type == "Build Query"){
            _widgetInfo.filter.EQL_query = this.queryBuilder.buildEqlQuery();
          }
          setTimeout(() => {
            this._dashboard.widget.render(_widgetInfo.widget.name);
          }, 0);
        }
      },
      update(): void{
        if(this.validation.displayDetails(this.selectedData.displayDetails)){
          var _widgetInfo = JSON.parse(JSON.stringify(this.selectedData));
          _widgetInfo.offset = this.widgetInfo_edit.offset;
          _widgetInfo.position = this.widgetInfo_edit.position;
          this.updateWidgetModifyStatus(_widgetInfo);
          var _currentDasboardInfo = this._dashboard.currentDasboardInfo;
          if(this.widgetInfo_edit.widget.name != _widgetInfo.widget.name){ //Widget Name Changed
            _currentDasboardInfo.widgetNameList[_currentDasboardInfo.widgetNameList.indexOf(this.widgetInfo_edit.widget.name)] = _widgetInfo.widget.name;
            delete _currentDasboardInfo.widgetInfo[this.widgetInfo_edit.widget.name];
          }
          if(_widgetInfo.widget.chartInfo_editedChart && _widgetInfo.widget.chart_type != this.existingChart_type){
            _widgetInfo.widget.chartInfo = _widgetInfo.widget.chartInfo_editedChart;
          }
          delete _widgetInfo.widget.chartInfo_editedChart;
          delete _widgetInfo.filter.queryAttributes;
          if(_widgetInfo.filter.type == "Build Query"){
            _widgetInfo.filter.EQL_query = this.queryBuilder.buildEqlQuery();
          }
          _currentDasboardInfo.widgetInfo[_widgetInfo.widget.name] = _widgetInfo;
          this.hide();
          setTimeout(() => {
            this._dashboard.widget.render(_widgetInfo.widget.name);
          }, 0);
        }
      },
      updateWidgetModifyStatus(widgetInfo: any): void {
        if(!this.widgetInfo_edit.isCreatedNew && !this.widgetInfo_edit.isModified){
          if((widgetInfo.widget.chart_type == this.widgetInfo_edit.widget.chart_type) && (widgetInfo.filter.EQL_query == this.widgetInfo_edit.filter.EQL_query)){
            var exceptionKeys = ["id","isValid","predefinedWidget","predefinedValue","predefinedData"];
            var dispFieldModifiedKey = Object.keys(widgetInfo.displayDetails).find((key: string) => {
              if(exceptionKeys.indexOf(key) == -1 && widgetInfo.displayDetails[key] !== (this.widgetInfo_edit.displayDetails[key] || '')){
                return true;
              }
            });
            if(dispFieldModifiedKey) widgetInfo.isPartialModify = true;
          }else{
            widgetInfo.isModified = true;
          }
        }else{
          if(this.widgetInfo_edit.isCreatedNew){
            widgetInfo.isCreatedNew = this.widgetInfo_edit.isCreatedNew;
          }else if(this.widgetInfo_edit.isModified){
            widgetInfo.isModified = this.widgetInfo_edit.isModified;
          }
        }
      },
      validation: {
        _dashboard: this,
        widget_errorMsg: null,
				dataSource_errorMsg: null,
				filter_errorMsg: null,
				displayDetails_errorMsg: null,
        resetAll(): void{
          this.widget_errorMsg = null;
          this.dataSource_errorMsg = null;
          this.filter_errorMsg = null;
          this.displayDetails_errorMsg = null;
        },
        widget(ref: any): boolean {
          var wizard_widget = this._dashboard.widget.wizard;
          var wizard_selectedData = wizard_widget.selectedData;
          var wizard_selectedData_widget = wizard_selectedData.widget;
          var wizard_selectedData_filter = wizard_selectedData.filter;
          var wizard_queryBuilder = wizard_widget.queryBuilder;
          this.widget_errorMsg = null;
          ref.isValid = false;
          ref.chart = null;
          wizard_widget.displayFieldList = [];
          if(this._dashboard.validation.isNullOrEmpty(ref.name)){
            this.widget_errorMsg = "Please Enter Widget Name";
          }else if(this._dashboard.validation.isNullOrEmpty(ref.type)){
            this.widget_errorMsg = "Please Select Widget Type";
          }else if(ref.type == "chart" && this._dashboard.validation.isNullOrEmpty(ref.chart_type)){
            this.widget_errorMsg = "Please Select Chart Type";
          }else ref.isValid = true;

          if(ref.isValid && ref.type == "chart"){
            var _selectedChartInfo = this._dashboard.chartInfo[ref.chart_type] || {};
            var additionalInfo_chart = _selectedChartInfo.additionalInfo;
            if(additionalInfo_chart) {
              ref.chartInfo = ref.chartInfo || {};
              ref.chartInfo = angularMerge(additionalInfo_chart, ref.chartInfo);
              if(!this.isNew) ref.chartInfo_editedChart = JSON.parse(JSON.stringify(additionalInfo_chart));
            }
            wizard_widget.displayFieldList = _selectedChartInfo.displayFieldList || [];
          }
          if((wizard_widget.existingChart_type != wizard_selectedData_widget.chart_type) || wizard_widget.existingChart_type == null){
            if(wizard_selectedData_widget.type == "chart"){
              if(this.widget_errorMsg == null){
                wizard_selectedData_filter.queryAttributes = JSON.parse(JSON.stringify(wizard_queryBuilder.queryAttributes_default));
              }
            }else{
              wizard_selectedData_filter.queryAttributes = JSON.parse(JSON.stringify(wizard_queryBuilder.queryAttributes_default));
            }
          }
          return this.widget_errorMsg == null;
        },
        filter(ref: any): boolean {
          var wizard_widget = this._dashboard.widget.wizard;
          var wizard_selectedData = wizard_widget.selectedData;
          var wizard_selectedData_filter = wizard_selectedData.filter;
          var wizard_queryBuilder = wizard_widget.queryBuilder;
          this.filter_errorMsg = null;
          ref.isValid = false;
          if(this._dashboard.validation.isNullOrEmpty(ref.type)){
            this.filter_errorMsg = "Please Select Filter Type";
          }else if(ref.type == "Build Query"){
            wizard_selectedData_filter.EQL_query = wizard_queryBuilder.buildEqlQuery();
          }else if(ref.type == "Custom Query"){
            
          }
          if(this._dashboard.validation.isNullOrEmpty(ref.EQL_query)){
            this.filter_errorMsg = "Please Enter Custom Query";
          }
          ref.isValid = (this.filter_errorMsg == null);
          return this.filter_errorMsg == null;
        },
        displayDetails(ref: any): boolean {
          var _this = this;
          var _displayFieldList = this._dashboard.widget.wizard.displayFieldList;
          this.displayDetails_errorMsg = null;
          try{
            var errormsg = {
              "title": "Please Enter Title",
              "xAxisName": "Please Enter X-Axis Name",
              "yAxisName": "Please Enter Y-Axis Name"
            };
            _displayFieldList.forEach(function(key: any){
              if(_this._dashboard.validation.isNullOrEmpty(ref[key]) && errormsg[key]){
                throw errormsg[key];
              }
            });
          }catch(e){
            this.displayDetails_errorMsg = e;
          }
          if(!this._dashboard.validation.isNullOrEmpty(ref.refreshInterval) && (isNaN(ref.refreshInterval) || ref.refreshInterval < 0)){
            this.displayDetails_errorMsg = "Invalid Refresh Interval!";								
          }
          ref.isValid = (this.displayDetails_errorMsg == null);
          if(ref.isValid){
            var exceptionKeys = ["id","refreshInterval","title","predefinedWidget","predefinedValue","predefinedData"];
            Object.keys(ref).forEach((key: string) => {
              if(exceptionKeys.indexOf(key) == -1 && _displayFieldList.indexOf(key) == -1){
                ref[key] = null;
              }
            });
          }
          return this.displayDetails_errorMsg == null;
        }
      },
      queryBuilder: {
        _dashboard: this,
        objectMetadataInfo: {},
        objectMetadata_attributeInfo: {},
        queryCustomIndex: null,
        queryAttributes_default: {dimension: [{}], condition: [{}],returnDynamic:[{}],orderByList: [{}],groupByList: [{}], fillPlotDetails: {fillPlot:"false",fillPlotObj: {}}},
        eql_keyWord: {
          where: " WHERE ",
          groupBy: " GROUP BY ",
          orderBy: " ORDER BY ",
          _return: " RETURN ",
          skip: " SKIP ",
          limit: " LIMIT ",
          fillplot: " FILLPLOTS ",
          as: " AS ",
          asc: " ASC",
          desc: " DESC",
          sum: "SUM",
          count: "COUNT",
          avg: "AVG",
          date: "DATE",
          custom: "CUSTOM",
          currentDateTime: "CURRENT_DATETIME",
          dateTime: "DATETIME"
        },
        getObjectMetadata(): void {
          var _this = this;
          this.objectMetadataInfo = {};
          this._dashboard.apiService.invokePlatformServiceApi('/dashboard/getObjectMetadata', 'GET').subscribe(
            (response: any) => {
              var ObjectMetadata = ((response.body || {}).objects) || [];
              _this.objectMetadataInfo = {};
              (ObjectMetadata || []).forEach(function(curObj: any){
                _this.objectMetadataInfo[curObj.model] = curObj;
              });
            },
            (err: any) => {
              this._dashboard.toastr.error((this._dashboard.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
              
            }
          );
        },
        loadDimension_attribute(): void {
          var _this = this;
          this.objectMetadata_attributeInfo = {};
          var aliasNameList = [];
          var commonValidation = this._dashboard.validation;
          this._dashboard.widget.wizard.selectedData.filter.queryAttributes.dimension.forEach(function(dimension: any){
            if(!commonValidation.isNullOrEmpty(dimension.node) && !commonValidation.isNullOrEmpty(dimension.alias) && aliasNameList.indexOf(dimension.alias) == -1) {
              var selectedObjectFilter = _this.objectMetadataInfo[dimension.node] || {};
              (selectedObjectFilter.attributes || []).forEach(function(obj: any){
                if(!commonValidation.isNullOrEmpty(obj.name)){
                  _this.objectMetadata_attributeInfo[dimension.alias + "." + obj.name] = obj.name;
                }
              });
            }
          });
        },
        add(scopeObj: any){
          scopeObj.push({});
        },
        addLogic(scopeObj: any){
          scopeObj.push({operation: '', logic: '', intervalType: ''});
        },
        addReturn(scopeObj: any){
          scopeObj.push({aggr: ''});
        },
        addGroupBy(scopeObj: any){
          scopeObj.push({type: ''});
        },
        addOrderBy(scopeObj: any){
          scopeObj.push({sort: 'ASC'});
        },
        _delete(scopeObj: any, index: number){
          scopeObj.splice(index, 1);
        },
        buildEqlQuery(){
          var queryList = [];
          var currentQueryList = [];
          try {
            var eql_keyWord = this.eql_keyWord;
            var wizard_selectedData_filter = this._dashboard.widget.wizard.selectedData.filter;
            var commonValidation = this._dashboard.validation;
            var queryAttributes = wizard_selectedData_filter.queryAttributes;

            //Select
            queryAttributes.dimension.forEach((dim: any) => {
              if(!commonValidation.isNullOrEmpty(dim.node)) {
                var selectStr = dim.node;
                if(!commonValidation.isNullOrEmpty(dim.alias)) {
                  selectStr += eql_keyWord.as + dim.alias;
                }
                currentQueryList.push(selectStr);
              }
            });
            if(currentQueryList.length > 0){
              queryList.push(currentQueryList.join(", "));
            }
            
            //Where
            currentQueryList = [];
            queryAttributes.condition.forEach((condObj: any, index: number) => {
              if((index == 0 || !commonValidation.isNullOrEmpty(condObj.logic)) && 
                !commonValidation.isNullOrEmpty(condObj.attr) &&
                !commonValidation.isNullOrEmpty(condObj.operation)) {
                var condStr = "";
                if(currentQueryList.length > 0){
                  if(condObj.isGrouped){
                    condStr = ") " + condObj.logic + " (";
                  }else{
                    condStr = condObj.logic + " ";
                  }
                }
                var attrValue = (condObj.attrValue || "").trim();
                var attrValue_upperCase = attrValue.toUpperCase();
                condStr += condObj.attr + " " + condObj.operation + " " + attrValue;
                if(attrValue_upperCase == eql_keyWord.currentDateTime &&
                    !commonValidation.isNullOrEmpty(condObj.interval) &&
                    !commonValidation.isNullOrEmpty(condObj.intervalType)){
                  condStr +=  " " + condObj.interval + " " + condObj.intervalType;
                }else if(attrValue_upperCase == eql_keyWord.dateTime){
                  condStr +=  "(" + condObj.attrDateKey + ", '" + condObj.attrDateFormat + "')";
                }
                currentQueryList.push(condStr);
              }
            });
            if(currentQueryList.length > 0){
              queryList.push(eql_keyWord.where + "(" + currentQueryList.join(" ") + ")");							
            }
            
            //Group By
            currentQueryList = [];
            queryAttributes.groupByList.forEach((groupByObj: any) => {
              if(!commonValidation.isNullOrEmpty(groupByObj.groupby)) {
                if(groupByObj.type == eql_keyWord.date){
                  currentQueryList.push(eql_keyWord.date + "(" + groupByObj.groupby + ", '" + (groupByObj.format || "") + "')");
                }else{
                  currentQueryList.push(groupByObj.groupby);
                }
              }
            });
            if(currentQueryList.length > 0){
              queryList.push(eql_keyWord.groupBy + currentQueryList.join(", "));							
            }
            
            //Order By
            currentQueryList = [];
            queryAttributes.orderByList.forEach((orderByObj: any) => {
              if(!commonValidation.isNullOrEmpty(orderByObj.orderby)) {
                if(orderByObj.sort == eql_keyWord.desc.trim()){
                  currentQueryList.push(orderByObj.orderby + eql_keyWord.desc);
                }else{
                  currentQueryList.push(orderByObj.orderby + eql_keyWord.asc);
                }
              }
            });
            if(currentQueryList.length > 0){
              queryList.push(eql_keyWord.orderBy + currentQueryList.join(", "));							
            }
            
            //Return
            currentQueryList = [];
            queryAttributes.returnDynamic.forEach((returnObj: any) => {
              if(!commonValidation.isNullOrEmpty(returnObj.attr)) {
                var returnStr = "";
                switch(returnObj.aggr || ""){
                  case eql_keyWord.sum:
                    returnStr = (eql_keyWord.sum + "(" + returnObj.attr + ") " + (returnObj.additionalInfo || "")).trim();
                    break;
                  case eql_keyWord.count:
                    returnStr = (eql_keyWord.count + "(" + returnObj.attr + ") " + (returnObj.additionalInfo || "")).trim();
                    break;
                  case eql_keyWord.avg:
                    returnStr = (eql_keyWord.avg + "(" + returnObj.attr + ") " + (returnObj.additionalInfo || "")).trim();
                    break;
                  case eql_keyWord.date:
                    returnStr = eql_keyWord.date + "(" + returnObj.attr + ", '" + (returnObj.additionalInfo || "") + "')";
                    break;
                  case eql_keyWord.custom:
                    returnStr = (eql_keyWord.custom + "{" + returnObj.attr + "} " + (returnObj.additionalInfo || "")).trim();
                    break;
                  default: 
                    returnStr = (returnObj.attr + " " + (returnObj.additionalInfo || "")).trim();
                    break;
                }
                if(!commonValidation.isNullOrEmpty(returnObj.aliasName)) {
                  returnStr += eql_keyWord.as + returnObj.aliasName;
                }
                currentQueryList.push(returnStr);
              }
            });
            if(currentQueryList.length > 0){
              queryList.push(eql_keyWord._return + currentQueryList.join(", "));							
            }
            
            //Skip
            if(!commonValidation.isNullOrEmpty(queryAttributes.skip)) {
              queryList.push(eql_keyWord.skip + queryAttributes.skip);
            }
            
            //Limit
            if(!commonValidation.isNullOrEmpty(queryAttributes.limit)) {
              queryList.push(eql_keyWord.limit + queryAttributes.limit);
            }
            
            //Fill Plots
            if(queryAttributes.fillPlotDetails.fillPlot == 'true') {
              var fillPlotObj = queryAttributes.fillPlotDetails.fillPlotObj;
              var obj = {start: (fillPlotObj.start || "") + " " + (fillPlotObj.startInterval || 0) + " " + (fillPlotObj.startIntervalType || ""),
                    end: (fillPlotObj.end || "") + " " + (fillPlotObj.endInterval || 0) + " " + (fillPlotObj.endIntervalType || ""),
                    range: (fillPlotObj.plotIntervalType || "") + " (" + (fillPlotObj.plotAttrDateFormat || "") + ")"};
              queryList.push(eql_keyWord.fillplot + JSON.stringify(obj));
            }
          }catch(e){
            
          }
          return queryList.join("");
        },
        convertEQLToDynamic(eqlQuery: string): void{
          var _this = this;
          var widget_wizard_selectedData = this._dashboard.widget.wizard.selectedData;
          widget_wizard_selectedData.filter.EQL_query = eqlQuery || "";
          var queryAttributes: any = {dimension: [], condition: [], returnDynamic:[],orderByList: [],groupByList: [], fillPlotDetails: {}};
          try{
            eqlQuery = eqlQuery.trim();
            var eqlQuery_upper = eqlQuery.toUpperCase() + " ";
            var eql_keyWord = this.eql_keyWord;
            var eql_keyWord_list = [eql_keyWord.where, eql_keyWord.groupBy, eql_keyWord.orderBy, eql_keyWord._return, eql_keyWord.skip, eql_keyWord.limit, eql_keyWord.fillplot];
            
            var splitQuery = function(currentKeyWord: any, eql_keyWord_list: any){
              var dataData = null;
              currentKeyWord = _this._dashboard.strings.trimLeft(currentKeyWord);
              var isValid = false;
              if(currentKeyWord == ""){
                isValid = (eql_keyWord_list.filter((keyWord: string) => {
                  return eqlQuery_upper.startsWith(_this._dashboard.strings.trimLeft(keyWord));
                })[0] == null);
              }else{
                isValid = eqlQuery_upper.startsWith(currentKeyWord);
              }
              if(isValid){
                eqlQuery_upper = eqlQuery_upper.substring(currentKeyWord.length).trim();
                eqlQuery = eqlQuery.substring(currentKeyWord.length).trim();
                eql_keyWord_list.forEach((keyWord: any) =>{
                  if(dataData == null){
                    var index = eqlQuery_upper.indexOf(keyWord);
                    if(index != -1){
                      dataData = eqlQuery.substring(0, index).trim();
                      eqlQuery_upper = eqlQuery_upper.substring(index).trim();
                      eqlQuery = eqlQuery.substring(index).trim();
                    }
                  }
                });
                if(dataData == null){
                  dataData = eqlQuery;
                  eqlQuery = eqlQuery_upper = ""; 
                }
              }
              return (dataData || "").trim();
            };
            
            var eql_select = splitQuery("", eql_keyWord_list);
            eql_keyWord_list.splice(0, 1);
            
            var eql_where = splitQuery(eql_keyWord.where, eql_keyWord_list);
            eql_keyWord_list.splice(0, 1);
            
            var eql_groupBy = splitQuery(eql_keyWord.groupBy, eql_keyWord_list);
            eql_keyWord_list.splice(0, 1);
            
            var eql_orderBy = splitQuery(eql_keyWord.orderBy, eql_keyWord_list);
            eql_keyWord_list.splice(0, 1);
            
            var eql_return = splitQuery(eql_keyWord._return, eql_keyWord_list);
            eql_keyWord_list.splice(0, 1);
            
            var eql_skip = splitQuery(eql_keyWord.skip, eql_keyWord_list);
            eql_keyWord_list.splice(0, 1);

            var eql_limit = splitQuery(eql_keyWord.limit, eql_keyWord_list);
            eql_keyWord_list.splice(0, 1);
            
            var eql_filplots = splitQuery(eql_keyWord.fillplot, eql_keyWord_list);

            //Select
            eql_select.split(",").forEach((dim: any) =>{
              dim = dim.trim();
              let dim_upper = dim.toUpperCase();
              let index = dim_upper.indexOf(eql_keyWord.as);
              var dimName = dim;
              var dimAlias = "";
              if(index != -1){
                dimName = dim.substring(0, index).trim();
                dimAlias = dim.substring(index + eql_keyWord.as.length).trim();
              }
              queryAttributes.dimension.push({node: dimName, alias: dimAlias});
            });
            
            //Where
            var conditionList = [];
            var previousLogic = "";
            if(eql_where.startsWith("(")) eql_where = eql_where.replace("(", "");
            if(eql_where.endsWith(")")) eql_where = eql_where.substring(0, eql_where.length -1);
            eql_where.trim().split(" AND ").forEach((andQury: any) => { //TODO: need to handle case insensitive
              andQury = andQury.trim();
              andQury.split(" OR ").forEach((orQury: any) => { //TODO: need to handle case insensitive
                orQury = orQury.trim();
                var condObj: any = {isGrouped: false, logic: previousLogic};
                if(orQury.startsWith("(")){
                  orQury = orQury.replace("(", "");
                  condObj.isGrouped = true;
                }
                if(orQury.endsWith(")")){
                  orQury = orQury.substring(0, orQury.length -1);
                }
                var flag = false;
                ["<>", "<=", ">=", ">", "<", "!=", "=", " IN"].forEach((_cond: any) => {
                  var index = orQury.indexOf(_cond);
                  if(flag == false && index != -1){
                    flag = true;
                    condObj.operation = _cond.trim();
                    condObj.attr = orQury.substring(0, index).trim();
                    var attrValue = orQury.substring(index + _cond.length).trim();
                    if(attrValue.toUpperCase().startsWith(eql_keyWord.currentDateTime)){
                      var intervalInfo = attrValue.substring(eql_keyWord.currentDateTime.length).replace(/ /g, "");
                      condObj.interval = parseInt(intervalInfo);
                      condObj.intervalType = intervalInfo.replace((condObj.interval || ""), "").toUpperCase();
                      attrValue = eql_keyWord.currentDateTime;
                    }else if(attrValue.toUpperCase().startsWith(eql_keyWord.dateTime)){
                      var dateInfo = attrValue.substring(eql_keyWord.dateTime.length).replace("(", "").trim();
                      var splitIndex = dateInfo.indexOf(",");
                      if(splitIndex != -1){
                        condObj.attrDateKey = dateInfo.substring(0, splitIndex).trim();
                        condObj.attrDateFormat = dateInfo.substring(splitIndex).replace(/'|,/g,"").trim();
                      }else{
                        condObj.attrDateKey = dateInfo;
                      }
                      attrValue = eql_keyWord.dateTime;
                    }
                    condObj.attrValue = attrValue;
                    conditionList.push(condObj);
                  }
                });
                previousLogic = "OR";
              });
              previousLogic = "AND";
            });
            queryAttributes.condition = conditionList;
            
            //Group By
            var skipGroup = false;
            var eql_groupBy_List = eql_groupBy.split(",");
            eql_groupBy_List.forEach((groupBy: any, index: number) => {
              if(skipGroup){
                skipGroup = false;
              }else{
                groupBy = groupBy.trim();
                var groupBy_upper = groupBy.toUpperCase();
                if(groupBy_upper.indexOf("(") != -1 && groupBy_upper.startsWith(eql_keyWord.date)){
                  var previousGroupBy = groupBy.substring(4).replace("(", "").trim();
                  var format = (eql_groupBy_List[index + 1] || "").replace(")", "").replace(/'/g, "").trim();
                  queryAttributes.groupByList.push({groupby: previousGroupBy, type: eql_keyWord.date, format: format});
                  skipGroup = true;
                }else{
                  queryAttributes.groupByList.push({groupby: groupBy, type: ''});
                }								
              }
            });
            
            //OrderBy
            eql_orderBy.split(",").forEach((orderBy: any) => {
              orderBy = orderBy.trim();
              var orderBy_upper = orderBy.toUpperCase();
              var orderByKey = orderBy.trim().split(" ")[0];
              var orderByType = (orderBy_upper.indexOf(eql_keyWord.desc) != -1 ? eql_keyWord.desc : eql_keyWord.asc).trim();
              queryAttributes.orderByList.push({orderby: orderByKey, sort: orderByType});
            });
            
            //Return
            var skipReturnCount = 0;
            var eql_return_List = eql_return.split(",");
            eql_return_List.forEach((returnStr: string, index: number) =>{
              if(skipReturnCount > 0){
                skipReturnCount --;
              }else{
                returnStr = returnStr.trim();
                var returnStr_upper = returnStr.toUpperCase();
                var keyIndex = returnStr_upper.indexOf(eql_keyWord.as);
                var returnName = returnStr;
                var returnAlias = "";
                var returnAggr = "";
                var additionalInfo = "";
                if(keyIndex != -1){
                  returnName = returnStr.substring(0, keyIndex).trim();
                  returnAlias = returnStr.substring(keyIndex + eql_keyWord.as.length).trim();
                }
                if(returnStr_upper.startsWith(eql_keyWord.custom)){
                  skipReturnCount = 0;
                  var completReturnList = [];
                  while(eql_return_List.length > index){
                    var returnData = eql_return_List[index];
                    completReturnList.push(returnData);
                    if(returnData.indexOf("}") != -1){
                      break;
                    }else{
                      index ++;
                      skipReturnCount ++;											
                    }
                  }
                  returnName = completReturnList.join(",");
                  var startBracketIndex = returnName.indexOf("{");
                  returnName = returnName.substring(startBracketIndex + 1).trim();
                  
                  var closeBracketIndex = returnName.indexOf("}");
                  if(closeBracketIndex != -1){
                    additionalInfo = returnName.substring(closeBracketIndex + 1);
                    returnName = returnName.substring(0, closeBracketIndex).trim();
                    var additionalInfo_upper = additionalInfo.toUpperCase();
                    var asKeyIndex = additionalInfo_upper.indexOf(eql_keyWord.as);
                    if(asKeyIndex != -1){
                      returnAlias = additionalInfo.substring(asKeyIndex + eql_keyWord.as.length).trim();
                      additionalInfo = additionalInfo.substring(0, asKeyIndex).trim();
                    }
                  }
                  returnAggr = eql_keyWord.custom;
                }else if(returnName.indexOf("(") != -1){
                  if(returnStr_upper.startsWith(eql_keyWord.date)){
                    returnAggr = eql_keyWord.date;
                    returnName = returnName.substring(eql_keyWord.date.length).replace("(", "").trim();
                    var format_alias = additionalInfo = eql_return_List[index+1] || "";
                    
                    keyIndex = format_alias.toUpperCase().indexOf(eql_keyWord.as);
                    if(keyIndex != -1){
                      additionalInfo = format_alias.substring(0, keyIndex).trim();
                      returnAlias = format_alias.substring(keyIndex + eql_keyWord.as.length).trim();
                    }
                    additionalInfo = additionalInfo.replace(")", "").replace(/'/g, "").trim();
                    skipReturnCount = 1;
                  }else if(returnName.indexOf(")") != -1){
                    var startBracketIndex = returnName.indexOf("(");
                    returnName = returnName.substring(startBracketIndex + 1).trim();
                    
                    var closeBracketIndex = returnName.lastIndexOf(")");
                    if(closeBracketIndex != -1){
                      additionalInfo = returnName.substring(closeBracketIndex + 1).trim();
                      returnName = returnName.substring(0, closeBracketIndex).trim();
                    }
                    if(returnStr_upper.startsWith(eql_keyWord.sum)){
                      returnAggr = eql_keyWord.sum;
                    }else if(returnStr_upper.startsWith(eql_keyWord.count)){
                      returnAggr = eql_keyWord.count;
                    }else if(returnStr_upper.startsWith(eql_keyWord.avg)){
                      returnAggr = eql_keyWord.avg;
                    }
                  }
                }else{
                  var spaceIndex = returnName.indexOf(" ");
                  if(spaceIndex != -1){
                    additionalInfo = returnName.substring(spaceIndex).trim();
                    returnName = returnName.substring(0, spaceIndex).trim();
                  }
                }
                queryAttributes.returnDynamic.push({attr: returnName, aggr: returnAggr, aliasName: returnAlias, additionalInfo: additionalInfo});								
              }
            });
            
            //Skip
            queryAttributes.skip = Number(eql_skip) || "";
            
            //Limit
            queryAttributes.limit = Number(eql_limit) || "";
            
            //FillPlots
            if(eql_filplots.trim().length != 0){
              queryAttributes.fillPlotDetails.fillPlot = "true";
              queryAttributes.fillPlotDetails.fillPlotObj = {};
              var fillPlotObj = JSON.parse(eql_filplots);
              if(fillPlotObj.start.trim().length > 0 && fillPlotObj.start.startsWith(eql_keyWord.currentDateTime)){
                var intervalInfo = fillPlotObj.start.substring(eql_keyWord.currentDateTime.length).replace(/ /g, "");
                queryAttributes.fillPlotDetails.fillPlotObj.startInterval = parseInt(intervalInfo) || 0;
                queryAttributes.fillPlotDetails.fillPlotObj.startIntervalType = intervalInfo.replace((queryAttributes.fillPlotDetails.fillPlotObj.startInterval || ""), "").toUpperCase();
                queryAttributes.fillPlotDetails.fillPlotObj.start = eql_keyWord.currentDateTime;
              }else{
                var intervalInfo = fillPlotObj.start.substring(fillPlotObj.start.split(' ')[0].length).replace(/ /g, "");
                queryAttributes.fillPlotDetails.fillPlotObj.startInterval = parseInt(intervalInfo) || 0;
                queryAttributes.fillPlotDetails.fillPlotObj.startIntervalType = intervalInfo.replace((queryAttributes.fillPlotDetails.fillPlotObj.startInterval || ""), "").toUpperCase() || "";
                queryAttributes.fillPlotDetails.fillPlotObj.start = fillPlotObj.start.split(' ')[0].toUpperCase() || "";
              }
              
              if(fillPlotObj.end.trim().length > 0 && fillPlotObj.end.startsWith(eql_keyWord.currentDateTime)){
                var intervalInfo = fillPlotObj.end.substring(eql_keyWord.currentDateTime.length).replace(/ /g, "");
                queryAttributes.fillPlotDetails.fillPlotObj.endInterval = parseInt(intervalInfo) || 0;
                queryAttributes.fillPlotDetails.fillPlotObj.endIntervalType = intervalInfo.replace((queryAttributes.fillPlotDetails.fillPlotObj.endInterval || ""), "").toUpperCase();
                queryAttributes.fillPlotDetails.fillPlotObj.end = eql_keyWord.currentDateTime;
              }else{
                var intervalInfo = fillPlotObj.end.substring(fillPlotObj.end.split(' ')[0].length).replace(/ /g, "");
                queryAttributes.fillPlotDetails.fillPlotObj.endInterval = parseInt(intervalInfo) || 0;
                queryAttributes.fillPlotDetails.fillPlotObj.endIntervalType = intervalInfo.replace((queryAttributes.fillPlotDetails.fillPlotObj.endInterval || ""), "").toUpperCase() || "";
                queryAttributes.fillPlotDetails.fillPlotObj.end = fillPlotObj.end.split(' ')[0].toUpperCase() || "";
              }
              var range = fillPlotObj.range.split("(");
              queryAttributes.fillPlotDetails.fillPlotObj.plotIntervalType = range[0].trim() || "";
              var plotDateFormat = range[1] || "";
              queryAttributes.fillPlotDetails.fillPlotObj.plotAttrDateFormat = plotDateFormat.substring(0, plotDateFormat.length-1) || "";
            }else{
              queryAttributes.fillPlotDetails.fillPlot = "false";
              queryAttributes.fillPlotDetails.fillPlotObj = {startIntervalType: '', endIntervalType: '', plotIntervalType: ''};
            }
            
          }catch(e){
            
          }
          if(queryAttributes.dimension.length == 0){
            queryAttributes.dimension = [{}];
          }
          if(queryAttributes.condition.length == 0){
            queryAttributes.condition = [{operation: '', logic: '', intervalType: ''}];
          }
          var expectedLength = ((this._dashboard.chartInfo[widget_wizard_selectedData.widget.chart_type] || {}).returnObjects || []).length;
          var currentLength = queryAttributes.returnDynamic.length;
          if(currentLength < expectedLength){
            while(currentLength < expectedLength){
              queryAttributes.returnDynamic.push({aggr: ''});
              currentLength++;
            }
          }
          if(queryAttributes.orderByList.length == 0){
            queryAttributes.orderByList = [{sort: 'ASC'}];
          }
          if(queryAttributes.groupByList.length == 0){
            queryAttributes.groupByList = [{type: ''}];
          }
          widget_wizard_selectedData.filter.queryAttributes = queryAttributes;
        },
        openCustomEditor(val: any, index: number): void{
          this.queryCustomIndex = index;
          this.showCustom(val);
        },
        showCustom(data: any): void{
          $("#customEditorModal").modal("show");
          if(data){
            $("#textarea_customEditor").val(data);
          }
        },
        saveCustom(): void{
          var customData =  $("#textarea_customEditor").val() || '';
          
          var index = this.queryCustomIndex;
          var widget_wizard_selectedData = this._dashboard.widget.wizard.selectedData;
          widget_wizard_selectedData.filter.queryAttributes.returnDynamic[index].attr = customData;
          $("#customEditorModal").modal("hide");
        },
        createAlias(dimObj: any): void{
          var node = dimObj.node || "";
          var alias = dimObj.alias || "";
          if(node.length >= 3 && (alias == "")){
            dimObj.alias = node.substring(3, 0);
          }
        }
      }
    }
  }

  advanceChartConfiguration: any = {
    _dashboard: this,
    widgetName: null,
    widgetInfo: null,
    widgetInfo_clone: null,
    chartType: null,
    chartSeries: null,
    viewList: [],
    selectedView: {},
    chartObj: null,
    showAdvance: false,
    colorPickerIndex: null,
    chartSeriesColor_clone: null,
    chartConfigInfo: {},
    showList: [],
    _defaultChartConfigInfo: {
      chart: {options3d: {alpha: 0, beta: 0, depth: 20, viewDistance: 20}},
      plotOptions: {series: {depth: 10, dataLabels: {}, marker: {symbol: ""}}},
      legend: {enabled:true, align: "center", verticalAlign: "bottom", layout: "horizontal", symbolHeight: 12, symbolRadius: 6, title: {}},
      yAxis: {plotLines: [], title: {style: {}}},
      xAxis: {title: {style: {}}},
      series: {},
      title: {},
      pane: {background: {}}
    },
    sliderOption: {
      alpha: {floor: 0, ceil: 60, step: 1},
      beta: {floor: -60, ceil: 60, step: 1},
      depth: {floor: 20, ceil: 100, step: 1},
      thickness: {floor: 10, ceil: 100, step: 1},
      viewDistance: {floor: 20, ceil: 100, step: 1},
      symbolHeight: {floor: 1, ceil: 30, step: 1},
      symbolRadius: {floor: 0, ceil: 15, step: 1},
      legend_x: {floor: -50, ceil: 50, step: 1},
      legend_y: {floor: -50, ceil: 50, step: 1},
      label_rotate: {floor: 0, ceil: 360, step: 5},
      label_y: {floor: -50, ceil: 50, step: 1},
      label_distance: {floor: -150, ceil: 100, step: 1}
    },
    init(widgetName: any): void {
      var _this = this;
      this._dashboard.isAdvanceViewOpen = true;
      var _dashboard_widget = this._dashboard.widget;
      this.resetAll();
      $("#chartConfiguration").modal("show");
      this.widgetName = widgetName;
      this.widgetInfo = _dashboard_widget.widgetInfo[widgetName];
      var widgetId = this.widgetInfo.widget.id;
      this.showList = this._dashboard.chartInfo[this.widgetInfo.widget.chart_type].advanceConfig || [];	
      this.chartConfigInfo = angularMerge(JSON.parse(JSON.stringify(this._defaultChartConfigInfo)), this.widgetInfo.widget.chartInfo);
      this.chartConfigInfo.colors = this.chartConfigInfo.colors || null;
      this.chartSeriesColor_clone = this.getChartSeriesCloneMap(JSON.parse(JSON.stringify(this.chartConfigInfo.colors)));
      this.chartConfigInfo.bgColorRangeList = this.chartConfigInfo.bgColorRangeList || [];
      var chartData = _dashboard_widget.response[widgetId] || {};
      _dashboard_widget.destroyChart("renderConfiguringChart");
      this.chartSeries = chartData.series;
      
      this.validateViewList();
      
      this.widgetInfo_clone = JSON.parse(JSON.stringify(this.widgetInfo));
  
      setTimeout(() => { $("#chartConfiguration h6.card-link[aria-expanded='false']").click(); }, 0);
      setTimeout(() => { _this.chartObj = _dashboard_widget.renderChart("renderConfiguringChart", chartData, this.widgetInfo); }, 500);
  
      $(".panel-heading a, .uiSwitch").click(function(e){
        var target = e.target;
        if(target.tagName == "A"){
          if(target.classList.contains("collapsed"))
            setTimeout(function(){$(window).trigger("resize");}, 100);
        }else $(window).trigger("resize");
      });
    },
    getChartSeriesCloneMap(colorList: Array<string>): any[] {
      var seriesCloneMap = [];
      if(colorList){
        colorList.forEach((color: string) => {
          seriesCloneMap.push({data: color});
        });
      }
      return seriesCloneMap;
    },
    resetAll(): void {
      this.widgetName = null;
      this.widgetInfo = null;
      this.chartType = null;
      this.chartSeries = null;
      this.viewList = [];
      this.selectedView = {};
      this.showAdvance = false;
      this.colorPickerIndex = null;
      this.chartSeriesColor_clone = null;
    },
    validateViewList(): void {
      var _this = this;
      this.viewList = JSON.parse(JSON.stringify(this.widgetInfo.widget.viewList || []));
      if(this.viewList.length == 0){
        this.addView();
      }
      this.viewList.forEach((currentView: any) => {
        if(currentView.isDefault){
          _this.selectedView = JSON.parse(JSON.stringify(currentView));
        }
      });
    },
    addView(): void {
      this.viewList.push({
        name: (this.viewList.length == 0) ? "Default View" : ("view" + (this.viewList.length + 1)), 
        id: this._dashboard.strings.getRandomId(), 
        isDefault: (this.viewList.length == 0),
        filter: JSON.parse(JSON.stringify(this.widgetInfo.filter)),
        displayDetails: JSON.parse(JSON.stringify(this.widgetInfo.displayDetails))
      });
    },
    rerenderConfiguredAdvChart(): void {
      var widgetId = this.widgetInfo.widget.id;
      var chartData = this._dashboard.widget.response[widgetId] || {};
      var chartInfo = this.getUpdatedChartInfo();
      if (this.widgetInfo_clone.widget.chart_type == "solidgauge") {
        this.widgetInfo_clone.widget.chartInfo = JSON.parse(JSON.stringify(chartInfo));
        this.chartObj = this._dashboard.widget.renderChart("renderConfiguringChart", chartData, this.widgetInfo_clone);
      } else {
        var clonedChartInfo = JSON.parse(JSON.stringify(chartInfo));
        if (!clonedChartInfo.colors) {
          var chartOptions = Highcharts.getOptions();
          clonedChartInfo.colors = JSON.parse(JSON.stringify(chartOptions.colors));
        }
        this.chartObj.update(clonedChartInfo);	
      }
    },
    toggleSeriesColors(){
      var chartConfig = this.chartConfigInfo;
      var series = chartConfig.series.enabled;
      if(series){
        var chartOptions = Highcharts.getOptions();
        chartConfig.colors = JSON.parse(JSON.stringify(chartOptions.colors));
        this.chartSeriesColor_clone = this.getChartSeriesCloneMap(JSON.parse(JSON.stringify(chartOptions.colors)));
      } else {
        delete chartConfig.colors;
        this.chartSeriesColor_clone = null;
      }
    },
    updateChartColorSeries(): void {
      this.chartConfigInfo.colors = [];
      this.chartSeriesColor_clone.forEach((colorObj: any) => {
        this.chartConfigInfo.colors.push(colorObj.data);
      });
      this.rerenderConfiguredAdvChart();
    },
    save(): void {
      var chartInfo = JSON.parse(JSON.stringify(this.getUpdatedChartInfo()));
      delete chartInfo.plotOptions_chartType;
      if(!this.widgetInfo.isCreatedNew){
        this.widgetInfo.isModified = true;
        delete this.widgetInfo.isPartialModify;
      }
      this.widgetInfo.widget.chartInfo = chartInfo;
      this.widgetInfo.widget.viewList = JSON.parse(JSON.stringify(this.viewList));
      this._dashboard.widget.wizard.selectedData.filter.EQL_query = this.viewList[0].filter.EQL_query;
      this._dashboard.widget.render(this.widgetName);
      $("#chartConfiguration").modal("hide");
    },
    getUpdatedChartInfo(): any{
      var beforeChartRender = this._dashboard.chartInfo[this.widgetInfo.widget.chart_type].beforeChartRender;
      if(beforeChartRender){
        try{beforeChartRender(JSON.parse(JSON.stringify(this.chartConfigInfo)), this.widgetInfo, this.chartSeries);}catch(e){}
      }
      return this.chartConfigInfo;
    },
    btnGroupToggleChangeValue(currentObject: any, objKey: string, objValue: string){
      if((currentObject[objKey] || '') !== objValue){
        currentObject[objKey] = objValue;
        this.rerenderConfiguredAdvChart();
      }
    },
    sliderChangeValue(params: any){
      if(params.oldValue !== params.newValue) this.rerenderConfiguredAdvChart();
    },
    editView(currentView: any, event: any): void {
      var _this = this;
      if(!_this.showAdvance) event.stopPropagation();
      Object.keys(this._dashboard.widget.wizard.selectedData.filter).forEach(function(key){
        delete _this._dashboard.widget.wizard.selectedData.filter[key];
      });
      if(currentView.isDefault == true){
        currentView.filter.EQL_query = this.widgetInfo.filter.EQL_query;
        this._dashboard.widget.wizard.selectedData.filter = angularMerge(this._dashboard.widget.wizard.selectedData.filter, currentView.filter);
      }
      this._dashboard.widget.wizard.selectedData.widget.chart_type = this.widgetInfo.widget.chart_type;
      this._dashboard.widget.wizard.selectedData.filter.type = "Build Query";
      this._dashboard.widget.wizard.queryBuilder.convertEQLToDynamic(currentView.filter.EQL_query || "");
      this.selectedView = JSON.parse(JSON.stringify(currentView));
      setTimeout(function(){
        _this.showAdvance = true;
      }, 0);
    },
    cancelEditView(): void {
      this.renderView(this.selectedView);
    },
    deleteView(currentView: any, index: number, event: any){
      event.stopPropagation();
      if(this.selectedView && this.selectedView.id == currentView.id){
        this.selectedView = this.viewList.find((view: any) => {
          return view.isDefault;
        });
      }
      this.viewList.splice(index, 1);
      this.renderView(this.selectedView);
    },
    toggleView(currentView: any): void {
      this.renderView(currentView)
    },
    renderView(currentView: any){
      var _this = this;
      this.selectedView = null;
      this.showAdvance = false;
      this.selectedView = currentView;
      if(currentView == null){
        this.viewList.forEach(function(view: any){
          if(view.isDefault){
            _this.selectedView = JSON.parse(JSON.stringify(view));
          }
        });
      }
      var widgetInfo_clone = JSON.parse(JSON.stringify(this.widgetInfo));

      this._dashboard.loadingWidget.show("#renderConfiguringChart");
      let reqObj = { widget: widgetInfo_clone.widget, filter: currentView.filter, appName: this._dashboard.appName };
      _this._dashboard.apiService.invokePlatformServiceApi('/dashboardAdmin/getWidgetData', 'POST', reqObj).subscribe(
        (res: any) => {
          var _resp = res.body || {};
          if (_resp.status == "SUCCESS") {
            _this.chartObj = _this._dashboard.widget.renderChart("renderConfiguringChart", _resp, widgetInfo_clone);
          } else {
            var widgetErrorMsg = _resp.error;
            $("#renderConfiguringChart")[0].innerHTML = "<div align='center' style='color:aqua;background-color: #dd5826; margin: 50px 15px;'>" + widgetErrorMsg + "</div>";
          }
          this._dashboard.loadingWidget.hide("#renderConfiguringChart");
        },
        (err: any) => {
          this._dashboard.loadingWidget.hide("#renderConfiguringChart");
          _this._dashboard.toastr.error((_this._dashboard.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
          
        }
      );
    },
    saveView(): void {
      var id = this.selectedView.id;
      var currentIndex = null;
      (this.viewList).filter((viewObj: any, index: number) => {
        if(viewObj.id == id){
          currentIndex = index;
        };
      });
      if(this._dashboard.widget.wizard.selectedData.filter.type == "Build Query"){
        this._dashboard.widget.wizard.selectedData.filter.EQL_query = this._dashboard.widget.wizard.queryBuilder.buildEqlQuery();
      }
      this.selectedView.filter = {
        type: this._dashboard.widget.wizard.selectedData.filter.type,
        EQL_query: this._dashboard.widget.wizard.selectedData.filter.EQL_query,
      }
      this.viewList[currentIndex] = JSON.parse(JSON.stringify(this.selectedView));
      this.renderView(this.selectedView);
      if(currentIndex == 0){
        var widgetName = this.widgetName;
        this._dashboard.currentDasboardInfo.widgetInfo[widgetName].filter.EQL_query = this._dashboard.widget.wizard.selectedData.filter.EQL_query;
      }
    }
  }

  databaseInfo: any = {
    _dashboard: this,
    dbConfig: {},
    showCreateOrEditView: false,
    init: function(){
      this.showCreateOrEditView = false;
      this._dashboard.apiService.invokePlatformApi('/' + this._dashboard.appName + '/Dimensions/dataSources', 'GET').subscribe(
        (response: any) => {
          (response.body || []).forEach((dbInfo: any) => {
            var dbConfig = JSON.parse(dbInfo.dataSourceInfo);
            this.dbConfig[dbConfig.dataSourceId] = dbConfig;
          });
        },
        (err: any) => {
          this.toastr.error((this._dashboard.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
          
        }
      );
    }
  }

  themeInfo: any = {
    _dashboard: this,
    isNew: false,
    themeName: null,
    backgroundTheme: null,
    widgetName: null,
    fontSize: [],
    themeList: [],
    widgetNameList: [],
    theme: {},
    theme_edit: {},
    widgetInfo: null,
    chartObj: null,
    themeColors_clone: null,
    chartLegendStyleDefault: {itemStyle: {fontSize: '', fontFamily: '', textTransform: ''}, itemHoverStyle: {fontSize: '', fontFamily: '', textTransform: ''}},
    chartLabelDefault: {style: {fontSize: '', fontFamily: '', textTransform: ''}},
    chartAxisDefault: {labels: {style: {fontSize: '', fontFamily: '', textTransform: ''}}, title: {style: {fontSize: '', fontFamily: '', textTransform: ''}}},
    fontFamily: ["Arial","Arial Black","Arial Narrow","Century Gothic","Copperplate Gothic Light","Courier New","Georgia","Gill Sans","Helvetica Neue","Impact","Lucida Console","Lucida Sans Unicode","Nunito, sans-serif","Palatino Linotype","Raleway","Tahoma","Times New Roman","Trebuchet MS","Verdana"],
    defaultHighChartTheme: $.extend(true, {}, Highcharts.getOptions(), {}),
    init(): void {
      var _this: any = this;
      Highcharts.wrap(Highcharts.Chart.prototype, "getContainer", function (proceed: any) {
        proceed.call(this);
        this.container.style.background = _this.backgroundTheme;
      });
      this.get();
      for(var i=10; i<=40; i++){
        let value: string = i + "px";
        this.fontSize.push(value);
      }
    },
    get(callback?: any): void {
      var _this = this;
      this._dashboard.apiService.invokePlatformServiceApi('/' + (this._dashboard.hasDashboardAdminAccess? 'dashboardAdmin' : 'dashboard') + '/themes', 'GET').subscribe(
        (response: any) => {
          _this.themeList = [];
          (response.body || []).forEach(function(obj: any){
            if(typeof(obj.themeInfo) == "string") obj.themeInfo = JSON.parse(obj.themeInfo);
            _this.themeList.push(obj);
          });
          if(callback) callback();
        },
        (err: any) => {
          this._dashboard.toastr.error((this._dashboard.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
          
        }
      );
    },
    resetTheme(): void{
      var defaultOptions: any = Highcharts.getOptions();
      Object.keys(defaultOptions).forEach((key: any) => {
        if (typeof defaultOptions[key] !== "function") delete defaultOptions[key];
      });
      this.backgroundTheme = null;
      Highcharts.setOptions(this.defaultHighChartTheme);
    },
    applyTheme(): void{
      this.resetTheme();
      this.getCurrentDashboardInfoChartTheme();
      var themeId: string = this._dashboard.currentDasboardInfo.chartTheme || 1;
      var themeObj: any = this.themeList.filter((theme: any) => {
        return theme.id == themeId;
      })[0];
      $("body").removeClass("theme_Default theme_Grid_Layout theme_Dark_Unica theme_Sand_Signika");
      if(themeObj){
        if(themeObj.isDefault){
          $("body").addClass("theme_" + themeObj.name.replace(" ", "_"));
        }
        Highcharts.setOptions(themeObj.themeInfo);
        if(themeObj.name == "Sand Signika"){
          this.backgroundTheme = "url("+ sand_url +")";
        }
      }
    },
    getCurrentDashboardInfoChartTheme(): void{
      var selectedTheme: any = this._dashboard.currentDasboardInfo.chartTheme || "";
      if(selectedTheme){
        var themeObj: any = this.themeList.find((theme: any) => {
          return theme.id == selectedTheme;
        });
        if(!themeObj) this._dashboard.currentDasboardInfo.chartTheme = 1;
      }
    },
    createNew: function(){
      var _defaultTheme = this.defaultHighChartTheme;
      var theme = {
        colors: _defaultTheme.colors,
        chart: {
          backgroundColor: _defaultTheme.chart.backgroundColor
        },
        tooltip: {backgroundColor: _defaultTheme.tooltip.backgroundColor},
        legend: {backgroundColor: _defaultTheme.legend.backgroundColor}
      };
      this.showWizard(true, JSON.parse(JSON.stringify(theme)), null);
    },
    clone(theme: any): void{
      this.showWizard(true, JSON.parse(JSON.stringify(theme.themeInfo)), null);
    },
    edit(theme: any): void{
      this.theme_edit = JSON.parse(JSON.stringify(theme));
      this.showWizard(false, this.theme_edit.themeInfo, this.theme_edit.name);
    },
    showWizard(isNew: boolean, theme: any, themeName: string): void{
      this.isNew = isNew || false;
      this.resetTheme();
      this.themeName = themeName;
      var _this = this;
      this.widgetName = null;

      if(theme && theme.chart && theme.chart.backgroundColor && typeof(theme.chart.backgroundColor) == "object"){
        theme.chart.backgroundColor = theme.chart.backgroundColor.stops[0][1];
      }
      
      this.theme = theme;

      //Initialize default values to the theme DOM
      this.theme.title = angularMerge(JSON.parse(JSON.stringify(this.chartLabelDefault)), this.theme.title || {});
      this.theme.subtitle = angularMerge(JSON.parse(JSON.stringify(this.chartLabelDefault)), this.theme.subtitle || {});
      this.theme.tooltip = angularMerge(JSON.parse(JSON.stringify(this.chartLabelDefault)), this.theme.tooltip || {});
      this.theme.xAxis = angularMerge(JSON.parse(JSON.stringify(this.chartAxisDefault)), this.theme.xAxis || {});
      this.theme.yAxis = angularMerge(JSON.parse(JSON.stringify(this.chartAxisDefault)), this.theme.yAxis || {});
      this.theme.legend = angularMerge(JSON.parse(JSON.stringify(this.chartLegendStyleDefault)), this.theme.legend || {});
      this.themeColors_clone = this.getChartSeriesCloneMap(JSON.parse(JSON.stringify(this.theme.colors)));

      this.widgetNameList = [];
      var _widgetInfo = this._dashboard.widget.widgetInfo;
      Object.keys(_widgetInfo).forEach(function(widgetName){
        if(_widgetInfo[widgetName].widget.type == "chart"){
          if(_this.widgetName == null) 
            _this.widgetName = widgetName;
          var widgetTitle=_widgetInfo[widgetName].displayDetails.title;
          _this.widgetNameList.push({widgetName: widgetName, widgetTitle: widgetTitle});
        }
      });
      if(this.widgetName != null){
        $("#chartCustomizeTheme").modal("show");

        setTimeout(() => { $("#chartCustomizeTheme h6.card-link[aria-expanded='false']").click(); }, 0);
        setTimeout(() => { _this.renderChart(); }, 500);

      }else{
        this._dashboard.toastr.error('There is no chart in Dashboard..!!');
      }
    },
    getChartSeriesCloneMap(colorList: Array<string>): any[] {
      var seriesCloneMap = [];
      if(colorList){
        colorList.forEach((color: string) => {
          seriesCloneMap.push({data: color});
        });
      }
      return seriesCloneMap;
    },
    updateChartColorSeries(): void {
      this.theme.colors = [];
      this.themeColors_clone.forEach((colorObj: any) => {
        this.theme.colors.push(colorObj.data);
      });
      this.updateChartThemeToPreview();
    },
    closeWizard(): void{
      this.applyTheme();
      $("#chartCustomizeTheme").modal("hide");
    },
    renderChart(): void{
      this.widgetInfo = this._dashboard.widget.widgetInfo[this.widgetName];
      var widgetId = this.widgetInfo.widget.id;
      var chartData = this._dashboard.widget.response[widgetId];
      this.chartObj = this._dashboard.widget.renderChart("renderChart_theme", chartData, this.widgetInfo);
      this.updateChartThemeToPreview();
    },
    updateChartThemeToPreview(): void {
      this.chartObj.update(this.theme);
    }
  };
}

function getParentWidgetObject(query: any, target: any){ //Prototype to get the parent widget object
	var parentObj = target.parentNode;
	while(parentObj != null){
		if(parentObj.matches(query)) break;
		parentObj = parentObj.parentNode;
		if(parentObj.matches("body") == true)
			parentObj = null;
	}
	return parentObj;
}

function isMergeableObject(val: any) {
  let nonNullObject: boolean = (val && typeof val === 'object');

  return nonNullObject
    && Object.prototype.toString.call(val) !== '[object RegExp]'
    && Object.prototype.toString.call(val) !== '[object Date]';
}

function emptyTarget(val: any) {
  return Array.isArray(val) ? [] : {};
}

function cloneIfNecessary(value: any, optionsArgument: any) {
  let clone: boolean = (optionsArgument && optionsArgument.clone === true);
  return (clone && isMergeableObject(value)) ? angularMerge(emptyTarget(value), value, optionsArgument) : value;
}

function defaultArrayMerge(target: any, source: any, optionsArgument: any) {
  var destination: any = target.slice();
  source.forEach( (e: any, i: number) => {
    if (typeof destination[i] === 'undefined') {
      destination[i] = cloneIfNecessary(e, optionsArgument);
    } else if (isMergeableObject(e)) {
      destination[i] = angularMerge(target[i], e, optionsArgument);
    } else if (target.indexOf(e) === -1) {
      destination.push(cloneIfNecessary(e, optionsArgument));
    }
  })
  return destination;
}

function mergeObject(target: any, source: any, optionsArgument: any) {
  var destination: any = {}
  if (isMergeableObject(target)) {
    Object.keys(target).forEach( (key: string) => {
      destination[key] = cloneIfNecessary(target[key], optionsArgument);
    });
  }
  Object.keys(source).forEach( (key: any) => {
    if (!isMergeableObject(source[key]) || !target[key]) {
      destination[key] = cloneIfNecessary(source[key], optionsArgument)
    } else {
      destination[key] = angularMerge(target[key], source[key], optionsArgument)
    }
  });
  return destination;
}

function angularMerge(target: any, source: any, optionsArgument?: any){
  var array: boolean = Array.isArray(source);
  var options: any = optionsArgument || { arrayMerge: defaultArrayMerge };
  var arrayMerge: any = options.arrayMerge || defaultArrayMerge;

  if (array) {
    return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument);
  } else {
    return mergeObject(target, source, optionsArgument);
  }
}