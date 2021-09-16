import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class Interceptor implements HttpInterceptor {
    message: string;
    action: boolean = true;
    setAutoHide: boolean = true;
    req: any;
    autoHide: number = 2000;
    private requests: any = [];
    constructor(public toastr: ToastrService) {  }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.url.startsWith("https://")) {
            if (request.url.indexOf("platform/task/taskConfig") == -1) {
                this.requests.push(request.url);
           }
        }
        let spinnerStyleElement = document.getElementById('_spinLoader');
        if (spinnerStyleElement) {
            document.getElementById('_spinLoader').style.display = "block";
        }
        // return next.handle(request);
        return Observable.create(observer => {
            const subscription = next.handle(request).subscribe(event => {
                if (event instanceof HttpResponse) {
                    this.removeRequest(request);
                    observer.next(event);
                }
            },
            err => {
                this.removeRequest(request);
                observer.error(err);
                // this.toastr.error(err.error.errorMessage, err.name, {
                //     timeOut: 5000,
                // });
            },
            () => {
                this.removeRequest(request);
                observer.complete();
            });
        });
    }

    removeRequest(req: HttpRequest<any>) {
        for (let j = 0; j <= this.requests.length; j++) {
            if (this.requests[j] == req.url) {
                this.requests.splice(j, 1);
            }
        }
        if (this.requests.length == 0) {
            document.getElementById('_spinLoader').style.display = "none";
        }
        // this.utilservice.isLoading.next(this.requests.length > 0);
    }
}
