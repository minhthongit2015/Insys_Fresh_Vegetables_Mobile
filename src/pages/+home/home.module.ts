import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { HomePage } from './home';
// import { HomeServices } from './home.service';
import { ConnectionManager } from '../../providers/connection/connect_mgr';
import { BluetoothCtl } from '../../providers/connection/bluetoothctl';
import { WebsocketHandle } from '../../providers/connection/websocket';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { GardenServices } from '../../providers/providers';
import { GardenSync } from '../../providers/connection/sync/garden_sync';

@NgModule({
  declarations: [
    HomePage
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
    TranslateModule.forChild()
  ],
  exports: [
    HomePage
  ],
  providers: [
    // HomeServices,
    ConnectionManager, BluetoothCtl, BluetoothSerial, WebsocketHandle,
    GardenServices, GardenSync
  ]
})
export class HomePageModule { }
