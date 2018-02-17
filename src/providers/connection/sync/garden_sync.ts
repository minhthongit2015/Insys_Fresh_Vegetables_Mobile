import { Injectable } from "@angular/core";
import { ConnectionManager } from "../connect_mgr";

import { HydroponicCylinder } from "../../../models/garden/hydroponic";
import { Plant } from "../../../models/garden/plant";
import { Equipments } from "../../../models/garden/equipments";
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

  public getListHydroponic(onresult) : void {
    // > Gửi yêu cầu kèm token
    // < Nhận danh sách trụ + danh sách cây trên trụ
    this.connMgr.send([2,1], '', (data) : any => {
      let parsedHydroponics = JSON.parse(data);
      let hydroponics: HydroponicCylinder[] = [];
      for (let parsedHydroponic of parsedHydroponics) {
        let plants: Plant[] = [];
        for (let plant of parsedHydroponic['plants'])
          plants.push(new Plant(plant['alias'], plant['plant_type'], plant['plant_id'], plant['planting_date']));
  
        let parsedEquipments = parsedHydroponic['equipment_set'];
        let parsedSensors = parsedEquipments['sensors'];
        
        let sensors = new Sensors(parsedSensors['temperature'],
                                  parsedSensors['humidity'],
                                  parsedSensors['light'],
                                  parsedSensors['ppm'],
                                  parsedSensors['pH']);
        let equipments: Equipments = new Equipments(parsedEquipments['pump'],
                                                    parsedEquipments['nutrient'],
                                                    parsedEquipments['light'],
                                                    sensors,
                                                    parsedEquipments['hardware'],
                                                    parsedEquipments['environment'],
                                                    parsedEquipments['automation']);
        let hydroponic: HydroponicCylinder = new HydroponicCylinder(parsedHydroponic['id'], parsedHydroponic['name'], plants, equipments);
        hydroponics.push(hydroponic);
      }
      onresult(hydroponics);
    })
  }

  public sendUserCommand(cylinderId: string, equipment: string, state: any, callback) {
    this.connMgr.send([3], JSON.stringify([cylinderId, equipment, state]), callback);
  }
}