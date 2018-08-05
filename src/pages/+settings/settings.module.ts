import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule, AlertController } from 'ionic-angular';

import { SettingsPage } from './settings';
import { GardenServices } from '../../providers/garden/garden.services';
import { ConnectionManager } from '../../providers/connection/connect_mgr';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { BluetoothCtl } from '../../providers/providers';
import { WebsocketHandle } from '../../providers/connection/websocket';

@NgModule({
  declarations: [
    SettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingsPage),
    TranslateModule.forChild()
  ],
  exports: [
    SettingsPage
  ],
  providers: [ GardenServices, ConnectionManager, BluetoothSerial, BluetoothCtl, WebsocketHandle, AlertController ]
})
export class SettingsPageModule { }
