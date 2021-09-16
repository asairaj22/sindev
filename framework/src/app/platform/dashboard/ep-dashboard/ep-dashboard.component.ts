import { Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { DashboardWidgetService } from '../service/dashboard-widget.service';
import { ApiService } from '@platform/util/api.service';
import { ToastrService } from 'ngx-toastr';
declare var GridStack: any;
declare var $: any;

@Component({
  selector: 'ep-dashboard',
  templateUrl: './ep-dashboard.component.html',
  styleUrls: ['./ep-dashboard.component.css', './../dashboard.module.css'],
  encapsulation: ViewEncapsulation.None
})
export class EpDashboardComponent implements OnInit, AfterViewInit {
  @ViewChildren('widgetTemplateContainerList') widgetTemplateContainers: QueryList<any>;
  
  constructor(
    public dashboard: DashboardWidgetService,
    private apiService: ApiService,
    private toastr: ToastrService
  ) { }

  color: string = '#ffffff';
  hasDashboardAdminAccess: boolean = false;
  hasDashboardBasicAccesss: boolean = false;
  commonValidation: any = this.dashboard.validation;
  widget: any = this.dashboard.widget;
  wizard_widget: any = this.widget.wizard;
  wizard_validation: any = this.wizard_widget.validation;
  wizard_selectedData: any = this.wizard_widget.selectedData;
  wizard_selectedData_filter: any = this.wizard_selectedData.filter;
  wizard_selectedData_widget: any = this.wizard_selectedData.widget;
  wizard_selectedData_displayDetails: any = this.wizard_selectedData.displayDetails;
  wizard_queryBuilder: any = this.wizard_widget.queryBuilder;
  advanceChartConfiguration: any = this.dashboard.advanceChartConfiguration;
  sliderOption: any = this.advanceChartConfiguration.sliderOption;
  static_date_format: any = this.dashboard.static_data.date_format;
  themeInfo: any = this.dashboard.themeInfo;
  appName: string;
  toAppendRefVal: any;
  currentDashInfoLoaded: boolean = false;
  dtOptions: DataTables.Settings = {};
  libraryWidgetPreviewList: any[] = [];

  // Create Edit Dashboard dependent variables
  isNew: boolean = true;
  dashboardName: string =  '';
  refreshInterval: any = '';
  errorMsg_dashboardName: string = null;
  errorMsg_refreshInterval: string = null;
  
  ngOnInit() {
    this.dashboard.loadAppName();
    this.appName = this.dashboard.appName;
    this.dtOptions = {
      pagingType: 'full_numbers',
      autoWidth: true,
      pageLength: 10,
      scrollX: true,
      scrollY: '200px',
      responsive: true
    };
  }

  ngAfterViewInit(): void {

    this.initDashboardGridStack();

    const gridStackContainer: any = document.getElementById('dashboard-grid-stack');
    this.dashboard.grid = gridStackContainer.gridstack;
    this.widget.libraryWidgetTemplate = $('#library_widget_template');

    $(".dashboard-widget-options").css('display', 'none');
    this.apiService.loaderShow('loader', ' Loading...');
    
    this.getDashboardPrivilege();
    this.wizard_queryBuilder.getObjectMetadata();

    this.initDOMEvents();

  }

  initDashboardGridStack(){
    GridStack.init({
      placeholderText: "",
      animate: true,
      float: true,
      resizable: {
        handles: "e, se, s, sw"
      }
    }, '#dashboard-grid-stack');
  }

  initDOMEvents(){
    $('#nav-state-toggle').click(() => {
        this.widget.refreshChart();
    });

    $(document).on('resizestop', '.grid-stack-item', () => {
      $("#dashboard-grid-stack > .grid-stack-item").each((index: number, ele: any) => {
        if (ele.hasAttribute("widget-name")) {
          var widgetName = $(ele).attr("widget-name");
          var nodeData = $(ele).data("_gridstack_node");
          var offset = { x: nodeData.x, y: nodeData.y, width: nodeData.width, height: nodeData.height }
          this.dashboard.currentDasboardInfo.widgetInfo[widgetName].offset = offset;
        }
      });
    });
  }

  getNameList(name?: string){
    let dashboardNameListUrl = '/dashboard/dashboardNames';
    let dashboardActiveNameListUrl = '/dashboard/activeDashboardNames';
    this.apiService.invokePlatformServiceApi(this.dashboard.epDashboardType == 'Application' ? dashboardNameListUrl : dashboardActiveNameListUrl, 'GET').subscribe(
      (response: any) => {
        this.dashboard.nameList = response.body || [];
				if(this.dashboard.nameList.length > 0){
          this.dashboard.nameList.sort((a: any, b: any) => {
            return a.position - b.position;
          });
          var dashbordInfo = this.dashboard.nameList[0];
          this.dashboard.nameList.forEach((_dashbordInfo: any) => {
            if(_dashbordInfo.name == name){
              dashbordInfo = _dashbordInfo;
            }
          });
          this.dashboard.dashboardInfo = {};
          this.getDashboardInfo(dashbordInfo.name, dashbordInfo.dashboard_id);
        }else{
          if(this.dashboard.epDashboardType == 'User'){
            this.apiService.loaderHide('loader');
          }else{
            this.createDefaultDashboard();
          }
        }
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        this.apiService.loaderHide('loader');
        
      }
    );
  }

  getDashboardPrivilege(){
    this.apiService.invokePlatformServiceApi('/dashboard/getPrivilege', 'GET').subscribe(
      (response: any) => {
        const privilegeResponse: any  = response.body || {};
        this.hasDashboardBasicAccesss = privilegeResponse.hasDashboardBasicAccesss;
        this.hasDashboardAdminAccess = privilegeResponse.hasDashboardAdminAccess;
        this.dashboard.hasDashboardBasicAccesss = privilegeResponse.hasDashboardBasicAccesss;
        this.dashboard.hasDashboardAdminAccess = privilegeResponse.hasDashboardAdminAccess;
        this.dashboard.themeInfo.init();
        this.getNameList();
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong while getting Dashboard Privile. Please check console'), 'FAILED');
        
      }
    );
  }

  createDefaultDashboard(){
    var dashboardDefault: any = {};
    dashboardDefault = this.dashboard._default;
    dashboardDefault.appName = this.appName;
    dashboardDefault.epDashboardType = this.dashboard.epDashboardType;
    this.apiService.invokePlatformServiceApi('/dashboardBasic/' + this.dashboard.epDashboardType, 'PUT', dashboardDefault).subscribe(
      (response: any) => {
        var _resp: any = response.body || {};
        if (_resp.status == "SUCCESS") {
          this.getNameList();
        }
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        this.apiService.loaderHide('loader');
        
      }
    );
  }

  getDashboardInfo(name: string, dashboard_id: string){
    if(!this.dashboard.dashboardInfo[name]){
      var applicationDashboardId = "";
      this.dashboard.nameList.find((obj: any) => {
        if(obj.dashboard_id == dashboard_id){
          applicationDashboardId = obj.applicationDashboardId || '';
          return true;
        }
      });
      this.apiService.invokePlatformServiceApi('/dashboard?dashboard_id=' + encodeURIComponent(dashboard_id) + '&applicationDashboardId=' + applicationDashboardId + '&epDashboardType=' + this.dashboard.epDashboardType, 'GET').subscribe(
        (response: any) => {
          this.dashboard.dashboardInfo[name] = JSON.parse(response.body || "{}");
          this.dashboard.dashboardInfo[name].isSaved = true;
          this.render(name);
          this.apiService.loaderHide('loader');
        },
        (err: any) => {
          this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
          this.apiService.loaderHide('loader');
          
        }
      );
    }else {
      this.render(name);
    }
  }

  customizeDashboard(currentDasboardInfo: any, isAdminUser: boolean){
    this.dashboard.isAdminUser = isAdminUser;
    setTimeout(() => {
      this.getDashboardInfo(currentDasboardInfo.name, currentDasboardInfo.dashboard_id);
    }, 200);
  }

  render(name: string, isManualRefresh?: boolean){
    if(isManualRefresh){
      this.invokeCurrentDashBoardInfoRenderer(true);
    }else{
      if(this.dashboard._intervalTimer) clearInterval(this.dashboard._intervalTimer);
      this.dashboard.currentDasboardInfo = this.dashboard.dashboardInfo[name];
      this.widget.widgetInfo = this.dashboard.currentDasboardInfo.widgetInfo || {};
      setTimeout(() => {
        this.dashboard.widgetTemplateContainers = this.widgetTemplateContainers;
        this.afterCurrentDashBoardInfoLoaded();
      }, 0);
    }
  }

  save(){
    this.apiService.loaderShow('loader', ' Loading...');
    var _currentDasboardInfo = this.dashboardgetCurrentDashboard_save();
    let reqObj: any = _currentDasboardInfo;
    reqObj.appName = this.appName;
    reqObj.epDashboardType = this.dashboard.epDashboardType;
    let privilegeControllerPrefix = this.getSavePrivilegeControllerPrefix();
    if(privilegeControllerPrefix == null){
      this.toastr.error('You do not have enough privilege for Save');
      return;
    }
    this.apiService.invokePlatformServiceApi(privilegeControllerPrefix + this.dashboard.epDashboardType, 'POST', reqObj).subscribe(
      (response: any) => {
        var _resp: any = response.body || {};
        if (_resp.status == "SUCCESS") {
          this.toastr.success('Saved Successfully..!!');
          if(_resp.needRefresh){
            this.getNameList(_currentDasboardInfo.name);
          }else{
            this.apiService.loaderHide('loader');
          }
          this.dashboard.isAdminUser = false;
        }else{
          var msg = (_resp.msg || "Save Failed");
          this.toastr.error(msg);
        }
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        this.apiService.loaderHide('loader');
        
      }
    );
  }

  _delete(){
    this.apiService.loaderShow('loader', ' Loading...');
    let name: string = this.dashboard.currentDasboardInfo.name;
    let dashboard_id: string = this.dashboard.currentDasboardInfo.dashboard_id;
    let reqObj: any = {name, dashboard_id, appName: this.appName, epDashboardType: this.dashboard.epDashboardType};
    this.apiService.invokePlatformServiceApi('/dashboardBasic/' + this.dashboard.epDashboardType, 'DELETE', reqObj).subscribe(
      (response: any) => {
        var _resp = response.body || {};
        if (_resp.status == "SUCCESS") {
          delete this.dashboard.dashboardInfo[name];
          this.dashboard.nameList = this.dashboard.nameList.filter((obj: any) => {
            return obj.name != name;
          });
          $("#dash_del_modal").modal("hide");
          if (_resp.needRefresh) {
            this.getNameList();
          } else {
            this.toggle(this.dashboard.nameList[0].name, this.dashboard.nameList[0].dashboard_id);
          }
          this.toastr.success('Deleted Successfully..!!');
        } else {
          $("#dash_del_modal").modal("hide");
          this.apiService.loaderHide('loader');
          this.toastr.error('Delete Failed!', 'FAILED');
        }
        this.apiService.loaderHide('loader');
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        this.apiService.loaderHide('loader');
        
      }
    );
  }

  dashboardgetCurrentDashboard_save(){
    var _currentDasboardInfo = JSON.parse(JSON.stringify(this.dashboard.currentDasboardInfo));
    _currentDasboardInfo.existingName = _currentDasboardInfo.name;
    _currentDasboardInfo.state = _currentDasboardInfo.isActive ? "Active" : "Draft";
    
    var offsetInfo = {};
    $("#dashboard-grid-stack > .grid-stack-item").each((index: number, element: any) => {
      offsetInfo[element.getAttribute("widget-id")] = {
          x: parseInt(element.getAttribute("data-gs-x")), 
          y: parseInt(element.getAttribute("data-gs-y")), 
          width: parseInt(element.getAttribute("data-gs-width")), 
          height: parseInt(element.getAttribute("data-gs-height"))
        };
    });
    
    Object.keys(_currentDasboardInfo.widgetInfo).forEach((key: string) => {
      var _obj = _currentDasboardInfo.widgetInfo[key];
      _obj.offset = offsetInfo[_obj.widget.id];
      delete _obj.widget.chartInfo_editedChart;
      delete _obj.widget.selectedViewId;
    });

    return _currentDasboardInfo;
  }

  afterCurrentDashBoardInfoLoaded() {
    var refreshInterval = this.dashboard.currentDasboardInfo.refreshInterval || '';
    if(!isNaN(refreshInterval) && refreshInterval > 0){
      this.dashboard._intervalTimer = setInterval(() => { this.invokeCurrentDashBoardInfoRenderer(true); }, refreshInterval * 60 * 1000);
    }
    this.invokeCurrentDashBoardInfoRenderer();
  }

  invokeCurrentDashBoardInfoRenderer(isAutoRefresh?: boolean){
    this.dashboard.themeInfo.applyTheme();
    if(isAutoRefresh){
      this.widget.renderAll();
    }else{
      this.widget.destroyAllCharts();
      this.dashboard.grid.removeAll();
      this.widget.renderAll();
      this.dashboard.updateAutoAlign();						
    }
  }

  toggle(name: string, dashboard_id: string, isDashboardNameChanged?: any){
    if(isDashboardNameChanged || name != this.dashboard.currentDasboardInfo.name) {
      if(Object.keys(this.dashboard.currentDasboardInfo || {}).length > 0){
        this.dashboard.currentDasboardInfo = {name: this.dashboard.currentDasboardInfo.name};
        setTimeout(() => {
          this.getDashboardInfo(name, dashboard_id);
        }, 0);
      }else{
        this.getDashboardInfo(name, dashboard_id);
      }
    }
  }

  getLibraryPreviewImgMetadata(){
    this.libraryWidgetPreviewList = [];
    this.apiService.loaderShow('loader', ' Loading...');
    this.apiService.invokePlatformServiceApi('/dashboardBasic/library/getAllPreviewImage', 'GET').subscribe(
      (response: any) => {
        this.libraryWidgetPreviewList = response.body || [];
        if(this.libraryWidgetPreviewList.length == 0){
          this.toastr.warning('No Library Widgets Available');
        }else{
          $('#lib-preview-dlg').modal('show');
        }
        this.apiService.loaderHide('loader');
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        this.apiService.loaderHide('loader');
        
      }
    );
  }

  addLibraryWidgets(){
    var getSelectedLibWidgetList = () => {
      let selWidgetIdList: Array<string> = [];
      this.libraryWidgetPreviewList.filter((s: any) => {
        if(s.isSelected){
          selWidgetIdList.push(s.id);
          return true;
        }
      });
      return selWidgetIdList;
    }
    let reqWidgetIdList = getSelectedLibWidgetList();
    if(reqWidgetIdList.length == 0) {
      this.toastr.error('Please select widgets');
      return;
    }
    this.apiService.loaderShow('loader', ' Loading...');
    this.apiService.invokePlatformServiceApi('/dashboardBasic/library/getWidgetInfo?widgetIds=' + reqWidgetIdList.join(','), 'GET').subscribe(
      (response: any) => {
        var newlyAddedWidgetNames: Array<string> = [];
        var selectedWidgetInfoList: any[] = response.body || [];
        selectedWidgetInfoList.forEach((selectedData: any) => {
          var _currentDasboardInfo = this.dashboard.currentDasboardInfo;
          var newId = 0;
          Object.keys(_currentDasboardInfo.widgetInfo).forEach((key: string) => {
            var id = parseInt(key.replace("Widget_", ""));
            if(id > newId) newId = id;
          });
          selectedData.widget.name = "Widget_" + (newId + 1);
          selectedData.offset = this.dashboard.widget.calculatePosition(_currentDasboardInfo);
          _currentDasboardInfo.widgetInfo[selectedData.widget.name] = selectedData;
          _currentDasboardInfo.widgetNameList.push(selectedData.widget.name);
          newlyAddedWidgetNames.push(selectedData.widget.name);
        });
        $('#lib-preview-dlg').modal('hide');
        this.apiService.loaderHide('loader');
        setTimeout(() => {
          this.dashboard.widgetTemplateContainers = this.widgetTemplateContainers;
          newlyAddedWidgetNames.forEach((widgetName: string) => {
            this.widget.render(widgetName);
          });
        }, 0);
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        this.apiService.loaderHide('loader');
        
      }
    );
  }

  initNewDashboard(isNew: boolean){
    this.isNew = isNew || false;
    if(isNew){
      this.dashboardName = "";
      this.refreshInterval = "";
    }else{
      this.dashboardName = this.dashboard.currentDasboardInfo.name;
      this.refreshInterval = this.dashboard.currentDasboardInfo.refreshInterval;
    }
    this.errorMsg_dashboardName = "";
    this.errorMsg_refreshInterval = null;
  }

  validateDashboardName() {
    var dashboardName = this.dashboardName || "";
    var refreshInterval = this.refreshInterval || "";
    var _currentDasboardInfo = this.dashboard.currentDasboardInfo;
    this.errorMsg_dashboardName = null;
    if(dashboardName == "") this.errorMsg_dashboardName = "Please Enter Dasboard Name";
    else if(!this.isNew && (dashboardName == _currentDasboardInfo.name && refreshInterval == _currentDasboardInfo.refreshInterval)) this.errorMsg_dashboardName = "";
    else if(this.isNew || (dashboardName != _currentDasboardInfo.name)){
      try{
        this.dashboard.nameList.forEach((obj: any) => {
          if(obj.name == dashboardName) throw "Dashboard Name Already Exists!";
        });
      }catch(e){
        this.errorMsg_dashboardName = e;
      }
    }
  }

  validateRefreshInterval() {
    var refreshInterval = this.refreshInterval || "";
    this.errorMsg_refreshInterval = null;
    if(refreshInterval != "" && (isNaN((refreshInterval)) || refreshInterval < 0))
      this.errorMsg_refreshInterval = "Invalid Refresh Interval!";
    else if(!this.isNew) this.validateDashboardName();
  }

  isValid(){
    this.validateDashboardName();
    this.validateRefreshInterval();
    return this.errorMsg_dashboardName == null && this.errorMsg_refreshInterval == null;
  }

  createDashboard(){
    if(!this.isValid()) return;
    this.apiService.loaderShow('loader', ' Loading...');
    this.errorMsg_dashboardName = ""; //TODO: Need to remove after adding loading icon inside button
    var name = this.dashboardName;
    var _nameList = this.dashboard.nameList;
    var position = (_nameList.length > 0 ? _nameList[_nameList.length - 1].position : 0) + 1;
    
    var newDashInfo = JSON.parse(JSON.stringify(this.dashboard._default));
    newDashInfo.name = name;
    newDashInfo.position = position;
    if(this.refreshInterval) newDashInfo.refreshInterval = this.refreshInterval;
    newDashInfo.appName = this.appName;
    newDashInfo.epDashboardType = this.dashboard.epDashboardType;
    this.apiService.invokePlatformServiceApi('/dashboardBasic/' + this.dashboard.epDashboardType, 'PUT', newDashInfo).subscribe(
      (response: any) => {
        var _resp = response.body || {};
        if (_resp.status == "SUCCESS") {
          newDashInfo.isSaved = true;
          newDashInfo.dashboard_id = _resp.dashboard_id;
          this.dashboard.dashboardInfo[name] = newDashInfo;
          this.dashboard.nameList.push({ name: name, position: position });
          $("#create_dash_modal").modal("hide");
          if (_resp.needRefresh) {
            this.getNameList(name);
          } else {
            this.toggle(name, newDashInfo.dashboard_id);
          }
          this.toastr.success('Dashboard Created..!!');
        } else {
          var msg = (_resp.msg || "Dashboard Creation Failed..!!");
          this.toastr.error(msg, 'FAILED');
        }
        this.apiService.loaderHide('loader');
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err)|| 'Something went wrong. Please check console'), 'FAILED');
        this.apiService.loaderHide('loader');
        
      }
    );
  }

  updateDashboard(){
    if(!this.isValid()) return;
    this.apiService.loaderShow('loader', ' Loading...');
    this.errorMsg_dashboardName = ""; //TODO: Need to remove after adding loading icon inside button
    var _currentDasboardInfo = this.dashboardgetCurrentDashboard_save();
    var newDashInfo = JSON.parse(JSON.stringify(_currentDasboardInfo));
    newDashInfo.name = this.dashboardName;	
    newDashInfo.refreshInterval = this.refreshInterval;
    newDashInfo.appName = this.appName;
    newDashInfo.epDashboardType = this.dashboard.epDashboardType;
    let privilegeControllerPrefix = this.getSavePrivilegeControllerPrefix();
    if(privilegeControllerPrefix == null){
      this.toastr.error('You do not have enough privilege for Save');
      return;
    }
    this.apiService.invokePlatformServiceApi(privilegeControllerPrefix + this.dashboard.epDashboardType, 'POST', newDashInfo).subscribe(
      (response: any) => {
        var _resp = response.body || {};
        if (_resp.status == "SUCCESS") {
          var _dashboardInfo = this.dashboard.dashboardInfo;
          if (newDashInfo.existingName != newDashInfo.name) { //Dashboard Name changed
            delete _dashboardInfo[newDashInfo.existingName];
            this.dashboard.nameList.forEach((Obj) => {
              if (Obj.name == newDashInfo.existingName) {
                Obj.name = newDashInfo.name;
              }
            });
            _dashboardInfo[newDashInfo.name] = newDashInfo;
          } else {
            _currentDasboardInfo.refreshInterval = newDashInfo.refreshInterval;
          }
          _dashboardInfo[newDashInfo.name].isSaved = true;
          if (_resp.needRefresh) {
            this.getNameList(newDashInfo.name);
          } else {
            this.toggle(newDashInfo.name, newDashInfo.dashboard_id, true);
          }
          $("#create_dash_modal").modal("hide");
          this.toastr.success(this.isNew ? "Saved Successfully..!!" : "Updated Successfully..!!");
        } else {
          var msg = (_resp.msg || (this.isNew ? "Save Failed" : "Update Failed"));
          this.toastr.error(msg, 'FAILED');
        }
        this.apiService.loaderHide('loader');
      },
      (err: any) => {
        this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
        this.apiService.loaderHide('loader');
        
      }
    );
  }

  getSavePrivilegeControllerPrefix(){
    let privilegeControllerPrefix: string = null;
    if(this.hasDashboardAdminAccess){
      privilegeControllerPrefix = '/dashboardAdmin/';
    }else if(this.hasDashboardBasicAccesss){
      privilegeControllerPrefix = '/dashboardBasic/';
    }
    return privilegeControllerPrefix;
  }

  refresh(){
    if(this.dashboard.currentDasboardInfo.name) this.render(this.dashboard.currentDasboardInfo.name, true);
  }

  _show(el: any){
    el.nextElementSibling.style.marginLeft = "0px";
  }

  _hide(el: any){
    el.parentNode.style.removeProperty("margin-left");
  }

  deleteTheme(theme?: any){
    if(theme){
      $("#theme_del_modal_widgetName")
      .text(theme.name)
      .attr("delete-theme-id", theme.id);
      $("#theme_del_modal").modal("show");
    }else{
      this.apiService.loaderShow('loader', ' Loading...');
      var themeId = $("#theme_del_modal_widgetName").attr("delete-theme-id");
      this.apiService.invokePlatformServiceApi('/dashboardAdmin/themes/' + themeId, 'DELETE').subscribe(
        (response: any) => {
          var _resp = response.body || {};
          if (_resp.status == "SUCCESS") {
            this.toastr.success('Deleted Successfully..!!');
            this.themeInfo.themeList = this.themeInfo.themeList.filter((theme: any) => {
              return theme.id != themeId;
            });
            if (this.dashboard.currentDasboardInfo.chartTheme == themeId) {
              this.dashboard.currentDasboardInfo.chartTheme = 1;
              this.refresh();
            }
          } else {
            this.toastr.success('Deletion Failed..!!');
          }
          $("#theme_del_modal").modal("hide");
          this.apiService.loaderHide('loader');
        },
        (err: any) => {
          this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
          this.apiService.loaderHide('loader');
          
        }
      );
    }
  }

  createOrUpdateTheme(){
    if(this.commonValidation.isNullOrEmpty(this.themeInfo.themeName)){
      this.toastr.error('Please Enter Theme Name');
    }else{
      var id = this.themeInfo.isNew ? 0 : this.themeInfo.theme_edit.id;
      var matchedThemeList = this.themeInfo.themeList.filter((theme: any) => {
        return (theme.name == this.themeInfo.themeName && theme.id != id);
      });
      if(matchedThemeList.length > 0){
        this.toastr.error('Theme Name Already Exists');
      }else{
        var position = 0;
        this.themeInfo.themeList.forEach((theme: any) => {
          if (position < theme.position) position = theme.position;
        });
        position++;

        var request = this.themeInfo.isNew ? { isDefault: false, position: position, id: position } : this.themeInfo.theme_edit;
        request.themeInfo = JSON.stringify(this.themeInfo.theme);
        request.name = this.themeInfo.themeName;
        this.apiService.loaderShow('loader', ' Loading...');
        this.apiService.invokePlatformServiceApi('/dashboardAdmin/themes', (this.themeInfo.isNew ? 'POST' : 'PUT'), request).subscribe(
          (response: any) => {
            var _resp = response.body || {};
            if (_resp.status == "SUCCESS") {
              this.themeInfo.get( () => {
                $("#chartCustomizeTheme").modal("hide");
                this.toastr.success(this.themeInfo.isNew ? "Theme Created Successfully..!!" : "Theme Updated Successfully..!!");
                var currentTheme = this.themeInfo.themeList.find((theme: any) => {
                  return theme.name == request.name;
                });
                this.dashboard.currentDasboardInfo.chartTheme = currentTheme.id;
                this.refresh();
              });
            } else {
              this.toastr.error(this.themeInfo.isNew ? "Theme Creation Failed..!!" : "Theme Updated Failed..!!");
            }
            this.apiService.loaderHide('loader');
          },
          (err: any) => {
            this.toastr.error((this.apiService.fetchErrorMessage(err) || 'Something went wrong. Please check console'), 'FAILED');
            this.apiService.loaderHide('loader');
            
          }
        );
      }
    }
  }

}

$(document).on('show.bs.modal', '.modal', function () {
  var zIndex = 1040 + (10 * $('.modal:visible').length);
  $(this).css('z-index', zIndex);
  setTimeout(function() {
      $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
  }, 0);
});