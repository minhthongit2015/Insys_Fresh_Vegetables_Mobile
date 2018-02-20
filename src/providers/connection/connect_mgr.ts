import { Injectable } from "@angular/core";
import { WebsocketHandle } from "./websocket";
import { BluetoothCtl } from "./bluetoothctl";
import { Garden } from "../../models/garden/garden";

/**
 * Quản lý kết nối.
 * ___
 * #### Hỗ trợ kết nối với độ ưu tiên:
 * 1. LAN (wifi)
 * 2. Bluetooth
 * 3. API
 */
@Injectable()
export class ConnectionManager {
  public websocket: WebsocketHandle;
  public listener_mapping: { [header:string] : (data) => { } };
  private _default_cmd = 255;

  get connecting() { return this.ws.connecting || this.blsctl.connecting; }
  get connected() { return this.ws.connected || this.blsctl.connected; }

  constructor(public blsctl: BluetoothCtl, public ws: WebsocketHandle) {
    this.listener_mapping = { "0|255|255": (data): any => { } };
  }

  public setup(garden: Garden) {
    if (!garden) return
    this.blsctl.setup(garden.bluetooth_addr, (response) => this.onResponse(response));
    this.ws.setup(garden.host, (response) => this.onResponse(response));
  }

  public send(cmds, data, onsuccess: (data) => { }, onfailed=null) {
    if (!cmds.length) cmds = [cmds];
    if (cmds.length == 1) cmds.push(this._default_cmd);
    if (cmds.length == 2) cmds.push(this._default_cmd);
    let header = String.fromCharCode(...cmds);
    let packagez = `${header}\xfe${data}\x00\x00`;

    if (onsuccess) this.listener_mapping[header] = onsuccess;

    if (this.ws.connected) { // If LAN is available then send package via LAN
      this.ws.send(packagez);
    } else {                 // else try to reconnect via LAN
      this.ws.connect(() => {
        this.ws.send(packagez);
      }, () => {             // If LAN is not available then try send via bluetooth
        if (this.blsctl.connected) {  // If the bluetooth connection is already connected then send via bluetooth
          this.blsctl.send(packagez);
        } else {             // If  bluetooth is not connected now, then try connect again and send the package
          this.blsctl.connect(() => {
            this.blsctl.send(packagez);
          }, () => {
            if (onfailed) onfailed();
          });
        }
      })
    }
  }

  public connect(onsuccess=null, onfailed=null) {
    // Try to connect by wifi first (using websocket)
    if (this.connected) {
      onsuccess();
    } else {
      this.ws.connect(onsuccess, () => {
        if (!this.blsctl.connected) {
          this.blsctl.connect(onsuccess, onfailed);
        }
      });
    } 
  }

  public onResponse(response) {
    let unpack, header, cmd, sub1, sub2, data, rest;
    while (response) {
      unpack = this.responseResolve(response);
      header = unpack[0];
      cmd = unpack[1];
      sub1 = unpack[2];
      sub2 = unpack[3];
      data = unpack[4];
      rest = unpack[5];
      this.responseHandle(header, cmd, sub1, sub2, data);
      response = rest;
    }
  }

  public responseResolve(response: string) {
    let pack, rest, header, data, cmd, sub1, sub2;
    pack = response.substr(0, response.indexOf("\x00\x00"));
    rest = response.substr(response.indexOf("\x00\x00")+2);

    pack = pack.split('\xfe');
    header = pack[0];
    data = pack[1];

    cmd = header.charCodeAt(0);
    sub1 = header.charCodeAt(1);
    sub2 = header.charCodeAt(2);

    return [header, cmd, sub1, sub2, data, rest];
  }

  public responseHandle(header, cmd, sub1, sub2, data) {
    for (let mappingHeader in this.listener_mapping) {
      if (mappingHeader == header) this.listener_mapping[mappingHeader](data);
    }
  }
}
