

export class Plant {
  chartData?: any[];
  humidity: number;
  temperature: number;
  pH: number;
  pins: any;
  auto: boolean;
  ipv4?: string;
  constructor(fields: any) {
    // Quick and dirty extend/assign fields to this model
    for (const f in fields) {
      this[f] = fields[f];
    }
  }
}