import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UtilService } from '../../../widgets/platform/util.service';
import { BehaviorSubject, Subject } from 'rxjs';

export interface Orders {
    orderData?: any;
    orderNo?: any;
    orderType?: any;
    offerName?: any;
    saasId?: any;
    quantity?: any;
    orderby?:any;
    
}

@Injectable({
  providedIn: 'root'
})
export class MyCompanyService {

  constructor(private http: HttpClient, private utilService: UtilService) {
    }

    getCompanyDetails(id): Observable<any> {
        return this.utilService.invokeAPI(
            "/Companydetails",
            "GET",
            id,
            null,
            'cust'
        )
    }
    saveCompanyDetails(obj): Observable<any> {
        return this.utilService.invokeAPI(
            "/Companydetails/create",
            "POST",
            obj,
            null,
            'cust'
        )
    }
    getDepartments(customerid, individualObj): Observable<any> {
        return this.utilService.invokeAPI(
            "/mp/Customer/"+ customerid +"/departments",
            "POST",
            individualObj,
            null,
            'cust'
        )
    }
    deleteDepartments(customerid,id, individualObj): Observable<any> {
        return this.utilService.invokeAPI(
            "/customer/"+customerid+"/departments/"+id,
            "DELETE",
            individualObj,
            null,
            'cust'
        )
    }
    createDepartments(customerid,inputObj): Observable<any> {
        return this.utilService.invokeAPI(
            "/Customer/"+customerid+"/departments",
            "POST",
            inputObj,
            null,
            'cust'
        )
    }
    getAdministrators(customerid, inputObj): Observable<any> {
        return this.utilService.invokeAPI(
            "/Customer/"+customerid+"/administrator",
            "POST",
            inputObj,
            null,
            'cust'
        )
    }
    getNotificationsConfig(customerid, individualObj): Observable<any> {
        return this.utilService.invokeAPI(
            "/Customer/"+customerid+"/customernotificationsconfig",
            "POST",
            individualObj,
            null,
            'cust'
        )
    }
    getNotificationsList(individualObj): Observable<any> {
        return this.utilService.invokeAPI(
            "/Customer/customernotifications",
            "POST",
            individualObj,
            null,
            'cust'
        )
    }
    getIndustryDetails(individualObj): Observable<any> {
        return this.utilService.invokeAPI(
            "/mp/getIndustry",
            "POST",
            individualObj,
            null,
            'cust'
        )
    }
    getMasterDetails(individualObj): Observable<any> {
        return this.utilService.invokeAPI(
            "/mp/masterdata/get/customerIdType",
            "POST",
            individualObj,
            null,
            'cust'
        )
    }
    saveCustomerNotifications(obj): Observable<any> {
        return this.utilService.invokeAPI(
            "/Customer/customernotificationsconfig/",
            "POST",
            obj,
            null,
            'cust'
        )
    }
    getNewsLetter(inputObj,customerid): Observable<any> {
        return this.utilService.invokeAPI(
            "/custcharacteristic/"+customerid,
            "POST",
            inputObj,
            null,
            'cust'
        )
    }
saveNewsLetterList(obj): Observable<any> {
        return this.utilService.invokeAPI(
            "/custcharacteristic",
            "POST",
            obj,
            null,
            'cust'
        )
    }
}