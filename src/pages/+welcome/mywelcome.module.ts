import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { MyWelcomePage } from './mywelcome';

@NgModule({
  declarations: [
    MyWelcomePage,
  ],
  imports: [
    IonicPageModule.forChild(MyWelcomePage),
    TranslateModule.forChild()
  ],
  exports: [
    MyWelcomePage
  ]
})
export class WelcomePageModule { }
