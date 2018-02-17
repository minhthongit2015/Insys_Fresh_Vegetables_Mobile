import { HydroponicCylinder } from "./hydroponic";

export class Garden {
  public bluetooth_addr: string;  // using in bluetooth connect
  public host: string;            // using in LAN connect (ipv4:port)
  public domain: string;          // using in API connect

  public garden_token: string;    // token access the garden central unit
  public hydroponics: HydroponicCylinder[];

  constructor(bluetooth_addr: string = '', host: string = '', domain: string = '') {
    this.bluetooth_addr = bluetooth_addr;
    this.host = host;
    this.domain = domain;
  }

}
