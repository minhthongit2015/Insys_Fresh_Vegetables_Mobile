import { Injectable } from "@angular/core";

import { WebsocketHandle } from "./websocket";

// import { BluetoothCtl } from "./bluetoothctl";
import { Garden } from "../../models/garden/garden";
import { Security } from "./security";
import { AlertController } from "ionic-angular";
import { GardenServices } from "../providers";
import { SmartGardenWebSocket } from "./smwebsocket";
import { Package, SmartGardenProtocol } from "./connection";

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
  public alertCtrl: AlertController;

  // Lưu các sự kiện tương ứng với các cổng
  public listener_mapping: { [header:string] : any };
  
  public security: Security;

  public gardenSrv: GardenServices;

  private proto: SmartGardenProtocol;
  get pkgcfg() { return this.proto.pkgcfg }

  constructor() {
    this.listener_mapping = {};
    this.security = new Security();
    this.proto = new SmartGardenProtocol();
  }

  public registerChannel(target: SmartGardenWebSocket, cmds, callbacks) {
    if (!cmds || !callbacks) return;
    let headers = this.proto.buildHeader(cmds);
    if (!this.listener_mapping[headers]) {
      this.listener_mapping[headers] = {};
      this.listener_mapping[headers].target = target;
      this.listener_mapping[headers].callbacks = [];
      this.listener_mapping[headers].callbacks.push(callbacks);
    }
    if (target.open && callbacks["open"]) callbacks["open"]();
  }

  public removeConnection(target: SmartGardenWebSocket) {
    target.close();
    for (let mappingHeader in this.listener_mapping) {
      if (this.listener_mapping[mappingHeader].target == target) {
        delete this.listener_mapping[mappingHeader];
      }
    }
  }

  /**
   * Giữ kết nối tới server
   */
  public keepConnection(ws: SmartGardenWebSocket, onOpen, onError, onClose) {
    ws.sock.addEventListener("close", () => {
      ws.connect(onOpen, onError);
    });
    ws.sock.addEventListener("error", () => {
      ws.connect(onOpen, onError);
    });
  }

  public send(target: SmartGardenWebSocket, cmds, msg, callbacks=null) {
    if (!target.packageHandler) target.setup(this);

    if (callbacks) this.registerChannel(target, cmds, callbacks);

    let packagez = this.proto.pack(cmds, msg);

    if (target.open || target.connecting) {
      target.send(packagez);
    } else {
      target.connect(() => {
        target.send(packagez);
      }, callbacks ? callbacks["failed"] : null);
    }
  }

  public connect(target, onsuccess=null, onfailed=null) {
    if (target.connected) {
      onsuccess();
    } else {
      target.connect(onsuccess, onfailed);
    }
  }

  public onEvent(e) {
    switch (e.type) {
      case "open": case "error": case "close":
        for (let mappingHeader in this.listener_mapping) {
          let map = this.listener_mapping[mappingHeader];
          if (map.target == e.smsocket) {
            for (let callbacks of map.callbacks) {
              if (callbacks[e.type]) callbacks[e.type](e);
            }
          }
        }
        break;
      case "message":
        let packs: Package[] = this.proto.unpack(e.data);
        for (let pack of packs) {
          pack.code = 200;
          this.dispatchMessage(e, pack);
        }
        break;
    }
  }

  public dispatchMessage(e, pack: Package) {
    if ((pack.cmd == 1 && pack.sub1 == 1) || this.checkSecurityCheckResult(pack.msg)) {
      for (let mappingHeader in this.listener_mapping) {
        if (mappingHeader == pack.headers) {
          let map = this.listener_mapping[mappingHeader];
          if (map) {
            for (let callbacks of map.callbacks) {
              if (callbacks[e.type]) callbacks[e.type](pack);
            }
          }
        }
      }
    } else { // if (!this.checkSecurityCheckResult(data))
      // this.requireSecurityCode();
    }
  }

  /**
   * Check security code of binding garden and get access token
   */
  // public checkSecurityCode(onvalid, oninvalid) {
  //   this.send([1, 1], '', (result): any => {
  //     if (result == '') { // Server is unprotected
  //       this.bindingGarden.accessToken = '';
  //       this.bindingGarden.securityCode = '';
  //       if (this.gardenSrv) this.gardenSrv.saveGarden(this.bindingGarden);
  //       onvalid('');
  //     } else if (result == 'Invalid Token') { // Server is protected but client token is invalid => try to refresh token
  //       this.bindingGarden.accessToken = '';
  //       if (this.gardenSrv) this.gardenSrv.saveGarden(this.bindingGarden);
  //       this.checkSecurityCode(onvalid, oninvalid);
  //     } else if (result == 'Invalid Security Code') { // Server is protected but client security code is invalid
  //       oninvalid(result);
  //     } else {  // Security code is valid, Server return the access token via result
  //       this.bindingGarden.accessToken = result;
  //       if (this.gardenSrv) this.gardenSrv.saveGarden(this.bindingGarden);
  //       onvalid(result); // If valid, the result will be the access token
  //     }
  //   })
  // }
  private checkSecurityCheckResult(result) {
    let isValid = !(result == 'Invalid Security Code' || result == 'Invalid Token');
    // this.authorized = isValid;
    return isValid;
  }
  // public requireSecurityCode(onresult=null) {
  //   let tryCounter = 1;
  //   let alert = this.alertCtrl.create({
  //     title: 'Vườn đã được bảo vệ',
  //     subTitle: 'Vui lòng nhập mã bảo vệ để kết nối đến vườn.',
  //     inputs: [
  //       { name: 'security_code', placeholder: 'Nhập mã bảo vệ' }
  //     ],
  //     buttons: [
  //       { text: 'Hủy', role: 'cancel', handler: data => { console.log('Cancel clicked'); } },
  //       { text: 'OK', handler: data => {
  //           let securityCode = this.security.encodeSecurityCode(data['security_code']);
  //           this.bindingGarden.securityCode = securityCode;
  //           this.bindingGarden.accessToken = '';
  //           this.checkSecurityCode((result) => {
  //             alert.dismiss();
  //           }, () => {
  //             alert.setSubTitle(`Mã bảo vệ không đúng. Vui lòng nhập lại mã bảo vệ. (${tryCounter++})`);
  //           });
  //           return false;
  //         }
  //       }
  //     ]
  //   });
  //   alert.present();
  // }
}
