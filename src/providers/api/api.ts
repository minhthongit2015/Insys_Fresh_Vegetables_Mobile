import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IBaseRequest, BaseServices } from './baseapi';
import { Observable } from 'rxjs/Observable';
import { UserModule } from '../providers';

export interface IBaseAPI extends IBaseRequest {
  path?: string;
  useLocalStorage?: boolean;      // using local storage to save result or not
  localStorageKey?: string;       // primary key of each record (if not set then [method, url, params, body] will be use as primary key)
  useSessionStorage?: boolean;    // using session storage to save result or not
  sessionStorageKey?: string;     // primary key of each record (if not set then [method, url, params, body] will be use as primary key)
}

@Injectable()
export class API extends BaseServices {
  server: string = 'https://example.com/api/v1';
  user: UserModule;

  constructor(public http: HttpClient) {
    super(http);
    this.user = new UserModule();
  }

  setServer(server: string) {
    this.server = server
  }

  /**
   * Install an API to using
   * @param api api config
   * @param isStored store the request to the request list or not (default is true)
   * @param overrideAPISubscribe set to true will discard default feature "save to storage". Use with beforeRequest to use your own beforeRequest
   * @param beforeRequest override default beforeRequest of API service (default is get data from local or session storage by key is combine of [method, url, params, body])
   */
  installAPI(api: IBaseAPI, isStored: boolean = true, overrideAPISubscribe?: boolean, beforeRequest?: any): IBaseAPI {
    let pthis = this;
    if (api.useLocalStorage || api.useSessionStorage) {
      // include stage "save to storage" after request successed
      let cursubscribe = api.subscribe;
      if (!overrideAPISubscribe) api.subscribe = (data: any, dontsave: boolean) => {
        if (!dontsave) {
          if (api.useLocalStorage) {   // save to local storage
            let localStorageKey: string = api.localStorageKey ? api.localStorageKey : pthis.requestStringify(api);
            pthis.useStorage(localStorage, localStorageKey, data);
          }
          if (api.useSessionStorage) { // save to session storage
            let sessionStorageKey: string = api.sessionStorageKey ? api.sessionStorageKey : pthis.requestStringify(api);
            pthis.useStorage(sessionStorage, sessionStorageKey, data);
          }
        }
        cursubscribe(data);         // continue do user subscribe
      }

      // include stage check if it have the valid data in storage
      if (!beforeRequest) api.beforeRequest = (): boolean => {
        let pass1 = true, pass2 = true, data: any;
        if (api.useLocalStorage) {
          let localStorageKey: string = api.localStorageKey ? api.localStorageKey : pthis.requestStringify(api);
          data = pthis.useStorage(localStorage, localStorageKey);
          if (data != null && api.refreshTime && ((new Date()).getTime() - data.time < api.refreshTime)) {
            Observable.of(data.data).subscribe((data: any) => api.subscribe(data, true));
            pass1 = false;
          }
        }
        if (api.useSessionStorage) {
          let sessionStorageKey: string = api.sessionStorageKey ? api.sessionStorageKey : pthis.requestStringify(api);
          data = pthis.useStorage(sessionStorage, sessionStorageKey);
          if (data != null && api.refreshTime && ((new Date()).getTime() - data.time < api.refreshTime)) {
            Observable.of(data.data).subscribe((data: any) => api.subscribe(data, true));
            pass2 = false;
          }
        }
        if ((api.useLocalStorage && !pass1) || (api.useSessionStorage && !pass2))
          return false;
        else return true;
      };
      else api.beforeRequest = beforeRequest;

      // Because in API, the beforeRequest() call just fetch data from storage. So we will skip it
      // in schedule to avoid missing schedule
      api.skipBeforeRequestInSchedule = true;
    }

    // Adjust to send with json type
    if (api.method != "get" && api.params) {
      api.body = JSON.stringify(api.params);
      delete api.params;
      api.headers = {"Content-Type": "application/json"};
    }

    // Adding Auth header
    if (this.user) {
      let userToken = this.user.getUserToken();
      if (!api.headers && userToken) api.headers = { Auth: userToken };
      // else this.user.logout(true);
    }

    // Adjust catch function for only cath by subscribe when user want to handle the request error
    if (api.catch) {
      var savedCatch = api.catch;
      api.catch = (err: any, stage: number, req: IBaseRequest) => {
        if (stage == 1 && err.status == 401) { // Unauthorize
          // if (pthis.accountService) pthis.accountService.logout(true);
        } else if (stage == 1 && savedCatch.length >= 2) {// for now, just catch request error stage
          savedCatch(err, stage, req);//saved Catch in API is origin api subscribe
        } else if (stage == 1 && savedCatch.length == 1) {
          // api.subscribe = (e) => { };
        }
      }
    }
    
    // install api
    return this.installRequest(api, isStored);
  }

  /**
   * Using local/session storage to improve api performance
   * @param storage storage type (localStorage | sessionStorage)
   * @param name record name
   * @param value record value
   */
  useStorage(storage: any, name: string, value?: string): any {
    if (value == undefined) {//get
      let data = storage.getItem(name);
      if (data) {
        let time: string = data.split(":")[0];
        return { time: time, data: JSON.parse(data.substr(time.length + 1)) };
      }
      else return null;
    } else {//set
      storage.setItem(name, new Date().getTime() + ":" + JSON.stringify(value))
    }
  }

  /**
   * Uninstall an api (remove interval and remove from request list)
   * @param api api: IAPI to uninstall
   */
  uninstallAPI(api: IBaseAPI) {
    this.uninstallRequest(api);
  }

  /**
   * Install a get api
   * @param url api url
   * @param params request parameter
   * @param refreshTime time schedule. Set to 0 to prevent stored api to api list
   * @param storage sessionStorage or localStorage. Set to null will disable this feature
   * @param subscribe subscribe stage
   * @param map map stage. default is "(rs: any) => rs.json().data"
   */
  installGetAPI(path: string, params: any, refreshTime: number, storage: null | Storage,
    subscribe: any, map: any = (rs: any) => rs.json().data, overrideAPISubscribe?: boolean, beforeRequest?: any) {
    return this.installAPI({
      method: "get", url: this.server + path, params, refreshTime,
      map: map, subscribe, catch: subscribe,
      useSessionStorage: storage == sessionStorage,
      useLocalStorage: storage == localStorage
    }, refreshTime != 0 && refreshTime != null, overrideAPISubscribe, beforeRequest)
  }
  installGetListAPI(url: string, params: any, refreshTime: number, storage: null | Storage, subscribe: any) {
    return this.installGetAPI(url, params, refreshTime, storage, subscribe, (rs: any) => rs.json().data.items);
  }

  installPutAPI(path: string, params: any, subscribe: any, overrideAPISubscribe?: boolean, beforeRequest?: any) {
    return this.installAPI({
      url: this.server + path, method: "put", params,
      map: (rs: any) => rs.json(), subscribe, catch: subscribe
    }, false, overrideAPISubscribe, beforeRequest);
  }

  installPostAPI(path: string, params: any, subscribe: any, overrideAPISubscribe?: boolean, beforeRequest?: any) {
    return this.installAPI({
      url: this.server + path, method: "post", params,
      map: (rs: any) => rs.json(), subscribe, catch: subscribe
    }, false, overrideAPISubscribe, beforeRequest);
  }

  installDeleteAPI(path: string, params: any, subscribe: any, overrideAPISubscribe?: boolean, beforeRequest?: any) {
    return this.installAPI({
      url: this.server + path, method: "delete", params,
      map: (rs: any) => rs.json(), subscribe, catch: subscribe
    }, false, overrideAPISubscribe, beforeRequest);
  }

  get(path: string, params: any, headers?: {}) {
    return this.installAPI({
      url: this.server + path, method: "get", params, headers
    }, false);
  }
  post(path: string, params: any, headers?: {}) {
    return this.installAPI({
      url: this.server + path, method: "post", body: JSON.stringify(params), headers
    }, false);
  }
  put(path: string, params: any, headers?: {}) {
    return this.installAPI({
      url: this.server + path, method: "put", params, headers
    }, false);
  }
}
