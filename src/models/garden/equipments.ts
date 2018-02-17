import { Sensors } from "./sensors";

export class Equipments {
  public pump: boolean;
  public nutrient: boolean;
  public light: boolean;
  public hardware: boolean;
  public environment: boolean;
  private _automation: boolean;
  public get automation(): boolean { return this._automation; }
  public set automation(state: boolean) {
    this._automation = state;
    if (state) {
      this.pump = false;
      this.nutrient = false;
      this.light = false;
    }
  }
  
  public sensors: Sensors;

  constructor(pump: boolean, nutrient: boolean, light: boolean, sensors: Sensors, hardware: boolean, environment: boolean, automation: boolean) {
    this.pump = pump;
    this.nutrient = nutrient;
    this.light = light;
    this.sensors = sensors;
    this.hardware = hardware;
    this.environment = environment;
    this.automation = automation;
  }
}