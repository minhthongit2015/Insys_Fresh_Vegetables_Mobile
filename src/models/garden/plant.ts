

export class Plant {
  public alias?: string;
  public plantType?: string;
  public plantId?: string;
  public plantingDate?: string;

  constructor(alias: string, plantType: string, plantId: string, plantingDate: string) {
    this.alias = alias;
    this.plantType = plantType;
    this.plantId = plantId;
    this.plantingDate = plantingDate;
  }
}