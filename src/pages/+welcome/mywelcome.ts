import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
// import { UserModule } from '../../providers/providers';

/**
 * The Welcome Page is a splash page that quickly describes the app,
 * and then directs the user to create an account or log in.
 * If you'd like to immediately put the user onto a login/signup page,
 * we recommend not using the Welcome page.
*/
@IonicPage()
@Component({
  selector: 'page-welcome-mine',
  templateUrl: 'mywelcome.html'
})
export class MyWelcomePage {

  constructor(public navCtrl: NavController) { }

  // user: UserModule;
  // login() {
  //   this.user = new UserModule();
  //   if (this.user.isLogedIn()) this.navCtrl.setRoot('HomePage');
  //   else this.navCtrl.push('MyLoginPage');
  // }

  signup() {
    this.navCtrl.push('SignupPage');
  }
}
