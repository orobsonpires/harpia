import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AlertType, ModalAlertData } from '../models/modal-alert.model';
import { ModalService } from '../services/modal.service';


@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {

    constructor(private modalService: ModalService) { }

    /**
     * The JWT token is retrieved from the localStorage, in case there is one valid token, then token is 
     * inserted in the request headers.
     * 
     * The Content-Type and Accept are set to 'application/json'.
     *
     * @param {HttpRequest<any>} request
     * @param {HttpHandler} next
     * @returns {Observable<HttpEvent<any>>}
     * @memberof TokenInterceptor
     */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('jwtToken');

        // set authorization token
        if (token) {
            request = request.clone({ headers: request.headers.set('Authorization', token) });
        }

        // set Content-Type
        if (!request.headers.has('Content-Type')) {
            request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
        }

        // set Accept
        request = request.clone({ headers: request.headers.set('Accept', 'application/json') });

        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    console.log('event--->>>', event);
                }
                return event;
            }),
            catchError((error: HttpErrorResponse) => {
                let message = '';

                error.error.message instanceof Object ?
                    message = `Error Code: ${error.status}\nMessage: ${error.error.message.errmsg}` :
                    message = `Message: ${error.error.message}`;

                // create error modal data
                let data = new ModalAlertData({
                    title: 'ERROR',
                    content: message,
                    closeButtonLabel: 'Close',
                    alertType: AlertType.ERROR
                })

                this.modalService.openModal(data);

                return throwError(error);
            }));
    }

}

