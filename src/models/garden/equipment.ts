

export class EquipmentModel {
  public id: string;
  public type: string;
  public state: boolean;
  public values: any;
  public roles: string[];

  constructor(dict) {
    this.id = dict.id;
    this.type = dict.type;
    this.state = dict.state;
    this.values = dict.values || {};
    this.roles = dict.roles || [];
  }
}