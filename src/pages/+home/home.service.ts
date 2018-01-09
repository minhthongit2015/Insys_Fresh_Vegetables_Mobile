import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { API, IBaseAPI } from '../../providers/api/api';
import { Subscription } from 'rxjs/Subscription';


@Injectable()
export class HomeServices extends API {
  constructor(public http: HttpClient) {
    super(http);
  }

  startSynchronizeThread(refreshTime, subscribe): IBaseAPI {
    let api: IBaseAPI = this.installGetAPI('/api/device', null, refreshTime, null, subscribe);
    return api;
  }

  onWater(garden, subscribe) {
    let api = this.installPutAPI("/api/device/Buttons/Active", { localDeviceId: garden.managerDeviceId, buttonId: 4, active: garden.config.water_manure }, subscribe);
    return api;
  }

  installGetChartAPI(refreshTime, deviceId, start, subscribe) {
    let api = this.installGetAPI("/api/device/getChart", {localdeviceId: deviceId, timestampStart: start}, refreshTime, sessionStorage, subscribe);
    return api;
  }

  getChartBls: Subscription;
  installGetChartViaBluetooth(refreshTime, scheduler) {
    this.getChartBls = Observable.interval(refreshTime).subscribe(() => scheduler());
  }
  uninstallGetChartViaBluetooth() {
    try { this.getChartBls.unsubscribe() }
    catch { }
  }
}