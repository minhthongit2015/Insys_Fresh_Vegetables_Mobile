import { Injectable } from "@angular/core";
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";



@Injectable()
export class BluetoothCtl {
  devices: BluetoothDevice[] = [];
  device: BluetoothDevice;
  connecting: boolean = false;
  connected: boolean = false;
  
  constructor(private bls: BluetoothSerial) {
    this.device = new BluetoothDevice("B8:27:EB:73:2A:5D", "94f39d29-7d6d-437d-973b-fba39e49d4ee");
    this.devices.push(this.device);
  }

  onConnecting() { }
  onConnected() { }
  onConnectFailed(err="") { }
  onDisconnected() { }

  sendWithCommand(cmd, data, callback) {
    this.connect(() => {
      data = String.fromCharCode(cmd) + data;
      this.bls.write(data).then(() => {
        if (callback) callback();
      });
    });
  }

  sendRecv(data, callback) {
    this.connect(() => {
      if (callback) callback(this.bls.write(data), self);
    });
  }

  sendRecvWithCommand(cmd, data, callback, onEmpty = ()=>{}) {
    let pthis = this;
    this.connect(() => {
      data = String.fromCharCode(cmd) + data;
      pthis.bls.write(data).then(() => {
        if (callback) pthis.bls.readUntil("\x00").then(resolveData);
      });
    });

    function resolveData(data) {
      if (!data) {
        setTimeout(() => {
          pthis.bls.readUntil("\x00").then(resolveData);
        }, 500);
        return;
      } else {
        if (callback) callback(data);
      }
    }
  }

  connect(callback, addr="", uuid="") {
    if (!addr && !uuid) {
      addr = this.device.addr;
      uuid = this.device.uuid;
    }
    let pthis = this;
    try {
      this.bls.isConnected().then(
      () => {
        this.connecting = false;
        this.connected = true;
        if (callback) callback();
      },
      () => {
        this.connecting = true;
        this.connected = false;
        this.bls.connectInsecure(addr).subscribe(rs => {
          pthis.connecting = false;
          if (rs == "OK") {
            pthis.connected = true;
            pthis.onConnected();
            if (callback) callback();
          } else {
            pthis.connected = false;
            pthis.onConnectFailed(rs);
          }
        }, (err) => {
          console.log(err);
          pthis.connecting = false;
          pthis.connected = false;
          pthis.onConnectFailed();
        });
      });
    } catch (e) {
      pthis.connecting = false;
      pthis.connected = false;
      alert(e)
    }
  }

  disconnect(callback = ()=>{}) {
    this.bls.clear();
    return this.bls.disconnect().then(()=> {
      this.bls.clear();
      callback();
      this.onDisconnected();
    });
  }
}

export class BluetoothDevice {
  uuid: string = "";
  addr: string = "";
  constructor(addr: string, uuid: string) {
    this.uuid = uuid;
    this.addr = addr;
  }
}