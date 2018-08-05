import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { WelcomePage } from './welcome';
import { GardenServices } from '../../providers/providers';

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
  providers: [ GardenServices ]
})
export class WelcomePageModule { }
