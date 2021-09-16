import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';
import { Customer } from './main/components/users/manage-users/manage-users';
import { UtilService } from "src/app/widgets/platform/util.service";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AppService {

  constructor(private http: HttpClient, private utilService: UtilService) { 
    
  }
  public popupComponent = new BehaviorSubject<string>('');	
  example = this.popupComponent.asObservable();	
  setPopup(componentName) {	
    this.popupComponent.next(componentName);	
  }	
  public individualComponent = new BehaviorSubject<string>('');	
  componentIndividual = this.individualComponent.asObservable();	
  setComponent(component) {	
    this.individualComponent.next(component);	
  }
  
  public stringSubject = new Subject<string>();
  public featuredArticlesSubject = new BehaviorSubject<any>(null);
  public cloudResellAccDetails = new BehaviorSubject<any>(null);
  public cloudResellAccDetailsOffice365 = new BehaviorSubject<any>(null);

  public headerheight = new BehaviorSubject<any>(null);
  public subHeaderheight = new BehaviorSubject<any>(null);
  public headerLogoChange = new BehaviorSubject<any>(null);
  public loginOrLogout = new BehaviorSubject<any>(null);
  public loginWizardDatapass = new BehaviorSubject<any>(null);
  public anyQuestionProductName = new Subject<any>();
  public pageNameFind:number;
  public scrollUp:boolean = false;
  public cloudPageBoolean:boolean = false;
  public manageUserObj: any = [];
  public manageIndividualUser: any = {};
  public emailIdValidatePattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
  public manageEcdmId: number = 0;
  public manageUser: string = "";
  // orbitera Reports Subjects
  private selectedBillingInvoiceDetails = new BehaviorSubject([]);
    selectedBillingInvoiceCurrent = this.selectedBillingInvoiceDetails.asObservable();
    billingInvoiceSelect(item) {
        this.selectedBillingInvoiceDetails.next(item);
    }

// ***** check user log in status 
  private userLoggedIn = new Subject<any>();

  setUserLoginStatus(status: boolean) {
    this.userLoggedIn.next(status);
  }

  getUserLoginStatus(): Observable<any> {
    return this.userLoggedIn.asObservable();
  }

  // ********

  passValue(data) {
    //passing the data as the next observable 
    this.stringSubject.next(data);
  }
  passFeaturedArticles(data) {
    //passing the data as the next observable 
    this.featuredArticlesSubject.next(data);
  }
  passCloudResellAccDetails(data) {
    //passing the data as the next observable 
    this.cloudResellAccDetails.next(data);
  }
  passCloudResellAccDetailsOffice365(data) {
    //passing the data as the next observable 
    this.cloudResellAccDetailsOffice365.next(data);
  }
  passHeaderheight(data) {
    this.headerheight.next(data);
  }
  passSubHeaderheight(data) {
    this.subHeaderheight.next(data);
  }
  passHeaderLogogChange(data) {
    this.headerLogoChange.next(data);
  }
  loginOrlogout(data){
    this.loginOrLogout.next(data);
  }
  loginWizardDataPass(data){
    this.loginWizardDatapass.next(data);
  }

  getCustomersLarge() {
    return this.http.get<any>('assets/json/customers-large.json')
      .toPromise()
      .then(res => <Customer[]>res.data)
      .then(data => { return data; });
  }

  // HOME API'S START
  getcontactcategory(): Observable<any> {
    return this.utilService.invokeAPI(
      `/ContactusCategories`,
      "GET",
      null,
      null,
      "cust"
    );
  }
  getquestioncategory(): Observable<any> {
    return this.utilService.invokeAPI(
      `/QuestionsCategories`,
      "GET",
      null,
      null,
      "cust"
      // "MjQjY3VzdCNxYV9waGFzZV8xX2I="
    );
  }
  submitquestion(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/Questions`,
      "POST",
      obj,
      null,
      "cust"
    );
  }
  submitcontact(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/ContactUs`,
      "POST",
      obj,
      null,
      "cust"
    );
  }

  getBannerImages(image: any): Observable<any> {
    return this.utilService.invokeAPI(
      `/banner/getDetails/${image}`,
      "GET",
      null,
      null,
      "cust"
    );
  }

  getAllFeaProductsTestimonials(): Observable<any> {
    return this.utilService.invokeAPI(
      `/banner/get/FP&T`,
      "GET",
      null,
      null,
      "cust"
    );
  }
  getAllAccessSetForUser(inputObj): Observable<any> {
    return this.utilService.invokeAPI(
      '/mp/user/getAccessset',
      "POST",
      inputObj,
      null,
      "cust"
    );
  }


  // HOME API'S END

  getCustomerDetailsCust(obj) {
    return this.utilService.invokeAPI(
      "/customer/getdetailsbyemail",
      "GET",
      obj,
      null,
      "cust"
    )
  }
  orbiteraSignInAdminSandbox(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/orbiterasigninreq/adminSignInSandbox`,
      "POST",
      obj,
      null,
      "om"
    );
  }
  getAllChartsSandbox(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/orbiterachartreq/getAllChartsSandbox`,
      "GET",
      obj,
      null,
      "om"
    );
  }
  orbiteraChartsAdminSandbox(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/orbiterachartreq/adminChartsSandbox`,
      "POST",
      obj,
      null,
      "om"
    );
  }

  orbiteraChartsCustomer(obj) {
    return this.utilService.invokeAPI(
      `/orbiterachartreq/customerCharts`,
      "POST",
      obj,
      null,
      "om"
    )
  }
  getCustomerDetailsById(id, individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/customer/" + id + "/get",
      "POST",
      individualObj,
      null,
      "cust"
    );
  }
  // trigger activation mail while unregistered Email is used
  triggerActivationEmail(inputObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/customer/triggerMail",
      "POST",
      inputObj,
      null,
      "cust"
    );
  }
  getReportListSandBox(data): Observable<any> {
    return this.utilService.invokeAPI(`/orbitera/admin/getallreports/customer`, "POST", data, null, "om");
  }
  getCustomerReportBYId(data): Observable<any> {
    return this.utilService.invokeAPI(`/orbitera/customer/report/get`, "POST", data, null, "om");
  }

  // Header-Menu API's Start

  getCompanyDetails(id): Observable<any> {
    return this.utilService.invokeAPI(
      "/Companydetails",
      "GET",
      id,
      null,
      'cust'
    )
  }

  getShoppingSession(obj): Observable<any> {
    return this.utilService.invokeAPI(
      "/mp/shoppingsession/create",
      "POST",
      obj,
      null,
      'cust'
    )
  }

  getuserDetails(obj): Observable<any> {
    return this.utilService.invokeAPI(
      "/UserAccountDetails",
      "GET",
      obj,
      null,
      'cust'
    )
  }


  createShoppingSessionRef(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/shoppingsessionref/create	`,
      "POST",
      obj,
      null,
      "cust"
    );
  }

  // getShoppingSession(): Observable<any>{

  // }

  // Header-Menu API's End

  getCustomerInventory(id, individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/mp/customer/getCustomerInventory/" + id,
      "POST",
      individualObj,
      null,
      'cust'
    )
  }


  // Office 365 starts

  getMyProductsList(id): Observable<any> {
    return this.utilService.invokeAPI(
      "/user/microsoft/product/" + id,
      "GET",
      null,
      null,
      'mpproser'
    )
  }
  getTheMicrosoftSubscription(id, usedId): Observable<any> {
    return this.utilService.invokeAPI(
      "/myproducts" + id + usedId,
      "GET",
      null,
      null,
      'mpproser'
    )
  }
  updateSubscriptionCount(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/provisioningsubscriptiondetails/ui`,
      "POST",
      obj,
      null,
      "mpproser"
    );
  }
  suspendSubscription(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/provisioningsubscriptiondetails/ui`,
      "POST",
      obj,
      null,
      "mpproser"
    );
  }
  getUserList(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/microsoft/userslist`,
      "POST",
      obj,
      null,
      "mpproser"
    );
  }
  createUsers(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/microsoft/provisioningusers`,
      "POST",
      obj,
      null,
      "mpproser"
    );
  }
  assignUserToProduct(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/microsoft/assignlicense`,
      "POST",
      obj,
      null,
      "mpproser"
    );
  }

  // Office 365 ends

  getUserSettingsDetails(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/customer/individualuserbyProduct`,
      "POST",
      obj,
      null,
      "cust"
    );
  }



  changeAssignStatus(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/ecdmProductSubscriptionUsers/assignorunassign`,
      "POST",
      obj,
      null,
      "cust"
    );
  }


  changeAwsAccName(obj): Observable<any> {
    return this.utilService.invokeAPI(
      `/ecdm_product/saveOrUpdate`,
      "POST",
      obj,
      null,
      "cust"
    );
  }

  getCustomerDetails(id): Observable<any> {
    return this.utilService.invokeAPI(
      `/customer/getApps/` + id,
      "GET",
      null,
      null,
      "cust"
    );
  }

  getIndividualCustomerDetails(id, individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      '/customer/' + id + '/getapps',
      "POST",
      individualObj,
      null,
      "cust"
    );
  }

  createDetails(custId, obj): Observable<any> {
    return this.utilService.invokeAPI(
      '/customer/' + custId + '/individual',
      "POST",
      obj,
      null,
      "cust"
    );
  }


  getCustomerList(id, individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      '/customer/' + id + '/getList',
      "POST",
      individualObj,
      null,
      "cust"
    );
  }

  departmentDetails(id, individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      '/mp/Customer/' + id + '/departments',
      "POST",
      individualObj,
      null,
      "cust"
    );
  }

  /////Forgot password API
  submitForgetPassword(inputObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/forgotPassword",
      "POST",
      inputObj,
      null,
      "cust"
    );
  }
  ////Change Password API
  submitChangePassword(inputObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/admin/setUserPassword",
      "POST",
      inputObj,
      null,
      "cust"
    );
  }
  
  validateTokenStatus(token): Observable<any> {
    return this.utilService.invokeAPI(
      "/validateToken/"+token,
      "GET",
      null,
      null,
      "cust"
    );
  }
  

  getIndividualUser(id, individualId, individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      '/customer/' + id + '/individual/' + individualId,
      "POST",
      individualObj,
      null,
      "cust"
    );
  }


  terminateUser(id, individualId, individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      '/mp/customer/' + id + '/individual/' + individualId,
      "POST",
      individualObj,
      null,
      "cust"
    );
  }

  getMasterData(obj): Observable<any> {
    return this.utilService.invokeAPI(
      '/mp/masterdata',
      "POST",
      obj,
      null,
      "cust"
    );
  }

  editUserDetails(custId, indvId, obj): Observable<any> {
    return this.utilService.invokeAPI(
      '/customer/' + custId + '/individual/' + indvId,
      "PUT",
      obj,
      null,
      "cust"
    );
  }

  getmyAccAppsDetails(id, individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      '/Individual/' + id + '/getapps',
      "POST",
      individualObj,
      null,
      "cust"
    );
  }

  updatemyAccAppsDetails(id, obj): Observable<any> {
    return this.utilService.invokeAPI(
      '/mp/Individual/' + id + '/myAccount',
      "POST",
      obj,
      null,
      "cust"
    );
  }
   updatenewmyAccAppsDetails(id, obj): Observable<any> {
    return this.utilService.invokeAPI(
      '/Individual/' + id + '/myAccount',
      "POST",
      obj,
      null,
      "cust"
    );
  }


  getSendTestMail(obj): Observable<any> {
    return this.utilService.invokeAPI(
      '/communication/communicationmessage',
      "POST",
      obj,
      null,
      "comapi"
    );
  }

  
getAccessDetails(custId,obj): Observable<any> {
  return this.utilService.invokeAPI(
    '/ordermanagement/order/customer/'+custId,
    "POST",
    obj,
    null,
    "om"
  );
  }

  setNewPassword(obj): Observable<any> {
    return this.utilService.invokeAPI(
      '/admin/setUserPassword',
      "POST",
      obj,
      null,
      "cust"
    );
  }
  setLoginNewPassword(inputObj): Observable<any> {
    return this.utilService.invokeAPI(
      "/loginChangePassword",
      "POST",
      inputObj,
      null,
      "cust"
    );
  }

getEmailAlreadyExistList(individualObj): Observable<any> {
    return this.utilService.invokeAPI(
      '/indvmediumcharacteristic',
      "POST",
      individualObj,
      null,
      "cust"
    );
  }
  

// REQ 1:
// {
// "startDate":"2020/10/01",
// "EndDate":"2020/11/01"
// }

// REQ 2:



  // mapTemporaryShoppingSession(obj): Observable<any> {
  //   return this.utilService.invokeAPI(
  //     "/shoppingsessionref/mapTemporarySession",
  //     "POST",
  //     obj,
  //     null,
  //     "cust"
  //   );
  // }

// {
// "key":"Current month"
// }

// REQ 3:

// {
// "key":"Last 3 months"
// }


/*/ Orbitera Reports API start Divya E*/
getOrbiteraDashboardByAccount(inputObj): Observable<any> {
  return this.utilService.invokeAPI(
    '/orbitera/getDashboardCardsforAccount',
    "POST",
    inputObj,
    null,
    "om"
  );
  }
  getOrbiteraDashboardByCustFilter(inputObj): Observable<any> {
  return this.utilService.invokeAPI(
    '/orbitera/getDashboardCardsbyCustomer/Filter',
    "POST",
    inputObj,
    null,
    "om"
  );
  }
getOrbiteraBillingInvoice(inputObj): Observable<any> {
  return this.utilService.invokeAPI(
    '/cloudaccountinvoice/getDetails',
    "POST",
    inputObj,
    null,
    "om"
  );
  }
  getOrbiteraBillingSubscriptionDetails(inputObj): Observable<any> {
  return this.utilService.invokeAPI(
    '/cloudsubscriptiondetails/getDetails',
    "POST",
    inputObj,
    null,
    "om"
  );
  }
/*/ Orbitera Reports API end*/

  getCustomerEmailList(obj): Observable<any> {
    return this.utilService.invokeAPI(
      '/customerGetEmail/',
      "POST",
      obj,
      null,
      "cust"
    );
  }
  
activateIndividual(token): Observable<any> {
    return this.utilService.invokeAPI(
      '/individual/' + token + '/activate',
      "GET",
      null,
      null,
      "cust"
    );
  }

  getProductCategory(data): Observable<any> {
    return this.utilService.invokeAPI(
      "/productsearchfilter/getmarketplacedetailsnew",
      "POST",
      data,
      null,
      'pom'
    )
  }

  getTermsConditonPdf(): Observable<any> {
    return this.utilService.invokeAPI(
      "/productoffering/getTermsAndCondition",
      "POST",
      null,
      null,
      'pom'
    )
  }

  environmentcheck(env): Observable<any> {
    return this.utilService.invokeAPI(
      "/environmentcheck",
      "GET",
      env,
      null,
      'comapi'
    )
  }


}
