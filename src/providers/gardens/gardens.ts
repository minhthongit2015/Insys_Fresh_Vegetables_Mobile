import { Injectable } from '@angular/core';

import { API } from '../api/api';
import { Platform } from 'ionic-angular';

@Injectable()
export class Gardens {

  constructor(public api: API, public platform: Platform) {
    this.api.setServer('');
  }

  query(params?: any) {
    var url = "";
    if(this.platform.is('android')) url = "/android_asset/www/assets";
    else url = "../assets";

    return this.api.get(url+'/demo_data/gardens.json', params);
  }



}
