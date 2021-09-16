import { Injectable } from '@angular/core';
import { ReportsService } from './reports.service';
import { StringUtilService } from './stringUtil.service';
import * as Highcharts from 'highcharts';
declare var $: any;

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

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
export class ChartsService {
  //Localreference
  highChartRef: any = null;

  constructor( private reports: ReportsService, private strings: StringUtilService ) { }

  //Static Data
  defaultChartInfo: any = {
    "column": {
      name: "Float Bar",
      img: "", //TODO:
      additionalInfo: {
        category: "2-Dimension",
        chart: {
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
      returnObjects: ["xAxis", "yAxis", "series"],
      advanceConfig: ["3D", "3D-Depth", "3D-Thickness", "3D-ViewDistance", "Legend", "LegendRadius", "Advance", "Label", "Label-YPosition", "Series", "Zoom", "X-Axis-Type", "Y-Axis-Type", "Views"]
    },
    "bar": {
      name: "Horizontal Bar",
      img: "", //TODO:
      additionalInfo: {
        category: "2-Dimension",
        chart: { type: "bar" }
      },
      isFillPlotOptionRequired: true,
      displayFieldList: ["title", "xAxisName", "yAxisName"],
      returnObjects: ["xAxis", "yAxis", "series"],
      advanceConfig: ["3D", "3D-Depth", "3D-Thickness", "3D-ViewDistance", "Legend", "LegendRadius", "Advance", "Label", "Label-YPosition", "Series", "Zoom", "X-Axis-Type", "Y-Axis-Type"]
    },
    "pie": {
      name: "Pie",
      img: "", //TODO:
      additionalInfo: {
        category: "1-Dimension",
        chart: { type: "pie" },
        plotOptions: {
          series: { allowPointSelect: true, cursor: "pointer", dataLabels: { enabled: false }, showInLegend: true }
        }
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title"],
      returnObjects: ["series", "count"],
      advanceConfig: ["3D", "3D-Thickness", "Legend", "LegendRadius", "Advance", "Label"]
    },
    "donut": {
      name: "Donut",
      img: "", //TODO:
      additionalInfo: {
        category: "1-Dimension",
        chart: { type: "pie" },
        plotOptions: {
          series: { innerSize: "60%", dataLabels: { enabled: false }, showInLegend: true }
        }
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title"],
      returnObjects: ["series", "count"],
      advanceConfig: ["3D", "3D-Thickness", "Legend", "LegendRadius", "Advance", "Label"]
    },
    "line": {
      name: "Line",
      img: "", //TODO:
      additionalInfo: {
        category: "2-Dimension",
        chart: { type: "line" }
      },
      beforeChartRender: (chartObj: any, widgetInfo: any) => {
        chartObj.chart = chartObj.chart || {};
        chartObj.chart.type = chartObj.chart.type_ref == "spline" ? "spline" : "line";
        if (chartObj.xAxis && chartObj.xAxis.type == "datetime") {
          chartObj.xAxis.categories.forEach( (xAxis: any, index: number) => {
            let date: any = new Date(xAxis);
            if (date == "Invalid Date") {
              date = xAxis;
            } else {
              date = date.getTime()
            }
            chartObj.series.forEach( (series: any) => {
              series.data[index] = [date, series.data[index]];
            });
          });
        }
      },
      isFillPlotOptionRequired: true,
      displayFieldList: ["title", "xAxisName", "yAxisName"],
      returnObjects: ["xAxis", "yAxis", "series"],
      advanceConfig: ["Legend", "Advance", "Label", "Label-YPosition", "LineType", "Zoom", "X-Axis-Type", "Y-Axis-Type", "Plot-Symbol"]
    },
    "bubble": {
      name: "Bubble",
      img: "", //TODO:
      additionalInfo: {
        category: "3-Dimension",
        chart: {
          type: "bubble",
          zoomType: "xy",
        },
        plotOptions: {
          series: { dataLabels: { enabled: true, format: "{point.name}" } }
        },
        legend: { enabled: false }
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title", "xAxisName", "yAxisName"],
      returnObjects: ["xAxis", "yAxis", "zAxis", "data1", "data2"],
    },
    "gauge": {
      name: "Gauge",
      img: "", //TODO:
      additionalInfo: {
        category: "Gauge",
        chart: {
          type: "gauge"
        },
        pane: { startAngle: -150, endAngle: 150 },
      },
      beforeChartRender: (chartObj: any, widgetInfo: any) => {
        var gaugeValue: any = chartObj.series[0].data[0];
        chartObj.yAxis.min = 0;
        chartObj.yAxis.max = Math.ceil(gaugeValue / 100) * 100;
        var percentage = chartObj.yAxis.max / 100;
        chartObj.yAxis.plotBands = [
          { from: chartObj.yAxis.min, to: percentage * 60, color: '#55BF3B' },
          { from: percentage * 60, to: percentage * 80, color: '#DDDF0D' },
          { from: percentage * 80, to: percentage * 100, color: '#DF5353' }
        ];
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title"],
      returnObjects: ["count"],
    },
    "solidgauge": {
      name: "Solid Gauge",
      img: "", //TODO:
      additionalInfo: {
        category: "Gauge",
        chart: {
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
      beforeChartRender: (chartObj: any, widgetInfo: any, series: any) => {
        try {
          var gaugeValue: any = (chartObj.series || series)[0].data[0];
          chartObj.yAxis.min = 0;
          chartObj.yAxis.max = Math.ceil(gaugeValue / 100) * 100;
          var flag: boolean = true;
          (chartObj.bgColorRangeList || []).forEach( (bgInfo: any) => {
            var cond: string = bgInfo.cond || "";
            var value1: string = bgInfo.value1 || "";
            var value2: string = bgInfo.value2 || "";
            var bgColor: string = bgInfo.bgColor || "";
            if (flag && cond != "" && value1 != "" && bgColor != "") {
              if (cond == "Between") {
                if (gaugeValue >= value1 && gaugeValue <= value2) {
                  chartObj.yAxis.stops = [[1, bgColor]];
                  flag = false;
                }
              } else {
                if (eval(gaugeValue + " " + cond + " " + value1)) {
                  chartObj.yAxis.stops = [[1, bgColor]];
                  flag = false;
                }
              }
            }
          });
          delete chartObj.bgColorRangeList;
        } catch (e) {
          
        }
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title"],
      returnObjects: ["count"],
      advanceConfig: ["BackgroundAndSeriesRange", "pane-Background", "Range-Selection", "Advance", "Chart-Position", "Views"]
    },
    "candlestick": {
      name: "Candlestick",
      img: "", //TODO:
      additionalInfo: {
        category: "Candlestick",
        xAxis: {
          type: "datetime"
        },
        legend: { enabled: false }
      },
      beforeChartRender: (chartObj: any, widgetInfo: any) => {
        chartObj.series[0].type = "candlestick";
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title", "xAxisName", "yAxisName"],
      returnObjects: ["xAxis", "data1", "data2", "data3", "data4"],
    },
    "funnel": {
      name: "Funnel",
      img: "", //TODO:
      additionalInfo: {
        category: "1-Dimension",
        /*plotOptions: {
          series: {neckWidth: "50%", neckHeight: "25%"}
        }*/
        chart: {
          type: "funnel",
          marginRight: 100,
        },
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title"],
      returnObjects: ["count", "series"],
    },
    "area": {
      name: "area",
      img: "", //TODO:
      additionalInfo: {
        category: "2-Dimension",
        chart: {
          type: "area",
        },
        plotOptions: {
          series: {
            pointPadding: 0, // Defaults to 0.1
            groupPadding: 0.05// Defaults to 0.2
          }
        },
      },
      beforeChartRender: (chartObj: any, widgetInfo: any) => {
        chartObj.chart = chartObj.chart || {};
        chartObj.chart.type = chartObj.chart.type_ref == "spline" ? "areaspline" : "area";
      },
      isFillPlotOptionRequired: true,
      displayFieldList: ["title", "xAxisName", "yAxisName"],
      returnObjects: ["xAxis", "yAxis", "series"],
      advanceConfig: ["Legend", "LegendRadius", "Advance", "Label", "Label-YPosition", "Series", "LineType", "Zoom", "X-Axis-Type", "Plot-Symbol"]
    },
    "scatter": {
      name: "scatter",
      img: "", //TODO:
      additionalInfo: {
        category: "3-Dimension",
        chart: {
          type: "scatter",
          zoomType: "xy",
        },
        plotOptions: {
          series: { dataLabels: { enabled: true, format: "{point.name}" } }
        },
        legend: { enabled: false }
      },
      isFillPlotOptionRequired: false,
      displayFieldList: ["title", "xAxisName", "yAxisName"],
      returnObjects: ["xAxis", "yAxis", "zAxis", "data1", "data2"],
    }
  }

  renderChart(params: any, callback: any) {
    var chartType: string = params.chartData.chartInfo.widget.chartInfo.chart.type;
    var _widgetInfo: any = {
      widget: {
        chart_type: chartType,
        chartInfo: this.defaultChartInfo[chartType].additionalInfo
      },
      displayDetails: params.chartData.chartInfo.displayDetails || {}
    };

    var widgetInfo: any = JSON.parse(JSON.stringify(_widgetInfo));
    var displayDetails: any = widgetInfo.displayDetails;
    var currentChartObj: any = {
      credits: { enabled: false },
      series: params.chartData.series,
      exporting: { enabled: false },
      chart: {}, title: { text: "" }, subtitle: {}, xAxis: {}, yAxis: {}, plotOptions: {}, legend: { itemStyle: {} }
    };
    if (params.chartData.xAxis) currentChartObj.xAxis.categories = params.chartData.xAxis;
    if (displayDetails.title) currentChartObj.title.text = displayDetails.title;
    if (displayDetails.subTitle) currentChartObj.subtitle.text = displayDetails.subTitle;
    if (displayDetails.xAxisName) currentChartObj.xAxis.title = { text: displayDetails.xAxisName };
    if (displayDetails.yAxisName) currentChartObj.yAxis.title = { text: displayDetails.yAxisName };
    if (displayDetails.xAxisOpposite) currentChartObj.xAxis.opposite = displayDetails.xAxisOpposite;
    if (displayDetails.xAxisGridLineWidth) currentChartObj.xAxis.gridLineWidth = displayDetails.xAxisGridLineWidth;
    if (displayDetails.yAxisObj) currentChartObj.yAxis = displayDetails.yAxisObj;

    currentChartObj.yAxis = [currentChartObj.yAxis];
    if (params.chartData.displayDetails && params.chartData.displayDetails.selectedSecondaryChart) {
      currentChartObj.yAxis.push({ title: { text: params.chartData.displayDetails.secYAxisName || "" }, opposite: true });
    }
    if (params.chartData.chartInfo && params.chartData.chartInfo.secondaryChart) {
      currentChartObj.yAxis.push({ title: { text: params.chartData.chartInfo.secondaryChart.yAxisName || "" }, opposite: true });
    }
    
    if(!(params.chartData || {}).customizedChartOptions) this.updateAdvanceChartProperties(params.chartData, currentChartObj);
    currentChartObj = angularMerge(currentChartObj, widgetInfo.widget.chartInfo || {});

    //update chart line type for primary axis (only if line chart)
    if (currentChartObj.chart.type == "line" && (((params.chartData.chartGraphContent && params.chartData.chartGraphContent.primarYAxis) || {}).type_ref || "line") == "spline") {
      currentChartObj.chart.type_ref = "spline";
    }
    var beforeChartRender = this.defaultChartInfo[widgetInfo.widget.chart_type].beforeChartRender;
    if (beforeChartRender) {
      try { beforeChartRender(currentChartObj, widgetInfo); } catch (e) { }
    }
    //update chart line type for secondary axis (only if line chart)
    if ((((params.chartData.chartGraphContent && params.chartData.chartGraphContent.secYAxis) || {}).type_ref || "line") == "spline") {
      currentChartObj.series.forEach((seriesObj: any) => {
        if (seriesObj.type && seriesObj.type == "line") {
          seriesObj.type = "spline";
        }
      });
    }

    //currentChartObj.legend.itemStyle.width = domObj.width() - 20;
    //currentChartObj.chart.height = domObj.height();
    var domRect = params.domObj.getBoundingClientRect();
    currentChartObj.legend.itemStyle.width = domRect.width - 20;
    currentChartObj.chart.height = domRect.height;

    currentChartObj.series.forEach((seriesObj: any) => {
      (seriesObj.data || []).forEach((value: any, index: number) => {
        if (!isNaN(value)) {
          seriesObj.data[index] = Number(value);
        } else {
          seriesObj.data[index] = null;
        }
      });
    });

    currentChartObj = this.executeCustomChartObjectScript(currentChartObj, params);

    if (params.needImageContent) { //Stop Animation
      currentChartObj.plotOptions = currentChartObj.plotOptions || {};
      currentChartObj.plotOptions.series = currentChartObj.plotOptions.series || {};
      currentChartObj.plotOptions.series.animation = false;
    }

    this.highChartRef = Highcharts.chart(params.domObj, currentChartObj, (chart: any) => {
      if (currentChartObj.customizeLegendFunction) {
        currentChartObj.customizeLegendFunction(chart);
      }
    });

    callback();
  }

  executeCustomChartObjectScript(currentChartObj: any, params: any) {
    var chartGraphContent = params.chartData.chartGraphContent;
    if (chartGraphContent && chartGraphContent.hasOwnProperty("customChartObjectScript")) {
      try {
        var currentStep = chartGraphContent.customChartObjectScript.selectedStep;
        if (currentStep.scriptType == "JavaScript") {
          var language = "";
          if (sessionStorage.userDetails) {
            language = JSON.parse(sessionStorage.userDetails).language;
          }
          currentChartObj = eval('(function execute(chartObject, userValueList, sectionObject, lang){' + currentStep.script + '})')(currentChartObj, params.userValueList, params.sectionObject, language);
        }
      } catch (e) {
        
      }
    }
    return currentChartObj;
  }

  updateAdvanceChartProperties(resp: any, chartObj: any){
    var chartGraphContent: any = JSON.parse(JSON.stringify(resp.chartGraphContent)) || {};
    
    //update chart title
    if(chartGraphContent.title){
      chartObj.title = angularMerge(chartObj.title, chartGraphContent.title);
    }
    //Update chart series color
    if(!chartGraphContent.colors){
      var chartOptions = Highcharts.getOptions();
      chartObj.colors = JSON.parse(JSON.stringify(chartOptions.colors));
    }else{
      chartObj.colors = chartGraphContent.colors;
    }
    
    //Update chart plot lines, XAxis, YAxis properties
    if(chartGraphContent.XAxis){
      chartObj.xAxis = angularMerge(chartObj.xAxis, chartGraphContent.XAxis);
    }
    //update xAxis label formating
    chartGraphContent.XAxis = chartGraphContent.XAxis || {};
    this.updateAxisLabelsPrefixSuffix(chartGraphContent.XAxis, chartObj.xAxis);
    
    var yAxis: any = chartObj.yAxis;
    var primaryYaxis: any = yAxis[0];
    var secondaryYaxis: any = yAxis[1];
    var primaryYAxisObj: any = chartGraphContent.primarYAxis || {};
    var secYAxisObj: any = chartGraphContent.secYAxis || {};
    var plotLineSeriesList: any[] = [];
    (chartGraphContent.plotLines || []).forEach((line: any) => {
      if(primaryYaxis && line.lineFor == "primary"){
        primaryYaxis.plotLines = primaryYaxis.plotLines || [];
        primaryYaxis.plotLines.push(line);
      }else if(secondaryYaxis && line.lineFor == "secondary"){
        secondaryYaxis.plotLines = secondaryYaxis.plotLines || [];
        secondaryYaxis.plotLines.push(line);
      }
      if(chartGraphContent.showPlotLineInLegend){
        line.id = this.strings.getRandomId();
        plotLineSeriesList.push({
           color: line.color,
           name: line.label.text,
           marker: {enabled: false},
           events: {
             legendItemClick: function(e: any) {
               var selectedYaxis = line.lineFor == "primary" ? this.chart.yAxis[0] : this.chart.yAxis[1];
               if(this.visible) selectedYaxis.removePlotLine(line.id);
               else selectedYaxis.addPlotLine(line);
             }
           }
        });
        delete line.label;
      }
    });
    if(chartGraphContent.showPlotLineInLegend && plotLineSeriesList.length > 0){
      var plotLineTitle: string = chartGraphContent.plotLineTitle || "";
      if(plotLineTitle != ""){
        plotLineSeriesList.unshift({
          name: chartGraphContent.plotLineTitle,
          marker: {enabled: false}
        });
        var seriesIndex = chartObj.series.length;
        chartObj.customizeLegendFunction = (chart: any) => {
          var series = chart.series[seriesIndex];
          if(series){
            var legendItem = series.legendItem.element;
            legendItem.setAttribute("x", "0");
            legendItem.onclick = function(event){
              event.stopPropagation();
            };
            if (series.legendSymbol) series.legendSymbol.destroy();
            if (series.legendLine) series.legendLine.destroy();
          }
        }
      }
      chartObj.series = chartObj.series.concat(plotLineSeriesList);
    }
    
    //Update Primary Y Axis
    primaryYaxis.type = primaryYAxisObj.type || "";
    primaryYaxis.minorTickInterval = primaryYAxisObj.minorTickInterval || "";
    if(primaryYAxisObj.min && primaryYAxisObj.min != null && primaryYAxisObj.min != ""){
      primaryYaxis.min = primaryYAxisObj.min;
    }
    if(primaryYAxisObj.max && primaryYAxisObj.max != null && primaryYAxisObj.max != ""){
      primaryYaxis.max = primaryYAxisObj.max;
    }
    if(primaryYAxisObj.title){
      primaryYaxis.title = angularMerge(primaryYaxis.title, primaryYAxisObj.title);
    }
    if(primaryYAxisObj.tickInterval){
      primaryYaxis.tickInterval = primaryYAxisObj.tickInterval;
    }
    if(primaryYAxisObj.lineWidth){
      primaryYaxis.lineWidth = primaryYAxisObj.lineWidth;
    }
    //update primary yAxis label formating
    this.updateAxisLabelsPrefixSuffix(primaryYAxisObj, primaryYaxis);
    
    //Update Secondary Y Axis
    if(secondaryYaxis){
      secondaryYaxis.type = secYAxisObj.type || "";
      secondaryYaxis.minorTickInterval = secYAxisObj.minorTickInterval || "";
      if(secYAxisObj.min && secYAxisObj.min != null && secYAxisObj.min != ""){
        secondaryYaxis.min = secYAxisObj.min;
      }
      if(secYAxisObj.max && secYAxisObj.max != null && secYAxisObj.max != ""){
        secondaryYaxis.max = secYAxisObj.max;
      }
      if(secYAxisObj.title){
        secondaryYaxis.title = angularMerge(secondaryYaxis.title, secYAxisObj.title);
      }
      if(secYAxisObj.tickInterval){
        secondaryYaxis.tickInterval = secYAxisObj.tickInterval;
      }
      if(secYAxisObj.lineWidth){
        secondaryYaxis.lineWidth = secYAxisObj.lineWidth;
      }
      //update primary yAxis label formating
      this.updateAxisLabelsPrefixSuffix(secYAxisObj, secondaryYaxis);
    }
    
    //update chart legend
    var respLegend: any = chartGraphContent.legend;
    if(respLegend){
      chartObj.legend = angularMerge(chartObj.legend, respLegend);
    }else{
      chartObj.legend = {itemStyle: {}};
    }
    
    //update chart 3d config
    var respChart3DOpt = chartGraphContent.chart;
    if(respChart3DOpt){
      chartObj.chart = angularMerge(chartObj.chart, respChart3DOpt);
    }else{
      chartObj.chart = {};
    }
    
    //update plotOption series
    var respPlotOptions = chartGraphContent.plotOptions;
    if(respPlotOptions){
      chartObj.plotOptions = angularMerge(chartObj.plotOptions, respPlotOptions);
    }else{
      chartObj.plotOptions = {};
    }
    
  }

  updateAxisLabelsPrefixSuffix(reqChartAxisObj: any, chartAxisObj: any){
    var prefix: string, suffix: string, format: string;
    if(reqChartAxisObj.prefix || reqChartAxisObj.suffix){
      prefix = reqChartAxisObj.prefix || '';
      suffix = reqChartAxisObj.suffix || '';
      format = prefix + '{value}' + suffix;
      chartAxisObj.labels = chartAxisObj.labels || {};
      chartAxisObj.labels.format = format;
      //delete chartAxisObj.prefix;
      //delete chartAxisObj.suffix;
    }
  }

  updateGraphSectionObject(sectionObj: any){
    var graphContent: any = sectionObj.graphContent;
    var chartJson = {"xAxis": [],"series": []};
    graphContent.chartGraphContent = sectionObj.chartGraphContent = sectionObj.chartGraphContent || {};
    var chartInfo =  JSON.parse(JSON.stringify((this.reports.chartInfo).find( (chObj: any) => {
      return chObj.name == graphContent.name;
    }) || {}));
    if(sectionObj.displayFields){
      var mapType = sectionObj.displayFields[0].mapping;
      (sectionObj.displayFields).forEach((axisObj: any, index: number) => {
        if(axisObj.type == "calculatedData"){
          chartJson.xAxis.push(axisObj.name);
        }
      });
      (sectionObj.records || []).forEach((recObj: any) => {
        var newObj: any = {};
        newObj.name = recObj[mapType];
        newObj.data = [];
        (sectionObj.displayFields).forEach(function(axisObj,index){
          if(index>0){
            var mapAxis = axisObj.mapping;
            var data = recObj[mapAxis];
            var replacedData: any = (data+"").replace(/(\$|%|,| )/g, "");
            data = isNaN(data) ? (isNaN(replacedData) ? null : Number(replacedData)) :  Number(data);
            newObj.data.push(data);
          }
        });								
        chartJson.series.push(newObj);
      });
    }
    chartInfo.displayDetails = graphContent.displayDetails;
    graphContent.chartInfo = chartInfo;
    graphContent.xAxis = chartJson.xAxis;
    graphContent.series = chartJson.series;
  }

  updateChartSectionObject(sectionObj: any){
    var graphContent: any = sectionObj.chartContent;
    var chartJson: any = {"xAxis": [],"series": []};
    graphContent.chartGraphContent = sectionObj.chartGraphContent = sectionObj.chartGraphContent || {};
    var columnList: any[] = graphContent.columnList || [];
    var displayDetails: any = graphContent.displayDetails || {};
    var containsSecAxis: boolean = ((displayDetails.selectedSecondaryChart || "") != "" && (displayDetails.secYAxis || "") != "");
    var xAxisAttr: string = columnList[0];
    var yAxisAttr: string = columnList[1];
    var seriesAttr: string = columnList[2];
    var secYAxisAttr: string = displayDetails.secYAxis;
    var chartInfo = JSON.parse(JSON.stringify((this.reports.chartInfo).find((chObj: any) => {
      return chObj.name == graphContent.name;
    }) || {}));
    var chartTypeMap: any = {"Float Bar": "column", "Line": "line"};
    if(sectionObj.displayFields){
      var isXAxisInRecord: boolean = false;
      var xAxisMapping: any = null;
      var seriesMappingList: any[] = [];
      if(sectionObj.reportType == "Data Grid"){
        isXAxisInRecord = true;
        sectionObj.displayFields.forEach((fields: any) => {
          if(xAxisMapping == null && xAxisAttr == fields.attr){
            xAxisMapping = fields.mapping;
          }else if(yAxisAttr == fields.attr){
            var seriesMapping: any = {name: fields.name, mapping: fields.mapping, chartDetails: {yAxis: 0, type: chartTypeMap[displayDetails.name]}};
            seriesMappingList.push(seriesMapping);
          }
          if(containsSecAxis && secYAxisAttr == fields.attr){
            var seriesMapping: any = {name: fields.name, mapping: fields.mapping, chartDetails: {yAxis: 1, type: chartTypeMap[displayDetails.selectedSecondaryChart.name]}};
            seriesMappingList.push(seriesMapping);
          }
        });
      }else if(sectionObj.reportType == "Matrix"){
        var matrixData: any = sectionObj.matrixData || {};
        var rowObj: any = (matrixData.rowList || []).find((row: any) => {
          return xAxisAttr == row.displayName;
        });
        if(rowObj){
          isXAxisInRecord = true;
          sectionObj.displayFields.forEach((fields: any) => {
            if(xAxisMapping == null && xAxisAttr == fields.name_actual){
              xAxisMapping = fields.mapping;
            }else if("calculatedData" == fields.type){
              var seriesMapping: any = {name: fields.name, mapping: fields.mapping, chartDetails: {yAxis: 0, type: chartTypeMap[displayDetails.name]}};
              seriesMappingList.push(seriesMapping);
            }
          });
        }else{
          
        }
      }
      if(isXAxisInRecord){
        var seriesValueList: any[] = [];
        var chartSeriesDataInfo: any = {};
        var seriesChartTypeInfo: any = {};
        (sectionObj.records || []).forEach((recObj: any, index: number) => {
          var xAxisValue: string = recObj[xAxisMapping];
          chartJson.xAxis.push(xAxisValue);
          seriesMappingList.forEach((seriesObj: any) => {
            if(index == 0){
              seriesValueList.push(seriesObj.name);
              chartSeriesDataInfo[seriesObj.name] = [];
              seriesChartTypeInfo[seriesObj.name] = seriesObj.chartDetails || {};
            }
            var data: any = recObj[seriesObj.mapping];
            var replacedData: any = (data+"").replace(/(\$|%|,| )/g, "");
            data = isNaN(data) ? (isNaN(replacedData) ? null : Number(replacedData)) :  Number(data);
            chartSeriesDataInfo[seriesObj.name].push(data);
          });
        });
  
        seriesValueList.forEach((seriesName: any) => {
          var seriesObject: any = {name: seriesName, data: chartSeriesDataInfo[seriesName]};
          var currentSeriesChartTypeInfo = seriesChartTypeInfo[seriesName] || {};
          if(currentSeriesChartTypeInfo.yAxis){
            seriesObject.yAxis = currentSeriesChartTypeInfo.yAxis;
          }
          if(currentSeriesChartTypeInfo.type){
            seriesObject.type = currentSeriesChartTypeInfo.type;
          }
          chartJson.series.push(seriesObject);
        });
      }else{
        var mapType: string = sectionObj.displayFields[0].mapping;
        (sectionObj.displayFields).forEach((axisObj: any, index: number) => {
          if(axisObj.type == "calculatedData"){
            chartJson.xAxis.push(axisObj.name);
          }
        });
        (sectionObj.records || []).forEach((recObj: any) => {
          var newObj: any = {};
          newObj.name = recObj[mapType];
          newObj.data = [];
          (sectionObj.displayFields).forEach((axisObj: any,index: number) => {
            if(index>0){
              var mapAxis: string = axisObj.mapping;
              var data: any = recObj[mapAxis];
              var replacedData: any = (data + "").replace(/(\$|%|,| )/g, "");
              data = isNaN(data) ? (isNaN(replacedData) ? null : Number(replacedData)) :  Number(data);
              newObj.data.push(data);
            }
          });								
          chartJson.series.push(newObj);
        });
      }
    }
    chartInfo.displayDetails = graphContent.displayDetails;
    graphContent.chartInfo = chartInfo;
    graphContent.xAxis = chartJson.xAxis;
    graphContent.series = chartJson.series;
  }

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