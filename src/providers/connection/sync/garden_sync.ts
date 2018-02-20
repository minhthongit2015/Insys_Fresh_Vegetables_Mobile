import { Injectable } from "@angular/core";
import { ConnectionManager } from "../connect_mgr";

import { HydroponicCylinder } from "../../../models/garden/hydroponic";
import { Plant } from "../../../models/garden/plant";
import { EquipmentSet } from "../../../models/garden/equipment_set";
import { Sensors } from "../../../models/garden/sensors";




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

  public getListHydroponic(onresult, onerror=null) : void {
    // > Gửi yêu cầu kèm token
    // < Nhận danh sách trụ + danh sách cây trên trụ
    this.connMgr.send([2,1], '', (data) : any => {
      onresult(this.parseListCylinders(data));
    }, onerror);
  }

  public parseListCylinders(data) {
    let parsedHydroponics = JSON.parse(data);
    let hydroponics: HydroponicCylinder[] = [];
    for (let parsedHydroponic of parsedHydroponics) {
      let plants: Plant[] = [];
      for (let plant of parsedHydroponic['plants'])
        plants.push(new Plant(plant['alias'], plant['plant_type'], plant['plant_id'], plant['planting_date'], plant['harvest_time']));

      let parsedEquipments = parsedHydroponic['equipment_set'];
      let parsedSensors = parsedEquipments['sensors'];
      
      let sensors = new Sensors(parsedSensors['temperature'],
                                parsedSensors['humidity'],
                                parsedSensors['light'],
                                parsedSensors['ppm'],
                                parsedSensors['pH']);
      let equipments: EquipmentSet = new EquipmentSet(parsedEquipments['pump'],
                                                  parsedEquipments['nutrient'],
                                                  parsedEquipments['light'],
                                                  sensors,
                                                  parsedEquipments['hardware'],
                                                  parsedEquipments['environment'],
                                                  parsedEquipments['automation']);
      let hydroponic: HydroponicCylinder = new HydroponicCylinder(parsedHydroponic['id'], parsedHydroponic['name'], plants, equipments);
      hydroponics.push(hydroponic);
    }
    return hydroponics;
  }

  public updateCylinderInfo(cylinderId: string, onresult) {
    this.connMgr.send([2,2,1], cylinderId, (response) : any => {
      onresult(JSON.parse(response));
    });
  }

  public getChartRecords(cylinderId: string, onresult) {
    this.connMgr.send([2,2,2], cylinderId, (response) : any => {
      onresult(JSON.parse(response));
    });
  }

  public sendUserCommand(cylinderId: string, equipment: string, state: any, callback) {
    this.connMgr.send([3], JSON.stringify([cylinderId, equipment, state]), callback);
  }
}