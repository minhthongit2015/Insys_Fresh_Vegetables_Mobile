import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subscription } from "rxjs/Subscription";
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/interval';

import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';


export interface IBaseRequest {
    method: string;
    url: string;
    params?: any;   // get using params. post, put, patch, delete using body to send with content-type: application/json
    body?: any;     // using body instead of params to send with content-type: application/json
    headers?: null | {[key:string]: string};   // request headers

    refreshTime?: number;   // schedule time

    map?: any;
    subscribe?: any;
    do?: any;
    catch?: any;

    beforeRequest?: any;    // method is called before make a http request. Return false to cancel http request.
    skipBeforeRequestInSchedule?: boolean; // set to true will skip beforeRequest in schedule
    executeFunc?: any;      // this method will call beforeRequest and then make a http request

    // these follow properties for programmatically purpose only
    subscription?: Subscription;
    observe? : Observable<HttpClient>;
}

@Injectable()
export class BaseServices {
    public requestList: IBaseRequest[]; // save all request, so you can find and call it
                                        // from any where, any time. Or abort all of requests

    constructor(private _http: HttpClient) {
        this.requestList = new Array();
    }

    /**
     * Install an request
     * @param req request configuration
     * @param stored store the request to the request list or not (default is true)
     */
    installRequest(req: IBaseRequest, isStored: boolean = true) {
        let pthis = this;

        // Assign normal function to keep data through normally
        let defaultHandler = (e: any) => { return e; };
        if (!req.map) req.map = defaultHandler;
        if (!req.do) req.do = defaultHandler;
        if (!req.subscribe) req.subscribe = defaultHandler;
        if (!req.catch) req.catch = defaultHandler;
        if (!req.params) req.params = "";
        req.method = req.method.toLowerCase();

        let opts =  { params: new HttpParams(), headers: new HttpHeaders(), body: req.body };
        for (let param in req.params) opts.params.set(param, req.params[param]);
        for (let header in req.headers) opts.headers.set(header, req.headers[header]);

        // Funtion that execute the request
        req.executeFunc = function(skipBeforeRequest?: boolean, mustRun?: boolean, callback?: any) {
            // Do some thing before make a request
            if (!skipBeforeRequest && req.beforeRequest && !req.beforeRequest() && !mustRun) return;

            // Update Request options
            for (let param in req.params) opts.params = opts.params.set(param, req.params[param]);
            for (let header in req.headers) opts.headers = opts.headers.set(header, req.headers[header]);
            opts.body = this.body;

            try {
                // pthis._http.request(req.method, this.url, opts).catch((error) => this.catch(error, 1, req))          // Request
                //     .map((rs) => this.map(rs)).catch((error) => this.catch(error, 2))               // Map
                //     .subscribe((rs) => this.subscribe(rs), (error)=> this.catch(error, 3), () => {  // Subscribe
                //         if (callback) callback();
                //         this.do();
                //     });
                let observe = pthis._http.request(req.method, this.url, opts);
                observe.subscribe(req.subscribe);
                return observe;
            } catch (e) {
                console.warn(e);
            }
        }

        // If config refresh time, then setup an interval for that
        if (req.refreshTime) {
            req.subscription = Observable.interval(req.refreshTime).subscribe(() => req.executeFunc(req.skipBeforeRequestInSchedule, true));
        }

        // Execute request one time right after install it
        req.observe = req.executeFunc();
        req.observe.share();

        // Save the request
        if (isStored) this.requestList.push(req);

        // Return a completed request object
        return req;
    }

    /**
     * Uninstall an request (remove interval and remove from request list)
     * @param api api: IAPI to uninstall
     */
    uninstallRequest(req: IBaseRequest) {
        if (!req) return;
        this.suspendSchedule(req);
        let index = this.requestList.findIndex((reqz) => this.isEqual(reqz, req));
        if (index >= 0) req = this.requestList.splice(index, 1)[0];
    }

    /**
     * Suspend a schedule
     */
    suspendSchedule(req: IBaseRequest) {
        // if (req && req.subscription && !req.subscription.closed) req.subscription.unsubscribe();
        if (req.subscription) req.subscription.unsubscribe();// fast and furious
    }

    /**
     * Resume a schedule
     */
    resumeSchedule(req: IBaseRequest) {
        this.suspendSchedule(req);
        if (req.refreshTime && req.refreshTime > 0) {
            req.subscription = Observable.interval(req.refreshTime).subscribe(()=>req.executeFunc(req.skipBeforeRequestInSchedule, true));
            req.executeFunc();
        }
    }

    /**
     * Check if two request is equal (base on [method, url, params, body])
     */
    isEqual(req1: IBaseRequest, req2: IBaseRequest): boolean {
        return this.requestStringify(req1) == this.requestStringify(req2);
    }

    /**
     * Stringify an request using 4 properties: method, url, parameters and request body.
     */
    requestStringify(req: IBaseRequest): string {
        return JSON.stringify([req.method, req.url, req.params, req.body]);
    }
}
