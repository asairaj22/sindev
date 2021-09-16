import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UtilService } from '../../../widgets/platform/util.service';

@Injectable({
    providedIn: "root",
})
export class SlidingBannerService {
    httpOptions = {};

    constructor(private http: HttpClient, private utilService: UtilService) { }
    getAllBannersConfiguration(): Observable<any> {
        return this.utilService.invokeAPI(
            "/banner/getAllActiveBanner",
            "GET",
            null,
            null,
            "pom"
        );
    }
}