

export class Plant {
  public alias?: string;
  public plantType?: string;
  public plantId?: string;
  public plantingDate?: string;
  public harvestTime?: number;


  get _plantingDate() : Date {
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
    return this.dayPass/this.harvestTime*100;
  }

  constructor(alias: string, plantType: string, plantId: string, plantingDate: string, harvestTime: number) {
    this.alias = alias;
    this.plantType = plantType;
    this.plantId = plantId;
    this.plantingDate = plantingDate;
    this.harvestTime = harvestTime;
  }
}