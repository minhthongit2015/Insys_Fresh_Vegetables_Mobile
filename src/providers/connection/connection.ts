import { WebsocketHandle } from "./websocket";
import { Injectable } from "@angular/core";
import { BluetoothCtl } from "./bluetoothctl";


@Injectable()
export class ConnectionController {
  public websocket: WebsocketHandle;

  constructor(private blsctl: BluetoothCtl) {
    
  }
}