import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { GardenServices } from '../../providers/providers';

/**
 * The Welcome Page is a splash page that quickly describes the app,
 * and then directs the user to create an account or log in.
 * If you'd like to immediately put the user onto a login/signup page,
 * we recommend not using the Welcome page.
*/
@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html'
})
export class WelcomePage {
  public get isSetingUp() { return this.gardenSrv.getCurrentGarden() != null; }

  constructor(public navCtrl: NavController, public gardenSrv: GardenServices) {
    
  }

  onGettingStated() {
    this.onNavigate(3, true);
  }

  public onNavigate(page, forward) {
    let pages = ["WelcomePage", "HomePage", "SettingsPage"];
    this.navCtrl.setRoot(pages[page-1], {}, {"animate": true, "direction": forward?"forward":"back"});
  }
}
