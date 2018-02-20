

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

  public reload(newSensorsState) {
    this.temperature= newSensorsState.temperature;
    this.humidity = newSensorsState.humidity;
    this.light = newSensorsState.light;
    this.ppm = newSensorsState.ppm;
    this.pH = newSensorsState.pH;
  }
}