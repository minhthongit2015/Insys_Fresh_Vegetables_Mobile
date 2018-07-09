import { Injectable } from "@angular/core";
import { ConnectionManager } from "../connect_mgr";
import { StationModel } from "../../../models/garden/station";
import { UserPlantModel } from "../../../models/garden/user_plant";
import { EquipmentModel } from "../../../models/garden/equipment";



@Injectable()
export class GardenSync {
  // private saved_garden: Garden;
  private connMgr: ConnectionManager;

  constructor() {

  }

  public setup(connMgr: ConnectionManager) {
    this.connMgr = connMgr;
  }

  public handshake() {
    // > Gửi thông tin tài khoản tới raspi
    // < nhận access token
  }


  public updateCylinderInfo(cylinderId: string, onresult) {
  }

  public getChartRecords(cylinderId: string, onresult) {
  }

  public sendUserCommand(cylinderId: string, equipment: string, state: any, callback) {
    this.connMgr.send([3], JSON.stringify([cylinderId, equipment, state]), callback);
  }
}