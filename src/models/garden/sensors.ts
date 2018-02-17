

export class Sensors {
  public temperature: number;
  public humidity: number;
  public light: number;
  public ppm: number;
  public pH: number;

  constructor(temperature: number, humidity: number, light: number, ppm: number, pH: number) {
    this.temperature= temperature;
    this.humidity = humidity;
    this.light = light;
    this.ppm = ppm;
    this.pH = pH;
  }
}