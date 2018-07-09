import { Injectable } from '@angular/core';

import { Garden } from '../../models/garden/garden';
import { GardenSync } from '../connection/sync/garden_sync';
import { ConnectionManager } from '../connection/connect_mgr';
import { Database } from '../../modules/storage/storage';
import { ScheduleControler } from '../../modules/scheduler/scheduler';

// import { API } from '../api/api';
// import { Platform } from 'ionic-angular';

@Injectable()
export class GardenServices {
  private connMgr: ConnectionManager;
  private db: Database;
  private keepUpdateHandle: ScheduleControler;

  constructor(
    public gardenSync: GardenSync
    // public api: API, public platform: Platform
  ) {
    this.db = new Database("Garden");
    // this.api.setServer('');
  }

  setup(connMgr: ConnectionManager) {
    this.connMgr = connMgr
    this.gardenSync.setup(connMgr);
    this.connMgr.attachGardenService(this);
  }

  public discover() {
    // this.connMgr.blsctl.discover((rs) => {
    //   debugger
    // })
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
  public checkConnection(garden: Garden, onsuccess, onfailed=null) {
    this.connMgr.setup(garden);
    this.connMgr.connect(onsuccess, onfailed);
  }
  public checkSecurity(garden, onresult, promptForSecurityCode=true) {
    this.connMgr.setup(garden);
    this.connMgr.checkSecurityCode(() => {
      onresult(true);
    }, () => {
      onresult(false);
      if (promptForSecurityCode) this.connMgr.requireSecurityCode();
    });
  }

  public setSecurityCode(oldSecurityCode: string, securityCode: string, callback) {
    this.connMgr.send([1,2], JSON.stringify([oldSecurityCode, securityCode]), callback);
  }

  public saveGarden(garden: Garden) {
    this.db.insertWithKey(garden, 'Gardens', garden.name);
  }
  public setCurrentGarden(garden: Garden) {
    this.db.insertKey(garden.name, "CurrentGarden");
    this.saveGarden(garden);
  }
  public getCurrentGarden(): Garden | null {
    let currentGardenName = this.db.queryKey("CurrentGarden");
    return currentGardenName ? this.getGardenByName(currentGardenName) : null;
  }
  public getListGarden(): Garden[] {
    return this.db.queryTable('Gardens');
  }
  public getGardenByName(gardenName: string): Garden | null {
    return this.db.queryWithKey('Gardens', gardenName);
  }

  /**
   * - Gửi yêu cầu kèm token tới ``garden`` được chỉ định trong tham số.
   * - Nhận danh sách trụ + danh sách cây trên trụ.
   * @param garden chứa thông tin ``địa chỉ bluetooth`` hoặc ``ipv4`` của raspi
   */
  public getGardenInfo(onresult, onerror=null) {
    this.connMgr.send([2,1,1], '', (data) : any => {
      onresult(JSON.parse(data));
    }, onerror);
  }

  /**
   * [Keep Update Section]
   */
  public keepInfoUpdate(stationId, onresult) {
    this.connMgr.send([2,2,1], stationId, (response) : any => {
      onresult(JSON.parse(response));
    }, () => this.keepInfoUpdate(stationId, onresult));
  }
  public unkeepInfoUpdate() {
    if (this.keepUpdateHandle) this.keepUpdateHandle.stop();
  }

  public getChartRecords(cylinderId: string, onresult) {
    this.connMgr.send([2,2,2], cylinderId, (response) : any => {
      onresult(JSON.parse(response));
    });
  }

  public createNewPlant(cylinderId: string, plantType: string, plantingDate: string, alias: string, onresponse) {
    plantingDate = plantingDate.split("-").reverse().join("/");
    let packagez = [cylinderId, plantType, plantingDate, alias];
    this.connMgr.send([4,1], JSON.stringify(packagez), (data): any => {
      // onresponse(this.gardenSync.parseGardenInfo(data));
    });
  }
  public removePlant(cylinderId, plantId, onresponse) {
    let packagez = [cylinderId, plantId];
    this.connMgr.send([4,2], JSON.stringify(packagez), (data): any => {
      // onresponse(this.gardenSync.parseGardenInfo(data));
    });
  }

  public sendUserCommand(cylinderId: string, equipment_role: string, state: any, callback=null) {
    this.gardenSync.sendUserCommand(cylinderId, equipment_role, state, callback);
  }

}
