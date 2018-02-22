import { HydroponicCylinder } from "./hydroponic";

export class Garden {
  public name: string;
  public bluetooth_addr: string;  // using in bluetooth connect
  public host: string;            // using in LAN connect (ipv4:port)
  public domain: string;          // using in API connect

  public securityCode: string = '';   // Security code to protect the garden
  public accessToken: string = '';    // token to access the garden central unit
  public hydroponics: HydroponicCylinder[];

  constructor(name: string = '', bluetooth_addr: string = '', host: string = '', domain: string = '', securityCode: string = '', accessToken: string = '') {
    this.name = name;
    this.bluetooth_addr = bluetooth_addr;
    this.host = host;
    this.domain = domain;
    this.securityCode = securityCode;
    this.accessToken = accessToken;
  }

}
