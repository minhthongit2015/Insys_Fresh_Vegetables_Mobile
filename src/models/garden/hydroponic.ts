import { Plant } from "./plant";
import { EquipmentSet } from "./equipment_set";

export class HydroponicCylinder {
  public name?: string;
  public id?: string;
  public plants?: Plant[];
  public equipmentSet?: EquipmentSet;

  constructor(id: string, name: string, plants: Plant[], equipmentSet: EquipmentSet) {
    this.id = id;
    this.name = name;
    this.plants = plants;
    this.equipmentSet = equipmentSet;
  }

  public reload(newCylinderState) {
    this.equipmentSet.reload(newCylinderState.equipment_set);
  }
}