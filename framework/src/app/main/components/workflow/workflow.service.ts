import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { UtilService } from '../../../widgets/platform/util.service';

@Injectable({
    providedIn: 'root'
})
export class WorkflowService {

    constructor(private utilService: UtilService) {
    }

    cloudProvisioning(): Observable<any> {
        return this.utilService.invokeAPI(
            "/workflowrequest/cloud",
            "POST",
            null,
            null,
            'mpproser'
        )
    }

    orbiteraProvisioning(): Observable<any> {
        return this.utilService.invokeAPI(
            "/customers/orbitera",
            "POST",
            null,
            null,
            'om'
        )
    }

}