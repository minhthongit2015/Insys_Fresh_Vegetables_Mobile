import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { SettingsPage } from './settings';
import { GardenServices } from '../../providers/garden/garden.services';
import { ConnectionManager } from '../../providers/connection/connect_mgr';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { BluetoothCtl } from '../../providers/providers';
import { GardenSync } from '../../providers/connection/sync/garden_sync';
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
  providers: [ GardenServices, GardenSync, ConnectionManager, BluetoothSerial, BluetoothCtl, WebsocketHandle ]
})
export class SettingsPageModule { }
