import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, LoadingController } from 'ionic-angular';

import { User } from '../../providers/providers';

@IonicPage()
@Component({
  selector: 'page-login-mine',
  templateUrl: 'mylogin.html'
})
export class MyLoginPage {
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type
  account: { username: string, password: string } = {
    username: 'super-admin',
    password: 'insys$123'
  };

  // Our translated text strings
  private loginErrorString: string;

  loader: any;
  constructor(public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public translateService: TranslateService,
    private loadingCtrl: LoadingController) {

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    })
  }

  // Attempt to login in through our User service
  doLogin(e) {
    e.preventDefault();
    this.loader = this.loadingCtrl.create({
      content: 'đang xác thực...'
    });
    this.loader.present();

    let pthis = this;
    this.user.login(this.account).observe.subscribe((resp) => {
      pthis.loader.dismiss();
      this.navCtrl.setRoot('HomePage');
    }, (err) => {
      pthis.loader.dismiss();
      let toast = this.toastCtrl.create({
        message: "Xác thực không thành công! Vui lòng thử lại.",
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }
}
