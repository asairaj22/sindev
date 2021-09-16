/*! Plugin - Platform Utility v1.0.1 */
import { Injectable, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { AppModelService } from './app-model.service';
import { TranslateService } from '@ngx-translate/core';

import { ToastrService } from 'ngx-toastr';

import * as CryptoJS from 'crypto-js';

import dataMapping from './data-mapping.json';
import mockData from './mock-data.json';
import mapReference from './map-reference.json';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  accountName: string;
  appName: string;
  taskName: string;
  userTaskId: string;
  portalURL: string;
  serviceURL: string;
  apiPrefixURL: string;
  isInsideUIStudio: boolean;
  isTaskLevel: boolean = false;
  generalConfiguration: any;
  userDetails: any;
  isAdminUser: boolean;
  DMS_FOLDER_PRIVILEGE: any;
  prefixPlatformApi: string = '/eportal/api/platform';
  taskConfiguration: any = {};
  XSRF_TOKEN: any;
  _cache: any = {};

  constructor(private http: HttpClient, @Optional() private translate: TranslateService, private AppModel: AppModelService, private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {
    const pathSplittedArray = location.pathname.split('/');
    this.accountName = pathSplittedArray[1];
    let userTaskId = pathSplittedArray[2];
    try {
      let decodeAppTask = atob(userTaskId).split('#');
      if (decodeAppTask.length == 3) {
        this.isTaskLevel = true;
        this.appName = decodeAppTask[1];
        this.taskName = decodeAppTask[2];
        this.userTaskId = userTaskId;
      } else {
        this.appName = userTaskId;
      }
    } catch (error) {
      this.appName = userTaskId;
    }
    this.loadSessionInfos();
    this.XSRF_TOKEN = this.getCookieValue('XSRF-TOKEN');
    this.portalURL = location.origin;
    this.serviceURL = location.origin + '/router';
    this.apiPrefixURL = this.serviceURL + '/' + this.accountName + '/' + (this.isTaskLevel ? this.userTaskId : this.appName) + '/action/api';
    this.isInsideUIStudio = self != top;
    if (this.isInsideUIStudio) {
      Object.keys(mockData).forEach((key) => {
        this.AppModel[key] = mockData[key];
      });
    } else {

    }
    if(this.isTaskLevel && this.getCookieValue('XSRF-TOKEN')){
      this.loadTaskConfiguration();
    }
  }

  private async loadTaskConfiguration() {
    const data = await this.getTaskConfiguration().toPromise();
    this.taskConfiguration = (data.body) || {};
  }

  private loadSessionInfos() {
    try {
      let accountName: string = sessionStorage.getItem('ep-accountname');
      let generalConfigurationAcObj: any = JSON.parse(sessionStorage.getItem('generalConfiguration')) || {};
      this.userDetails = JSON.parse(sessionStorage.getItem('userDetails') || '{}');
      this.generalConfiguration = generalConfigurationAcObj[accountName] || {};
      var allowPersonalization = this.generalConfiguration.allowPersonalization == null || this.generalConfiguration.allowPersonalization == undefined ? 'N' : this.generalConfiguration.allowPersonalization;
      if (allowPersonalization == 'N') {
        sessionStorage.setItem('ep-timezone', this.generalConfiguration.timeZone || '');
      } else if (allowPersonalization == 'Y') {
        if (!this.userDetails.timezone || this.userDetails.timezone == '') {
          sessionStorage.setItem('ep-timezone', this.generalConfiguration.timeZone || '');
        } else {
          sessionStorage.setItem('ep-timezone', this.userDetails.timezone);
        }
      }
      this.isAdminUser = sessionStorage.getItem("isAccountOwner") == "true";
      this.DMS_FOLDER_PRIVILEGE = sessionStorage.getItem("FOLDER_PRIVILEGE");
    } catch (e) { }
  }

  public init(componentName: string) {
    this.execute({ mapId: 'page-ready', type: componentName }, null);
  }

  public invokePortalApi(path: string, method: string, request?: any, requestHeader?: any): Observable<HttpResponse<Object>> {
    const url = this.portalURL + path;
    return this.getHttpService(url, method, requestHeader, request);
  }

  public invokePlatformApi(path: string, method: string, request?: any, requestHeader?: any): Observable<HttpResponse<Object>> {
    const url = this.serviceURL + path;
    return this.getHttpService(url, method, requestHeader, request);
  }

  public invokePlatformServiceApi(path: string, method: string, request?: any, requestHeader?: any): Observable<HttpResponse<Object>> {
    const url = this.serviceURL + this.prefixPlatformApi + path;
    return this.getHttpService(url, method, requestHeader, request);
  }

  public invokeApplicationApi(path: string, method: string, request?: any, requestHeader?: any, appName: string = (this.isTaskLevel ? this.userTaskId : this.appName), cache?: boolean): Observable<HttpResponse<Object>> {
    //custom http caching
    //custom caching start
    var _shouldCache = false;
    if (cache) {
      var _cacheKey = `${path}-${method}-${(request ? JSON.stringify(request) : "")}`;
      if (this._cache.hasOwnProperty(_cacheKey)) {
        this._cache[_cacheKey].cacheIndex += 1;
        var response = new Observable<HttpResponse<Object>>(observer => observer.next(this._cache[_cacheKey]));
        return response;
      }
      else _shouldCache = true;
    }
    //custom caching end

    var headerOpt = Object.assign(requestHeader || {}, this.getDefaultHeaders());
    if (this.isTaskLevel && this.taskConfiguration.hasOwnProperty(appName)) {
      var taskId = this.taskConfiguration[appName].taskIDBase64;
      headerOpt['ep-appname'] = appName;
      headerOpt['ep-user-task-id'] = taskId;
      appName = taskId;
    }
    const url = this.serviceURL + '/' + this.accountName + '/' + appName + '/action/api' + path;
    const httpHeaders = new HttpHeaders(headerOpt);
    //custom caching start
    if (_shouldCache) {
      const _cachedResponse = new Observable<HttpResponse<Object>>(observer => {
        const subscription = this.getHttpService(url, method, httpHeaders, request).subscribe(res => {
          var _key = `${path}-${method}-${(request ? JSON.stringify(request) : "")}`;
          //size calculation && cache drop Logic
          var _size = this.calculateCacheSize(this._cache);
          //cache threshold
          if (_size > 5000000) {
            var _cacheIndex = 0;
            while (_size > 5000000) {
              for (var i in this._cache) {
                if (this._cache[i].hasOwnProperty('cacheIndex') && this._cache[i].cacheIndex == _cacheIndex) {
                  delete this._cache[i];
                  _size = this.calculateCacheSize(this._cache);
                  break;
                }
              }
              _cacheIndex += 1;
            }
          }
          this._cache[_key] = JSON.parse(JSON.stringify(res));
          this._cache[_key].cacheIndex = 0;
          observer.next(res);
        });
      });
      return _cachedResponse;
    }
    else return this.getHttpService(url, method, httpHeaders, request);
    //custom caching end

  }
  //cache size calculation logic
  public calculateCacheSize(object) {
    var objectList = [];
    var stack = [object];
    var bytes = 0;
    while (stack.length) {
      var value = stack.pop();
      if (typeof value === "boolean") {
        bytes += 4;
      } else if(typeof value === "string"){
        bytes += value.length * 2;
      } else if(typeof value === "number"){
        bytes += 8;
      } else if(typeof value === "object" && objectList.indexOf(value) === -1){
        objectList.push(value);
        for (var i in value) {
          stack.push(value[i]);
        }
      }
    }
    return bytes;
  }

  public invokeDownloadApplicationApi(path: string, method: string, request?: any, requestHeader?: any, appName: string = (this.isTaskLevel ? this.userTaskId : this.appName)) {
    method = method.toUpperCase();
    request = request || {};
    var headerOpt = Object.assign(requestHeader || {}, this.getDefaultHeaders());
    if (this.isTaskLevel && this.taskConfiguration.hasOwnProperty(appName)) {
      var taskId = this.taskConfiguration[appName].taskIDBase64;
      headerOpt['ep-appname'] = appName;
      headerOpt['ep-user-task-id'] = taskId;
    }
    var createElement = function (type, name, value) {
      var domObj: any = document.createElement("INPUT");
      domObj.type = type; domObj.name = name; domObj.value = value;
      return domObj;
    }
    if (document.getElementById("eportal_download_file_form")) {
      document.getElementById("eportal_download_file_form").remove();
    }
    var my_form: any = document.createElement("FORM");
    my_form.id = "eportal_download_file_form";
    my_form.style.display = "none !important";
    my_form.method = "POST";
    my_form.setAttribute("accept-charset", "UTF-8");
    my_form.setAttribute("target", "_blank");
    my_form.enctype = "application/x-www-form-urlencoded";
    my_form.action = this.portalURL + "/downloadFile";
    if (method == 'GET') {
      var queryString = "";
      if (!(request instanceof Array) && request != null) {
        var queryStringList = [];
        Object.keys(request).forEach(function (key) {
          var value = request[key];
          if (value && typeof (value) == "object") {
            value = "";
          }
          if (typeof (value) == "boolean" || value != "") {
            queryStringList.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
          }
        });
        queryString = queryStringList.join("&");
      }
      path += queryString != "" ? ("?" + queryString) : "";
    }
    my_form.appendChild(createElement("hidden", "API", path));
    my_form.appendChild(createElement("hidden", "METHOD", method));
    my_form.appendChild(createElement("hidden", "HEADER", JSON.stringify(headerOpt)));
    my_form.appendChild(createElement("hidden", "REQUEST", (request && typeof (request) == "object") ? JSON.stringify(request) : request));
    document.body.appendChild(my_form);
    my_form.submit();
  }

  private execute(event: any, data: any) {
    if (this.isInsideUIStudio) return;
    try {
      let mapId = null;
      const eventType = event.type;
      if (event instanceof MouseEvent || event instanceof KeyboardEvent || event instanceof FocusEvent) {
        const element = event.target as HTMLElement;
        mapId = element.getAttribute('ep-map-id');
      } else {
        mapId = event.mapId;
      }
      let mapDetails = dataMapping[mapId] || {};
      let mapEventDetails = mapDetails[eventType];
      if (mapEventDetails != null) {
        let stepList = JSON.parse(JSON.stringify(mapEventDetails.stepList || []));
        stepList.forEach((step: any, index: number) => {
          step.stepId = 'Step-' + (index + 1);
        });
        stepList.reverse();
        let queryParamMap: any;
        this.route.queryParamMap.subscribe(params => {
          queryParamMap = { ...params['params'] };
        });
        Object.keys(queryParamMap).forEach((key) => {
          queryParamMap[key] = decodeURIComponent(queryParamMap[key]);
        });
        let additionalDetails = { asyncIdList: [], queryParamMap, currentScope: data };
        this.executeStep(stepList, additionalDetails, function (error) {
          //Execution Completed
        });
      } else if (mapId != 'page-ready') {
        throw { message: 'Invalid MapId/EventType' };
      }
    } catch (e) {
      console.error(e);
    }
  };

  private executeStep(stepList: any, additionalDetails: any, callback: Function) {
    var updateAsyncIdList = function (executionType: string, currentStep: any) {
      if (executionType == 'ASYNC') {
        additionalDetails.asyncIdList.push(currentStep.stepId);
      }
    };
    if (stepList.length > 0) {
      let currentStep = stepList.pop();
      let executionType = currentStep.executionType || 'SYNC';
      if (executionType == 'SYNC' && additionalDetails.asyncIdList.length > 0) {
        stepList.push(currentStep);
      } else {
        let _this = this;
        switch (currentStep.type) {
          case 'LOADING_WIDGET':
            this.executeLoadingwidget(currentStep.loadingWidget);
            break;
          case 'BUSINESS_LOGIC':
            let isTerminateExecution = this.executeBusinessLogc(currentStep.businessLogic, additionalDetails);
            if (isTerminateExecution) {
              return;
            }
            break;
          case 'API':
            updateAsyncIdList(executionType, currentStep);
            this.executeAPI(currentStep.api, additionalDetails, function () {
              if (executionType != 'FAF') {
                _this.executeStep(stepList, additionalDetails, callback);
              }
            });
            if (executionType == 'SYNC') return;
          case 'WORKFLOW': //TODO:
            updateAsyncIdList(executionType, currentStep);
            this.executeWorkflow(currentStep.workflow, additionalDetails, function () {
              if (executionType != 'FAF') {
                _this.executeStep(stepList, additionalDetails, callback);
              }
            });
            if (executionType == 'SYNC') return;
          case 'POPUPS':
            this.executePopups(currentStep.popups);
            break;
          case 'NAVIGATE':
            return this.executeNavigate(currentStep.navigation, additionalDetails);
          case 'NOTIFICATION':
            this.executeNotification(currentStep.notification, additionalDetails);
            break;
          default:
            console.error('Invalid Step Type');
            return;
        }
        this.executeStep(stepList, additionalDetails, callback);
      }
    } else {
      callback();
    }
  }

  private executeLoadingwidget(details: any) {
    let targetElement = details.target;
    let loaderType = details.type;
    if (targetElement === 'CUSTOM') {
      targetElement = details.targetPath;
    }
    if (details.icon !== 'DEFAULT' && details.isLoaderIconUploaded) {
      let loaderImg = details.icon_base64Content;
      $(targetElement).LoadingOverlay(loaderType, {
        image: loaderImg
      });
    } else {
      $(targetElement).LoadingOverlay(loaderType);
    }
  }

  private executeBusinessLogc(details: any, additionalDetails: any) {
    try {
      var _this = this;
      let script = '(' + details.script + ')';
      this.setScopeToAppModule(eval(script)(this.getScopeFromAppModule(), {
        queryParam: additionalDetails.queryParamMap,
        currentScope: additionalDetails.currentScope,
        toastr: {
          success: function (message: string, title: string, toastConfig: any) {
            _this.toastr.success(message, title, toastConfig);
          },
          error: function (message: string, title: string, toastConfig: any) {
            _this.toastr.error(message, title, toastConfig);
          },
          info: function (message: string, title: string, toastConfig: any) {
            _this.toastr.info(message, title, toastConfig);
          },
          warning: function (message: string, title: string, toastConfig: any) {
            _this.toastr.warning(message, title, toastConfig);
          }
        },
        navigate: function (navUrlString: string) {
          if (navUrlString.startsWith('https') || navUrlString.startsWith('http')) {
            _this.pageNavigate(navUrlString);
          } else {
            _this.routerNavigateByUrl(navUrlString);
          }
        },
        loader: {
          show: function (selector: string) {
            selector = selector || 'body';
            $(selector).LoadingOverlay('show');
          },
          hide: function (selector: string) {
            selector = selector || 'body';
            $(selector).LoadingOverlay('hide');
          }
        },
        popup: {
          show: function (popupName: string, isCloseExisting: boolean) {
            if (popupName != '') {
              if (isCloseExisting) $('.modal').modal('hide');
              $('[name="' + popupName + '"][role="dialog"]').modal('show');
            }
          },
          hide: function (popupName: string) {
            $('[name="' + popupName + '"][role="dialog"]').modal('hide');
          }
        },
        appStorage: {
          set: function (key: string, value: any) {
            sessionStorage.setItem('EP_APP_STORE_' + key, JSON.stringify({ data: value }));
          },
          get: function (key: string) {
            var resp = null;
            let value = sessionStorage.getItem('EP_APP_STORE_' + key) as any;
            if (value) {
              try {
                resp = JSON.parse(value).data;
              } catch (e) {
                console.error(e);
              }
            }
            return resp;
          },
          remove: function (keys: any) {
            if (!(keys instanceof Array)) {
              keys = [keys];
            }
            keys.forEach(key => {
              sessionStorage.removeItem('EP_APP_STORE_' + key);
            });
          },
          removeAll: function () {
            Object.keys(sessionStorage).forEach(key => {
              if (key.startsWith('EP_APP_STORE_')) {
                sessionStorage.removeItem(key);
              }
            });
          }
        }
      }));
    } catch (e) {
      if (e.code == 500) {
        console.log('Execution Terminated');
      } else {
        console.error(e);
      }
      return true;
    }
    return false;
  }

  private executeAPI(details: any, additionalDetails: any, callback: Function) {
    const url = details.workflowURL ? details.workflowURL : (this.apiPrefixURL + details.path);
    const scopeKey = details.request.scopeKey;
    const scopeName = details.request.scopeName;
    const headerScopeName = details.request.headerScopeName || '';
    let requestData: any;
    if (scopeKey === 'CUSTOM') {
      requestData = this.AppModel[scopeName];
    } else if (scopeKey === 'QUERYPARAM') {
      requestData = additionalDetails.queryParamMap;
    } else if (scopeKey === 'CURRENTSCOPE') {
      requestData = additionalDetails.currentScope;
    } else {
      requestData = this.AppModel[scopeKey];
    }
    const requestHeader = headerScopeName !== '' ? this.AppModel[headerScopeName] : {};

    let processResposne = (error, responseData, responseHeader) => {
      const responseObj = details.response;
      const scopeKey = responseObj.scopeKey;
      const scopeName = responseObj.scopeName;
      const headerScopeName = responseObj.headerScopeName || '';
      if (headerScopeName !== '') {
        this.AppModel[headerScopeName] = responseHeader;
      }
      if (error === null) {
        this.AppModel[scopeKey === 'CUSTOM' ? scopeName : scopeKey] = [].concat(responseData != null ? responseData : []);
      } else {
        const errorScopeKey = responseObj.errorKey || '';
        if (errorScopeKey != '') {
          this.AppModel[errorScopeKey] = { error: error.error.errorMessage, status: error.status };
        }
      }
      callback();
    }

    this.getHttpService(url, details.method, requestHeader, requestData).subscribe((resp) => { //Success Block
      const keys = resp.headers.keys();
      let responseHeaders = {};
      keys.forEach(key => responseHeaders[key] = resp.headers.get(key));
      processResposne(null, resp.body, responseHeaders);
    }, (error) => { //Error Block
      processResposne(error, null, null);
    });

  }

  private getHttpService(url: string, method: string, requestHeader: any, requestData: any) {
    const httpOptions = (requestHeader instanceof HttpHeaders) ? requestHeader : new HttpHeaders(Object.assign(requestHeader || {}, this.getDefaultHeaders()));
    switch (method) {
      case 'GET': return this.http.get(url, { observe: 'response', params: requestData, headers: httpOptions });
      case 'POST': return this.http.post(url, requestData, { observe: 'response', headers: httpOptions });
      case 'PUT': return this.http.put(url, requestData, { observe: 'response', headers: httpOptions });
      case 'PATCH': return this.http.patch(url, requestData, { observe: 'response', headers: httpOptions });
      case 'DELETE': return this.http.delete(url, { observe: 'response', params: requestData, headers: httpOptions });
      default: throw { message: 'Invalid Method' }
    }
  }

  private executeWorkflow(details: any, additionalDetails: any, callback: Function) {
    let url = this.serviceURL;
    const executionType = details.executionType;
    const workflowName = details.name;
    const version = details.version || '';
    if (executionType == 'START_INSTANCE') {
      url += '/startflow/' + workflowName + '/startinstance/' + version;
    } else if (executionType == 'START_INSTANCE_ASYNC') {
      url += '/startflow/' + workflowName + '/startinstanceAsync/' + version;
    } else if (executionType == 'EXECUTE_NEXT_STEP') {
      const currentScope = additionalDetails.currentScope;
      let workflowStepName = this.getScopeOrCurrentScopeValueIfNeeded(details.request.workflowStepName || '', currentScope);
      let processInstanceId = this.getScopeOrCurrentScopeValueIfNeeded(details.request.processInstanceId || '', currentScope);
      if (!workflowStepName) {
        throw { message: 'Workflow StepName Missing' };
      } else if (!processInstanceId) {
        throw { message: 'Process Instance Id Missing' };
      } else {
        url += '/next/' + workflowStepName + '/' + processInstanceId;
      }
    } else {
      throw { message: 'Invalid Workflow executionType' };
    }
    details.workflowURL = url;
    details.method = 'POST';
    this.executeAPI(details, additionalDetails, callback);
  }

  private executePopups(popupObj: any) {
    let popupType = popupObj.type || '';
    let popupId = popupObj.popupId || '';
    if (popupType == 'SHOW' && popupId != '') {
      if (popupObj.closeExisting == 'YES') $('.modal').modal('hide');
      $('#' + popupId).modal('show');
    } else if (popupType == 'HIDE' && popupId != '') {
      $('#' + popupId).modal('hide');
    }
  }

  private executeNavigate(details: any, additionalDetails: any) {
    const navigateType = details.type;
    const navQueryList = details.query;
    const queryParams = this.getPageNavQueryParamObject(navQueryList, additionalDetails.currentScope);
    if (navigateType == 'PAGE') {
      this.routerNavigate(details.page, queryParams);
    } else if (navigateType == 'CUSTOM') {
      let navPageURL = details.customLink;
      if (Object.keys(queryParams).length > 0) {
        navPageURL += '?';
        Object.keys(queryParams).forEach((querykey: string, keyIndex: number) => {
          if (keyIndex == 0) {
            navPageURL += querykey + '=' + queryParams[querykey];
          } else {
            navPageURL += '&' + querykey + '=' + queryParams[querykey];
          }
        });
      }
      this.pageNavigate(navPageURL);
    }
  }

  private getPageNavQueryParamObject(queryList: any, currentScope: any) {
    let queryParamObj: any = {};
    queryList.forEach((queryObj: any) => {
      if (queryObj.key != '' && queryObj.value != '')
        queryParamObj[encodeURIComponent(queryObj.key)] = encodeURIComponent(this.getScopeOrCurrentScopeValueIfNeeded(queryObj.value, currentScope));

    });
    return queryParamObj;
  }

  private routerNavigate(pageName: string, queryParams: any) {
    this.router.navigate([pageName], { queryParams }).then((navigateSuccess: boolean) => {
      if (!navigateSuccess) {
        console.error('Navigation has failed');
        //this.toastr.error('Navigation has failed');
      }
    });
  }

  private routerNavigateByUrl(navUrlString: string) {
    if (!navUrlString.startsWith('/')) navUrlString = '/' + navUrlString;
    const appBaseURL = this.appName + '/' + 'pages';
    navUrlString = appBaseURL + navUrlString;
    this.router.navigateByUrl(navUrlString).then((navigateSuccess: boolean) => {
      if (!navigateSuccess) {
        console.error('Navigation has failed');
        //this.toastr.error('Navigation has failed');
      }
    });
  }

  private pageNavigate(navUrlString: string) {
    window.location.href = navUrlString;
  }


  private executeNotification(details: any, additionalDetails: any) {
    let notificationRule = details.rule || [];
    let scope = this.getScopeFromAppModule();
    let currentScope = additionalDetails.currentScope;
    let validNotificationRuleObj = notificationRule.find((ruleObj: any) => {
      let conditionObj = ruleObj.condition;
      let conditionKey = conditionObj.key || '';
      conditionKey = this.getScopeOrCurrentScopeValueIfNeeded(conditionKey, additionalDetails.currentScope);
      let conditionVal = conditionObj.value;
      let conditionOperation = conditionObj.cond;
      try {
        if (conditionKey === '') return true;
        if (conditionOperation == '== null' || conditionOperation == '!= null') {
          return eval('(function execute(scope, currentScope, key){ return key ' + conditionOperation + '; })')(scope, currentScope, conditionKey);
        } else {
          return eval('(function execute(scope, currentScope, key, value){ return key ' + conditionOperation + ' value; })')(scope, currentScope, conditionKey, conditionVal);
        }
      } catch (error) {
        return conditionOperation == '== null' ? true : false;
      }
    });
    if (validNotificationRuleObj) this.showEventFlowNotification(validNotificationRuleObj);
  }

  private showEventFlowNotification(ruleObj: any) {
    let ruleType = ruleObj.type || '';
    let ruleTitle = ruleObj.title || '';
    let ruleMessage = ruleObj.message || '';
    switch (ruleType) {
      case 'SUCCESS':
        this.toastr.success(ruleMessage, ruleTitle);
        break;
      case 'ERROR':
        this.toastr.error(ruleMessage, ruleTitle);
        break;
      case 'INFO':
        this.toastr.info(ruleMessage, ruleTitle);
        break;
      case 'WARNING':
        this.toastr.warning(ruleMessage, ruleTitle);
        break;
      default:
        break;
    }
  }

  public getDefaultHeaders() {
    let defaultHeader = {
      'XSRF-TOKEN': this.XSRF_TOKEN,
      'X-XSRF-TOKEN': this.getCookieValue('X-XSRF-TOKEN'),
      'ep-auth0-id': this.getCookieValue('ep-auth0-Token'),
      'ep-sessionid': this.getCookieValue('X-XSRF-TOKEN'),
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept': 'application/json;charset=UTF-8',
      'ep-client': 'eportal-web-ui-service',
      'accessedTimezone': new Date() + '',
      'ep-accountname': this.accountName,
      'ep-appname': this.appName,
      'ep-author': this.getCookieValue('ep-author') + '',
      'ep-username': sessionStorage.getItem('ep-username') || '',
      'ep-userid': sessionStorage.getItem('ep-userid') || '',
      'ep-lang': this.userDetails['language'] || '',
      'ep-userInfo': JSON.stringify(this.userDetails) || '',
      'ep-dateformat': this.generalConfiguration.defaultDateFormat || '',
      'ep-datetimeformat': this.generalConfiguration.defaultDateTimeFormat || '',
      'ep-timezone': sessionStorage.getItem('ep-timezone') || '',
      'X-XSS-Protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };
    if (this.userTaskId) {
      defaultHeader['ep-user-task-id'] = this.userTaskId;
    }
    return defaultHeader;
  }

  private getScopeFromAppModule() {
    let scope = {};
    let appModuleClone = JSON.parse(JSON.stringify(this.AppModel));
    Object.keys(appModuleClone).forEach(key => {
      if (!mapReference.hasOwnProperty(key)) scope[key] = appModuleClone[key];
    });
    Object.keys(mapReference).forEach((key) => scope[key] = appModuleClone[mapReference[key]]);
    return scope;
  }

  private getScopeValue(key: string) {
    try {
      return eval('(function execute(scope){return ' + key + ';})')(this.getScopeFromAppModule());
    } catch (e) {
      return null;
    }
  }

  private getCurrentScopeValue(key: string, currentScope: any) {
    try {
      return eval('(function execute(currentScope){return ' + key + ';})')(currentScope);
    } catch (e) {
      return null;
    }
  }

  private getScopeOrCurrentScopeValueIfNeeded(key: string, currentScope: any) {
    let returnVal = key;
    try {
      if (this.isNullOrEmpty(key)) {
        return returnVal;
      }
      if (key.startsWith('scope.')) {
        returnVal = this.getScopeValue(key);
      } else if (key.startsWith('currentScope.')) {
        returnVal = this.getCurrentScopeValue(key, currentScope);
      }
      return returnVal;
    } catch (e) {
      return returnVal;
    }
  }

  private setScopeToAppModule(scope: any) {
    Object.keys(scope).forEach((key) => {
      if (mapReference[key]) {
        this.AppModel[mapReference[key]] = scope[key];
      } else {
        this.AppModel[key] = scope[key];
      }
    });
  }

  private isNullOrEmpty(data: any) {
    return typeof (data) == 'number' ? false : (data || '') === '';
  }

  private getCookieValue(key: string): string {
    let b = document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
  }

  public loaderShow(id: string, laoderText: string) {
    $('#' + id).show();
    $('#' + id).find('span').text(laoderText);
  }

  public loaderHide(id: string) {
    $('#' + id).fadeOut();
  }

  public onLoginSubmit(uname: string, pwd: string, keepMeSignedIn?: string): Observable<HttpResponse<Object>> {
    const encryptedPwd = this.crypto.decrypt(pwd);
    let body = new HttpParams();
    body = body.set('uname', uname)
      .set('password', encryptedPwd)
      .set('keepMeSignedIn', keepMeSignedIn ? 'on' : 'off')
      .set('auth', 'EXTERNAL')
      .set('account', this.accountName)
      .set('app', this.appName);
    return this.http.post(this.portalURL + '/api/login', body, { observe: 'response' });
  }

  cms: any = {
    get: (cmsRequest: { title: string }) => {
      return this.invokePlatformServiceApi('/cms/getByTitle/' + cmsRequest.title, 'POST', cmsRequest);
    },
    getAll: (cmsRequest: { title: string }[]) => {
      return this.invokePlatformServiceApi('/cms/getAllByTitle', 'POST', cmsRequest);
    }
  }

  getTaskConfiguration() {
    return this.invokePlatformServiceApi('/task/taskConfig', 'GET');
  }

  getMenuList() {
    return this.invokePlatformServiceApi('/menu', 'GET');
  }

  getAppLogo() {
    return this.invokePlatformServiceApi('/menu/getLogo', 'GET');
  }

  language: any = {
    self: this,
    setDefault(lang: string): void {
      if (this.self.translate) {
        // this language will be used as a fallback when a translation isn't found in the current language
        this.self.translate.setDefaultLang(lang);
      }
    },
    render(lang: string): void {
      // the lang to use, if the lang isn't available, it will use the current loader to get them
      if (this.self.translate) {
        this.self.translate.use(lang);
      }
    },
    getAll: (): Observable<Array<{ code: string; language: string; isDefault: boolean }>> => {
      return new Observable(observer => {
        this.invokePlatformServiceApi('/language/getAllActive', 'GET').subscribe(
          res => {
            let languageList = (res.body || []) as any;
            observer.next(languageList);
          },
          err => {
            observer.error(err);
          }
        );
      });
    },
    getUserPreferredLanguage: (): string => {
      var selLang = 'en';
      var langCode = this.userDetails.language;
      if (langCode != null && langCode != "") {
        selLang = langCode;
      }
      return selLang;
    },
    updateUserPreferredLanguage: (language: string): Observable<{ status: string; message: string; }> => {
      return new Observable(observer => {
        var email = this.userDetails.email;
        this.invokePlatformServiceApi('/user/updateLanguage', 'PUT', { email, language }).subscribe(
          res => {
            let userInfo = (res.body || {}) as any;
            sessionStorage.setItem("userDetails", JSON.stringify(userInfo));
            sessionStorage.setItem("ep-lang", userInfo.language);
            this.userDetails = userInfo;
            this.language.render(userInfo.language);
            observer.next({ status: 'success', message: 'Language updated  Successfully' });
          },
          err => {
            this.toastr.error("Updated Failed.");
            observer.error(err);
          }
        )
      });
    }
  }

  crypto: any = {
    key: CryptoJS.MD5("ZXAtcGxhdGZvcm0="),
    iv: CryptoJS.enc.Hex.parse('0f0e0d0c0b0a09080706050403020100'),
    encrypt: function (text: string) {
      return CryptoJS.AES.encrypt(text, this.key, { iv: this.iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString();
    },
    decrypt: function (text: string) {
      return CryptoJS.AES.decrypt(text, this.key, { iv: this.iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
    }
  }

  fetchErrorMessage(err: any) {
    let errorStr: string = '';
    let errorObj: any = err.error;
    if (errorObj.errorMessage) {
      errorStr = errorObj.errorMessage;
    } else {
      errorStr = errorObj.message;
    }
    return errorStr;
  }

}