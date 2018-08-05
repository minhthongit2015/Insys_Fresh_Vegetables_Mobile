import { Injectable } from '@angular/core';

import { Garden } from '../../models/garden/garden';
import { ConnectionManager } from '../connection/connect_mgr.1';
import { Database } from '../../modules/storage/storage';
import { ScheduleControler } from '../../modules/scheduler/scheduler';
import { SmartGardenWebSocket } from '../connection/smwebsocket';
import { ThrowStmt } from '../../../node_modules/@angular/compiler';

// import { API } from '../api/api';
// import { Platform } from 'ionic-angular';

@Injectable()
export class GardenServices {
  private connMgr: ConnectionManager;
  private gardenSock: SmartGardenWebSocket;
  private db: Database;
  private stationSock: SmartGardenWebSocket;

  constructor(
    // public gardenSync: GardenSync
    // public api: API, public platform: Platform
  ) {
    this.db = new Database("Garden");
    // this.api.setServer('');
  }

  setup(connMgr: ConnectionManager, gardenSock: SmartGardenWebSocket) {
    this.connMgr = connMgr;
    this.gardenSock = gardenSock;
  }



  /// Thao tác với Database

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



  /// Thao tác với Raspi Server

  /**
   * Giữ đồng bộ thông tin cơ bản vườn
   * - Nhận danh sách trụ + danh sách cây trên trụ.
   * - Trả về kết quả kiểu json object
   */
  public keepRefreshGardenInfo(onResponse) {
    this.connMgr.registerChannel(this.gardenSock, [2,1,1],
      {
        "open": (rs) => {
          this.connMgr.send(this.gardenSock, [2,1,1], '');
        },
        "message": (rs) : any => {
          rs.response = JSON.parse(rs.msg);
          onResponse(rs);
        }, "error": (e) => {
          // debugger
        }, "close": (e) => {
          // debugger
        }
      });
    this.gardenSock.keepOpen();
  }

  public keepStationUpdate(stationId, onResponse) {
    this.connMgr.registerChannel(this.gardenSock, [2,2,1],
      {
        "open": (rs) => {
          this.connMgr.send(this.gardenSock, [2,2,1], stationId);
        },
        "message": (rs) : any => {
          rs.response = JSON.parse(rs.msg);
          onResponse(rs);
        }, "error": (e) => {
          // debugger
        }, "close": (e) => {
          // debugger
        }
      });
  }
  public unkeepStationUpdate() {
    // this.connMgr.removeConnection(this.stationSock);
  }

  /**
   * [Keep Update Section]
   */

  // public getChartRecords(cylinderId: string, onresult) {
  //   this.connMgr.send([2,2,2], cylinderId, (response) : any => {
  //     onresult(JSON.parse(response));
  //   });
  // }

  // public createNewPlant(cylinderId: string, plantType: string, plantingDate: string, alias: string, onresponse) {
  //   plantingDate = plantingDate.split("-").reverse().join("/");
  //   let packagez = [cylinderId, plantType, plantingDate, alias];
  //   this.connMgr.send([4,1], JSON.stringify(packagez), (data): any => {
  //     // onresponse(this.gardenSync.parseGardenInfo(data));
  //   });
  // }
  // public removePlant(cylinderId, plantId, onresponse) {
  //   let packagez = [cylinderId, plantId];
  //   this.connMgr.send([4,2], JSON.stringify(packagez), (data): any => {
  //     // onresponse(this.gardenSync.parseGardenInfo(data));
  //   });
  // }

  // public sendUserCommand(stationId: string, equipmentRole: string, state: any, callback=null) {
  //   this.connMgr.send([3], JSON.stringify([stationId, equipmentRole, state]), callback);
  // }



  /// Nâng cấp bảo mật

  public checkSecurity(garden, onresult, promptForSecurityCode=true) {
    // this.connMgr.setup(garden);
    // this.connMgr.checkSecurityCode(() => {
    //   onresult(true);
    // }, () => {
    //   onresult(false);
    //   if (promptForSecurityCode) this.connMgr.requireSecurityCode();
    // });
  }

  public setSecurityCode(oldSecurityCode: string, securityCode: string, callback) {
    // this.connMgr.send([1,2], JSON.stringify([oldSecurityCode, securityCode]), callback);
  }

}
