import { UserPlantModel } from "./user_plant";
import { EquipmentModel } from "./equipment";


export class StationModel {
  public id?: string;
  public name?: string;
  public plants?: UserPlantModel[] = [];
  public equipments_info: any[];
  public equipments: EquipmentModel[] = [];

  get _pump() {
    if (!this.equipments) return null;
    return this.equipments.find(eq => eq.roles.indexOf("bump") > 0);
  }
  public get pump() : boolean {
    return this._pump != null ? this._pump.state : false;
  }
  public set pump(state) {
    this._pump.state = state;
  }
  
  get _nutri() {
    if (!this.equipments) return null;
    return this.equipments.find(eq => eq.roles.indexOf("nutri") > 0);
  }
  public get nutri() : boolean {
    return this._nutri != null ? this._nutri.state : false;
  }
  public set nutri(state) {
    this._nutri.state = state;
  }
  
  get _light() {
    if (!this.equipments) return null;
    return this.equipments.find(eq => eq.roles.indexOf("light") > 0);
  }
  public get light() : boolean {
    return this._light != null ? this._light.state : false;
  }
  public set light(state) {
    this._light.state = state;
  }


  public get temp() : boolean {
    if (!this.equipments) return null;
    let temp = this.equipments.find(eq => eq.values.temperature != null);
    return temp != null ? temp.values.temperature : false;
  }
  public get humi() : boolean {
    if (!this.equipments) return null;
    let humi = this.equipments.find(eq => eq.values.humidity != null);
    return humi != null ? humi.values.humidity : false;
  }
  public get ppm() : boolean {
    if (!this.equipments) return null;
    let ppm = this.equipments.find(eq => eq.values.ppm != null);
    return ppm != null ? ppm.values.ppm : false;
  }
  public get pH() : boolean {
    if (!this.equipments) return null;
    let pH = this.equipments.find(eq => eq.values.pH != null);
    return pH != null ? pH.values.pH : false;
  }
  public get lightLevel() : boolean {
    if (!this.equipments) return null;
    let lightLevel = this.equipments.find(eq => eq.values.light != null);
    return lightLevel != null ? lightLevel.values.light : false;
  }

  constructor(dict: any) {
    this.id = dict.id;
    this.name = dict.name;
    this.equipments_info = dict.equipments;
  }

  public update(station, equipments, userPlants): any {
    this.name = station.name;
    this.equipments_info = station.equipments_info;
    this.attach_equipments(equipments);
    this.attach_user_plants(userPlants);
  }

  public attach_equipments(equipments: EquipmentModel[]) {
    for (let equip of equipments) {
      let find = this.equipments_info.find(eq => eq.id == equip.id);
      if (find && this.equipments.indexOf(equip) < 0) {
        this.equipments.push(equip);
      }
    }
  }

  public attach_user_plants(userPlants: UserPlantModel[]) {
    for (let plant of userPlants) {
      if (plant.location == this.id && this.plants.indexOf(plant) < 0) {
        this.plants.push(plant);
      }
    }
  }
}