import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UtilService } from '../../widgets/platform/util.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class BackgroundService {

    public showSpinner: boolean = true;

    constructor(private http: HttpClient, private utilService: UtilService) { }

    

}