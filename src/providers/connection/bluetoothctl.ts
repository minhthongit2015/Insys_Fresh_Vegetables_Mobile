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
    if (!this.bls.isEnabled) this.bls.enable().then(() => { this.listen(); });
    else this.listen();
  }

  setListener(listener=(cmd, sub1, sub2, data) => {}) {
    this.onResponse = listener;
  }

  onConnecting() { }
  onConnected() { }
  onConnectFailed(err="") { }
  onDisconnected() { }

  onResponse(cmd, sub1, sub2, data) { }

  listen() {
    this.bls.subscribe("\x00\x00").subscribe((response) => {
      let frame = response.split('\x00')[0].split('\xfe');
      let header = frame[0], data = frame[1];
      let cmd = header.charCodeAt(0), sub1 = header.charCodeAt(1), sub2 = header.charCodeAt(2);
      this.onResponse(cmd, sub1, sub2, data);
    }, (error) => {
      // debugger
      console.log(error)
    }, () => {
      // debugger
      console.log("finished");
    })
  }

  sendCommand(cmd, data='', callback=null, onEmpty = ()=>{}) {
    if (!cmd.length) cmd = [cmd];
    if (cmd.length == 1) cmd.push(-1);
    if (cmd.length == 2) cmd.push(-1);
    let header = String.fromCharCode(cmd[0]) + String.fromCharCode(cmd[1]) + String.fromCharCode(cmd[2]);
    let pthis = this;
    this.connect(() => {
      let packagez = header + '\xfe' + data + '\x00\x00';
      pthis.bls.write(packagez).then((rs) => {
        // debugger
        if (callback) callback();
      });
    });
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
        this.bls.connect(addr).subscribe(rs => {
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
      this.connected = this.connecting = false;
      this.bls.clear();
      callback();
      this.onDisconnected();
    });
  }

  intToByteArray(x) {
    let byteArray = [0, 0, 0, 0], byte;
    for (let index = 0; index < byteArray.length; index ++ ) {
      byte = x & 0xff;
      byteArray [index] = byte;
      x = (x - byte) / 256 ;
    }
    return byteArray;
  };

  pack(bytes) {
    let str = "", char;
    for(let i = 0; i < bytes.length; i+=2) {
        char = bytes[i] << 8;
        if (bytes[i+1]) char |= bytes[i+1];
        str += String.fromCharCode(char);
    }
    return str;
  }

  unpack(str) {
    let bytes = [], char;
    for(let i = 0; i < str.length; i++) {
      char = str.charCodeAt(i);
      bytes.push(char >>> 8);
      bytes.push(char & 0xFF);
    }
    return bytes;
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