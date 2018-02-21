import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, LoadingController } from 'ionic-angular';
import { GardenServices } from '../../providers/providers';
import { ConnectionManager } from '../../providers/connection/connect_mgr';
import { Garden } from '../../models/garden/garden';

// import { User } from '../../providers/providers';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  /// View state properties
  public isNoneConnectStage: boolean = true;
  public isGettingStartedStage: boolean = false;
  public isChooseBluetoothStage: boolean = false;
  public isBluetoothConnectedStage: boolean = false;
  public isConfigWifiStage: boolean = false;
  public isWifiConnectedStage: boolean = false;
  public isExistGarden: boolean = false;
  public isAddingNewConnectionMethod: boolean = false;
  public get isInConnectScript() {
    return this.isGettingStartedStage || this.isChooseBluetoothStage || this.isBluetoothConnectedStage
      || this.isConfigWifiStage || this.isWifiConnectedStage;
  }

  /// View component
  public selectedGarden: any = "1";
  public selectedWifi: any = "1";
  public appSecurityCode: string = "";
  public loginErrorString: string;

  public _curGarden: Garden;
  public get curGarden() { return this._curGarden; }
  public set curGarden(garden: Garden) {
    if (garden) {
      this._curGarden = garden;
      this.isNoneConnectStage = false;
      this.isExistGarden = true;
    }
  }

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
    this.curGarden = this.gardenSvc.getCurrentGarden();
    if (!this.curGarden) {
      this.curGarden = new Garden("");
      this.isNoneConnectStage = true;
      this.isExistGarden = false;
    }
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

  public onGettingStated() {
    this.isNoneConnectStage = false;
    this.isGettingStartedStage = true;
  }

  public onConnectToGarden() {
    this.isGettingStartedStage = false;
    this.isBluetoothConnectedStage = true;

    this.curGarden = new Garden("Vườn Khí Canh 0" + Math.floor(Math.random()*10), "B8:27:EB:73:2A:5D");
    this.gardenSvc.saveGarden(this.curGarden);
    // this.gardenSvc.handshake(this.selectedGarden, () => {
    //   debugger
    //   alert(`
    //   Kết nối thành công. Tiếp tục tới thiết đặt kết nối vào mạng wifi hoặc tới trang quản lý vườn cây.

    //   `)
    // });
  }

  public onContinueToConfigWifi(isAddToExist) {
    this.isAddingNewConnectionMethod = isAddToExist;
    this.isBluetoothConnectedStage = false;
    this.isConfigWifiStage = true;
  }

  public onConnectToHomeWifi() {
    // this.selectedWifi
    this.isAddingNewConnectionMethod = false;
    this.isConfigWifiStage = false;
    this.isWifiConnectedStage = true;

    if (this.isAddingNewConnectionMethod) {
      this.curGarden.host = "192.168.1.5:4444";
      this.gardenSvc.saveGarden(this.curGarden);
    } else {
      this.curGarden = new Garden("Vườn Khí Canh 0" + Math.floor(Math.random()*10), "B8:27:EB:73:2A:5D", "192.168.1.5:4444");
      this.gardenSvc.saveGarden(this.curGarden);
    }
  }

  public onSearchingGarden() {
    // this.gardenSvc.start
  }

  onNavigate(page, forward) {
    let pages = ["WelcomePage", "HomePage", "SettingsPage"];
    this.navCtrl.setRoot(pages[page-1], {}, {"animate": true, "direction": forward?"forward":"back"});
  }
}
