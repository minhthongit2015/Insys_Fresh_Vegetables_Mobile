import { Injectable } from "@angular/core";
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";
import { ConnectMethod } from "../../models/connection/connect_method";



@Injectable()
export class BluetoothCtl extends ConnectMethod {
  private bluetooth_addr: string = "B8:27:EB:73:2A:5D";
  // this.device = new BluetoothDevice(, "94f39d29-7d6d-437d-973b-fba39e49d4ee");
  public connecting: boolean = false;
  public connected: boolean = false;
  
  constructor(private bls: BluetoothSerial) {
    super();
    this.bls.isEnabled().then((enable: string) => {
      if (enable != "OK") this.bls.enable().then(() => { this.listen(); });
      else this.listen();
    }, (error) => {
      console.error(error);
    });
  }

  public setup(destination, onPackages) {
    this.bluetooth_addr = destination;
    this.onPackages = onPackages;
  }

  private listen() {
    this.bls.subscribe("\x00\x00").subscribe((response) => {
      this.onPackages(response);
    }, (error) => {
      // debugger
      console.log(error)
    }, () => {
      // debugger
      console.log("finished");
    });
    // this.bls.showBluetoothSettings().then((rs) => {
    //   debugger
    // });
  }

  public send(packages, callback=null, onEmpty = ()=>{}) {
    let pthis = this;
    this.connect(() => {
      pthis.bls.write(packages).then((rs) => {
        // debugger
        if (callback) callback();
      });
    });
  }

  public connect(onsuccess=null, onfailed=null) {
    let pthis = this;
    try {
      this.bls.isConnected().then(
        () => {
          this.connecting = false;
          this.connected = true;
          onsuccess();
        },
        () => {
          this.connecting = true;
          this.connected = false;
          this.bls.connect(this.bluetooth_addr).subscribe(rs => {
            pthis.connecting = false;
            if (rs == "OK") {
              pthis.connected = true;
              pthis.onConnected();
              if (onsuccess) onsuccess();
            } else {
              pthis.connected = false;
              pthis.onConnectFailed(rs);
              if (onfailed) onfailed(rs);
            }
          }, (err) => {
            console.log(err);
            pthis.connecting = false;
            pthis.connected = false;
            pthis.onConnectFailed(err);
            if (onfailed) onfailed(err);
          });
        }
      );
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

  discover(listener) {
    this.bls.setDeviceDiscoveredListener().subscribe((newDevice) => listener(newDevice));
    this.bls.discoverUnpaired().then((devices) => {
      listener(devices);
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