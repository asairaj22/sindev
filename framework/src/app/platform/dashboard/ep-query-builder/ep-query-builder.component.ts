import { Component, OnInit } from '@angular/core';
import { DashboardWidgetService } from '../service/dashboard-widget.service';
declare var $: any;

@Component({
  selector: 'ep-query-builder',
  templateUrl: './ep-query-builder.component.html',
  styleUrls: ['./ep-query-builder.component.css']
})
export class EpQueryBuilderComponent implements OnInit {
  
  constructor(
    private dashboard: DashboardWidgetService
  ) { }

  widget: any = this.dashboard.widget;
  wizard_widget: any = this.widget.wizard;
  wizard_selectedData: any = this.wizard_widget.selectedData;
  wizard_selectedData_filter: any = this.wizard_selectedData.filter;
	wizard_selectedData_widget: any = this.wizard_selectedData.widget;
  wizard_selectedData_dataSource: any = this.wizard_selectedData.dataSource;
  wizard_queryBuilder: any = this.wizard_widget.queryBuilder;
  static_interval: any = this.dashboard.static_data.intervalType;
  chartInfo: any = this.dashboard.chartInfo;
  customQuery_placeholder: any = {
    neo4j: {
      column: "MATCH(n:nodellabel) WHERE... RETURN n.xdata,n.ydata,n.series",
      bar: "MATCH(n:nodellabel) WHERE... RETURN n.xdata,n.ydata,n.series",
      pie: "MATCH(n:nodelabel) WHERE... RETURN n.data,n.series",
      donut: "MATCH(n:nodelabel) WHERE... RETURN n.data,n.series",
      line: "MATCH(n:nodellabel) WHERE... RETURN n.xdata,n.ydata,n.series",
      bubble: "MATCH(n:nodelabel) WHERE... RETURN n.xdata,n.ydata,n.zdata,n.data1,n.data2",
      candlestick: "MATCH(n:nodelabel) WHERE... RETURN n.xdata,n.data1,n.data2,n.data3,n.data4",
      gauge: "MATCH(n:nodelabel) WHERE... RETURN count(n.data) as dataname",
      funnel: "MATCH(n:nodelabel) WHERE... RETURN n.data,n.series",
      stackColumn: "MATCH(n.nodelabel) WHERE... RETURN a.x-Axisdata,a.y-axisdata,a.seriesdata",
      stackBar: "MATCH(n.nodelabel) WHERE... RETURN a.x-Axisdata,a.y-axisdata,a.seriesdata",
      area:"MATCH(n:nodellabel) WHERE... RETURN n.xdata,n.ydata,n.series",
      scatter:"MATCH(n:nodelabel) WHERE... RETURN n.xdata,n.ydata,n.zdata,n.data1,n.data2",
      table:"MATCH(n.nodelabel) RETURN n.data1,n.data2..."
    },
    mysql: {
      column: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test' group by series",
      bar: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test' group by series",
      pie: "select data, series from table a where a.column='test' group by series",
      donut: "select data, series from table a where a.column='test' group by series",
      line: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test' group by series",
      bubble: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test' group by series",
      candlestick: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test' group by series",
      gauge: "select count(column1) as Chart Name from table",
      funnel: "select data, series from table a where a.column='test' group by series",
      stackColumn: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test'",
      stackBar: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test'",
      area: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test' group by series",
      scatter: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test' group by series",
      table:"select X-Axis-data, Y-Axis-data, series from table"
    },
    oracle: {
      column: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test' group by series",
      bar: "select Y-Axis-data, X-Axis-data, series from table a where a.column='test' group by series",
      pie: "select data, series from table a where a.column='test' group by series",
      donut: "select data, series from table a where a.column='test' group by series",
      line: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test' group by series",
      bubble: "select X-Axis-data, Y-Axis-data, Z-Axis-data,data1,data2 from table a where a.column='test' group by series",
      candlestick: "select X-Axis-data,data1,data2,data3,data4 from table a where a.column='test' group by series",
      gauge: "select count(column1) as Chart Name from table",
      funnel: "select data, series from table a where a.column='test' group by series",
      stackColumn: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test'",
      stackBar: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test'",
      area: "select X-Axis-data, Y-Axis-data, series from table a where a.column='test' group by series",
      scatter: "select X-Axis-data, Y-Axis-data,Z-Axis-data,data1,data2  from table a where a.column='test' group by series",
      table: "select column1,column2,.. from table"
    }
  }

  openPopup(){
    $("#dateFormat .modal-body .date-format-cont").animate({ scrollTop: 0 }, "fast");
    $("#dateFormat").modal("show");
  }

  updateCheck(id: string) {
    if ($("#" + id).prop("checked") == true) {
      this.wizard_selectedData_filter.queryAttributes.fillPlotDetails.fillPlot = "false";
      setTimeout(function () {
        $("#" + id).prop("checked", false);
      }, 50);
    } else {
      this.wizard_selectedData_filter.queryAttributes.fillPlotDetails.fillPlot = "true";
      setTimeout(function () {
        $("#" + id).prop("checked", true);
      }, 50);
    }
  }

  ngOnInit(): void {}

}
