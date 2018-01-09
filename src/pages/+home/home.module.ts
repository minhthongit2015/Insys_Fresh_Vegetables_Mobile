import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { HomePage } from './home';
import { HomeServices } from './home.service';
import { InsysChartModule } from '../../modules/insyschart/insyschart.module';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { BluetoothCtl } from '../../providers/connection/bluetoothctl';

@NgModule({
  declarations: [
    HomePage,
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
    TranslateModule.forChild(),
    InsysChartModule
  ],
  exports: [
    HomePage
  ],
  providers: [ HomeServices, ScreenOrientation, BluetoothSerial, BluetoothCtl ]
})
export class HomePageModule { }
