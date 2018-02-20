import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { WelcomePage } from './welcome';
import { GardenServices } from '../../providers/providers';
import { GardenSync } from '../../providers/connection/sync/garden_sync';

@NgModule({
  declarations: [
    WelcomePage,
  ],
  imports: [
    IonicPageModule.forChild(WelcomePage),
    TranslateModule.forChild()
  ],
  exports: [
    WelcomePage
  ],
  providers: [ GardenServices, GardenSync ]
})
export class WelcomePageModule { }
