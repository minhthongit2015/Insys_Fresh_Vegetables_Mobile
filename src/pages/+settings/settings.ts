import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, LoadingController } from 'ionic-angular';
import { GardenServices } from '../../providers/providers';
import { ConnectionManager } from '../../providers/connection/connect_mgr';

// import { User } from '../../providers/providers';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  private loginErrorString: string;

  loader: any;
  constructor(public navCtrl: NavController,
    public toastCtrl: ToastController,
    public translateService: TranslateService,
    public loadingCtrl: LoadingController,
    public gardenSvc: GardenServices,
    public connMgr: ConnectionManager
  ) {

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    });
  }

  ionViewDidLoad() {
    this.gardenSvc.setup(this.connMgr);
    
  }

  // Attempt to login in through our User service
  doLogin(e) {
    e.preventDefault();
    this.loader = this.loadingCtrl.create({
      content: 'đang xác thực...'
    });
    this.loader.present();

    // let pthis = this;
    // this.user.login(this.account).observe.subscribe((resp) => {
    //   pthis.loader.dismiss();
    //   this.navCtrl.setRoot('HomePage');
    // }, (err) => {
    //   pthis.loader.dismiss();
    //   let toast = this.toastCtrl.create({
    //     message: "Xác thực không thành công! Vui lòng thử lại.",
    //     duration: 3000,
    //     position: 'top'
    //   });
    //   toast.present();
    // });
  }

  onSearchingGarden() {
    // this.gardenSvc.start
  }

  private selectedGarden: any = "1";
  onConnectToGarden() {
    this.gardenSvc.handshake(this.selectedGarden, () => {
      debugger
      alert(`
      Kết nối thành công. Tiếp tục tới thiết đặt kết nối vào mạng wifi hoặc tới trang quản lý vườn cây.

      `)
    });
  }


  onNavigate(page, forward) {
    let pages = ["WelcomePage", "HomePage", "SettingsPage"];
    this.navCtrl.setRoot(pages[page-1], {}, {"animate": true, "direction": forward?"forward":"back"});
  }
}
