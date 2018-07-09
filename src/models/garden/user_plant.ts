

export class UserPlantModel {
  public alias?: string;
  public type?: string;
  public id?: string;
  public plantingDate?: string;
  public harvestTime?: number;
  public location?: string;

  get _plantingDate() : Date { // d/m/yyyy
    if (!this.plantingDate) return null;
    let plantingDate = this.plantingDate.split("/").reverse();
    return new Date(+plantingDate[0], +plantingDate[1]-1, +plantingDate[2]);
  }
  get szPlantingDate() {
    return `${this._plantingDate.getDate()}/${this._plantingDate.getMonth()+1}`;
  }
  get dayPass() {
    return Math.round((new Date().getTime() - this._plantingDate.getTime())/86400000);
  }
  get endDate() {
    let endDate = new Date(this._plantingDate);
    endDate.setDate(endDate.getDate() + this.harvestTime);
    return endDate;
  }
  get szEndDate() {
    return `${this.endDate.getDate()}/${this.endDate.getMonth()+1}`;
  }
  get progress() {
    if (!this.harvestTime) return 50;
    let progress = this.dayPass/this.harvestTime*100;
    return progress < 0 ? 0 : (progress > 100 ? 100 : progress);
  }

  constructor(dict: any) {
    this.id = dict.plant_id;
    this.update(dict);
  }

  public update(newPlant) {
    this.alias = newPlant.alias;
    this.type = newPlant.plant_type;
    this.plantingDate = newPlant.planting_date;
    this.harvestTime = newPlant.harvest_time;
    this.location = newPlant.location;
  }
}