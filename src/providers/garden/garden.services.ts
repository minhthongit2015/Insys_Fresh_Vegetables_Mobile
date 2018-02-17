import { Injectable } from '@angular/core';

import { Garden } from '../../models/garden/garden';
import { GardenSync } from '../connection/sync/garden_sync';
import { ConnectionManager } from '../connection/connect_mgr';

// import { API } from '../api/api';
// import { Platform } from 'ionic-angular';

@Injectable()
export class GardenServices {
  private connMgr: ConnectionManager;


  constructor(
    public gardenSync: GardenSync
    // public api: API, public platform: Platform
  ) {
    // this.api.setServer('');
  }

  setup(connMgr: ConnectionManager) {
    this.connMgr = connMgr
    this.gardenSync.setup(connMgr);
  }

  public discover() {
    this.connMgr.blsctl.discover((rs) => {
      debugger
    })
  }

  public handshake(bladdr: string, callback) {
    this.connMgr.setup(new Garden(bladdr));
    this.connMgr.connect(() => {
      this.connMgr.send([1, 1], undefined, (data) : any => {
        debugger
        if (callback) callback(data);
      })
    });
  }

  /**
   * - Gửi yêu cầu kèm token tới ``garden`` được chỉ định trong tham số.
   * - Nhận danh sách trụ + danh sách cây trên trụ.
   * @param garden chứa thông tin ``địa chỉ bluetooth`` hoặc ``ipv4`` của raspi
   */
  public getListHydroponic(onresult) {
    this.gardenSync.getListHydroponic(onresult)
  }

  public sendUserCommand(cylinderId: string, equipment: string, state: any, callback=null) {
    this.gardenSync.sendUserCommand(cylinderId, equipment, state, callback);
  }

}
