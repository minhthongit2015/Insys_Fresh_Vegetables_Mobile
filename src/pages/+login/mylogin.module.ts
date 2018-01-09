import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { MyLoginPage } from './mylogin';

@NgModule({
  declarations: [
    MyLoginPage,
  ],
  imports: [
    IonicPageModule.forChild(MyLoginPage),
    TranslateModule.forChild()
  ],
  exports: [
    MyLoginPage
  ]
})
export class MyLoginPageModule { }
