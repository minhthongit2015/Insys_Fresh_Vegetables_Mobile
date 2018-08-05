import { UserPlantModel } from "./user_plant";


export class StationModel {
  public id?: string;
  public name?: string;
  public type?: string;
  public plants?: UserPlantModel[] = [];

  public automation_mode = null;
  public pump = null;
  public nutri = null;
  public led = null;
  public misting = null;

  public temperature = null;
  public humidity = null;
  public light = null;
  public ppm = null;
  public pH = null;

  constructor(dict: any) {
    this.id = dict.id;
    this.update(dict);
  }

  public update(newStation: any) {
    this.name = newStation.name != null ? newStation.name : this.name;
    this.type = newStation.type != null ? newStation.type : this.type;

    this.temperature = newStation.temperature || this.temperature;
    this.humidity = newStation.humidity || this.humidity;
    this.light = newStation.light != null ? newStation.light : this.light;
    this.ppm = newStation.ppm || this.ppm;
    this.pH = newStation.pH || this.pH;

    this.automation_mode = newStation.automation_mode != null ? newStation.automation_mode : this.automation_mode;
    this.pump = newStation.pump != null ? newStation.pump : this.pump;
    this.nutri = newStation.nutri != null ? newStation.nutri : this.nutri;
    this.led = newStation.led != null ? newStation.led : this.led;
    this.misting = newStation.misting != null ? newStation.misting : this.misting;

    if (newStation.plants != null) {
      this.attach_user_plants(newStation.plants);
    }
  }

  public attach_user_plants(userPlants: any[]) {
    this.plants = this.plants.filter(plant => userPlants.find(p => p.plant_id == plant.id));

    for (let plant of userPlants) {
      let find = this.plants.find(p => p.id == plant.plant_id);
      if (find) find.update(plant);
      else this.plants.push(new UserPlantModel(plant));
    }
  }
}