import { Injectable } from "@angular/core";
import { WebsocketHandle } from "./websocket";
import { BluetoothCtl } from "./bluetoothctl";
import { Garden } from "../../models/garden/garden";
import { Security } from "./security";
import { AlertController } from "ionic-angular";
import { GardenServices } from "../providers";

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
  public websocket: WebsocketHandle;
  public listener_mapping: { [header:string] : (data) => { } };
  private authorized: boolean = null;

  public security: Security;
  public gardenSrv: GardenServices;
  public bindingGarden: Garden;
  public pkgcfg: any;

  get connecting() { return this.ws.connecting }
  get connected() { return this.ws.connected }

  constructor(public ws: WebsocketHandle) {
    this.listener_mapping = { "0|255|255": (data): any => { } };
    this.security = new Security();
    this.pkgcfg = {start: '\xfd', delim: '\xfe', end: '\xff', def: '\xf4'}
  }

  public setup(garden: Garden) {
    if (!garden) return
    this.bindingGarden = garden;
    this.ws.setup(this.bindingGarden.host, (response) => this.onResponse(response));
  }

  public attachGardenService(gardenSrv: GardenServices) {
    this.gardenSrv = gardenSrv;
  }

  public send(cmds, data, onsuccess: (data) => { }, onfailed=null) {
    if (!cmds.length) cmds = [cmds];
    if (cmds.length == 1) cmds.push(this.pkgcfg.def);
    if (cmds.length == 2) cmds.push(this.pkgcfg.def);
    let header = String.fromCharCode(...cmds);
    let packagez = `${this.pkgcfg.start}${this.bindingGarden.accessToken||this.bindingGarden.securityCode}${this.pkgcfg.delim}${header}${this.pkgcfg.delim}${data}${this.pkgcfg.end}`;

    if (onsuccess) this.listener_mapping[header] = onsuccess;

    if (this.ws.connected) { // If LAN is available then send package via LAN
      this.ws.send(packagez);
    } else {                 // else try to reconnect via LAN
      this.ws.connect(() => {
        this.ws.send(packagez);
      }, onfailed);
    }
  }

  public connect(onsuccess=null, onfailed=null) {
    // Try to connect by wifi first (using websocket)
    if (this.connected) {
      onsuccess();
    } else {
      this.ws.connect(onsuccess, onfailed);
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
    let iEnd = response.indexOf(this.pkgcfg.end);
    pack = response.substr(1, iEnd-1);
    rest = response.substr(iEnd + this.pkgcfg.end.length);

    // Header_D_Data
    pack = pack.split(this.pkgcfg.delim);
    header = pack[0];
    data = pack[1];

    cmd = header.charCodeAt(0);
    sub1 = header.charCodeAt(1);
    sub2 = header.charCodeAt(2);

    return [header, cmd, sub1, sub2, data, rest];
  }

  public responseHandle(header, cmd, sub1, sub2, data) {
    if ((cmd == 1 && sub1 == 1) || this.checkSecurityCheckResult(data)) {
      for (let mappingHeader in this.listener_mapping) {
        if (mappingHeader == header) this.listener_mapping[mappingHeader](data);
      }
    } else { // if (!this.checkSecurityCheckResult(data))
      this.requireSecurityCode();
    }
  }

  /**
   * Check security code of binding garden and get access token
   */
  public checkSecurityCode(onvalid, oninvalid) {
    this.send([1, 1], '', (result): any => {
      if (result == '') { // Server is unprotected
        this.bindingGarden.accessToken = '';
        this.bindingGarden.securityCode = '';
        if (this.gardenSrv) this.gardenSrv.saveGarden(this.bindingGarden);
        onvalid('');
      } else if (result == 'Invalid Token') { // Server is protected but client token is invalid => try to refresh token
        this.bindingGarden.accessToken = '';
        if (this.gardenSrv) this.gardenSrv.saveGarden(this.bindingGarden);
        this.checkSecurityCode(onvalid, oninvalid);
      } else if (result == 'Invalid Security Code') { // Server is protected but client security code is invalid
        oninvalid(result);
      } else {  // Security code is valid, Server return the access token via result
        this.bindingGarden.accessToken = result;
        if (this.gardenSrv) this.gardenSrv.saveGarden(this.bindingGarden);
        onvalid(result); // If valid, the result will be the access token
      }
    })
  }
  private checkSecurityCheckResult(result) {
    let isValid = !(result == 'Invalid Security Code' || result == 'Invalid Token');
    this.authorized = isValid;
    return isValid;
  }
  public requireSecurityCode(onresult=null) {
    let tryCounter = 1;
    let alert = this.alertCtrl.create({
      title: 'Vườn đã được bảo vệ',
      subTitle: 'Vui lòng nhập mã bảo vệ để kết nối đến vườn.',
      inputs: [
        { name: 'security_code', placeholder: 'Nhập mã bảo vệ' }
      ],
      buttons: [
        { text: 'Hủy', role: 'cancel', handler: data => { console.log('Cancel clicked'); } },
        { text: 'OK', handler: data => {
            let securityCode = this.security.encodeSecurityCode(data['security_code']);
            this.bindingGarden.securityCode = securityCode;
            this.bindingGarden.accessToken = '';
            this.checkSecurityCode((result) => {
              alert.dismiss();
            }, () => {
              alert.setSubTitle(`Mã bảo vệ không đúng. Vui lòng nhập lại mã bảo vệ. (${tryCounter++})`);
            });
            return false;
          }
        }
      ]
    });
    alert.present();
  }
}
