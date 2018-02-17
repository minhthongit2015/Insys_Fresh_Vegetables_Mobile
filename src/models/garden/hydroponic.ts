import { Plant } from "./plant";
import { Equipments } from "./equipments";

export class HydroponicCylinder {
  public name?: string;
  public id?: string;
  public plants?: Plant[];
  public equipments?: Equipments;

  constructor(id: string, name: string, plants: Plant[], equipments: Equipments) {
    this.id = id;
    this.name = name;
    this.plants = plants;
    this.equipments = equipments;
  }
}