import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, LoadingController, AlertController } from 'ionic-angular';
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

      // this.gardenSvc.checkConnection();
    }
  }

  public listGardens: Garden[];

  loader: any;
  constructor(public navCtrl: NavController,
    public translateService: TranslateService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public gardenSvc: GardenServices,
    public connMgr: ConnectionManager
  ) {
    this.connMgr.alertCtrl = alertCtrl;
    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    });
    this.curGarden = this.gardenSvc.getCurrentGarden();
    this.listGardens = this.gardenSvc.getListGarden();
    if (!this.curGarden) {
      if (this.listGardens.length > 0) {
        this.curGarden = this.listGardens[0];
      } else {
        this.curGarden = new Garden();
        this.isNoneConnectStage = true;
        this.isExistGarden = false;
      }
    }

  }

  ionViewDidLoad() {
    this.gardenSvc.setup(this.connMgr);
    this.gardenSvc.checkSecurity(this.curGarden, () => {});
  }

  // Attempt to login in through our User service
  doLogin(e) {
    e.preventDefault();
    this.loader = this.loadingCtrl.create({
      content: 'đang xác thực...'
    });
    this.loader.present();
  }
  public onSecurityCode() {
    this.curGarden.accessToken = '';
    this.gardenSvc.checkSecurity(this.curGarden, (result) => {
      if (result) {
        if (this.curGarden.securityCode)
          this.onChangeSecurityCode();
        else
          this.onSetSecurityCode();
      } else {
        this.curGarden.securityCode = '?????????';
        this.gardenSvc.saveGarden(this.curGarden);
      }
    });
  }
  public onSetSecurityCode() {
    let alert = this.alertCtrl.create({
      title: 'Thiết đặt mã bảo vệ cho vườn',
      inputs: [
        { name: 'security_code', placeholder: 'Nhập mã bảo vệ' }
      ],
      buttons: [
        { text: 'Hủy', role: 'cancel', handler: data => { console.log('Cancel clicked'); } },
        { text: 'OK', handler: data => {
            let securityCode = this.connMgr.security.encodeSecurityCode(data['security_code']);
            this.gardenSvc.setSecurityCode('', securityCode, (result) => {
              if (result == 'OK') {
                this.curGarden.securityCode = securityCode;
                this.gardenSvc.saveGarden(this.curGarden);
              } else {
                let alert = this.alertCtrl.create
              }
            });
          }
        }
      ]
    });
    alert.present();
  }
  public onChangeSecurityCode() {
    let alert = this.alertCtrl.create({
      title: 'Đổi mã bảo vệ',
      inputs: [
        { name: 'old_security_code', placeholder: 'Nhập mã bảo vệ cũ' },
        { name: 'new_security_code', placeholder: 'Nhập mã bảo vệ mới' }
      ],
      buttons: [
        { text: 'Hủy', role: 'cancel', handler: data => { console.log('Cancel clicked'); } },
        { text: 'OK', handler: data => {
            let oldSecurityCode = this.connMgr.security.encodeSecurityCode(data['old_security_code']);
            let newSecurityCode = this.connMgr.security.encodeSecurityCode(data['new_security_code']);
            if (oldSecurityCode != this.curGarden.securityCode) {
              alert.setSubTitle("Mã bảo vệ cũ không hợp lệ!");
            } else {
              alert.setSubTitle('Đang yêu cầu đổi mã bảo vệ..');
              this.gardenSvc.setSecurityCode(oldSecurityCode, newSecurityCode, (result) => {
                if (result == "OK") {
                  this.curGarden.securityCode = newSecurityCode;
                  this.gardenSvc.saveGarden(this.curGarden);
                  alert.dismiss();
                }
              })
            }
            return false;
          }
        }
      ]
    });
    alert.present();
  }

  public onGettingStated() {
    this.isNoneConnectStage = false;
    this.isGettingStartedStage = true;
  }

  public onConnectToGarden() {
    this.isGettingStartedStage = false;
    this.isBluetoothConnectedStage = true;

    this.curGarden = new Garden("Vườn Khí Canh 0" + Math.floor(Math.random()*10), "B8:27:EB:73:2A:5D");
    this.gardenSvc.setCurrentGarden(this.curGarden);
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

    this.curGarden.host = "192.168.1.148:4444";
    this.gardenSvc.setCurrentGarden(this.curGarden);
    this.connMgr.setup(this.curGarden);

    this.gardenSvc.checkSecurity(this.curGarden, (result) => {
      if (result)
      {
      } else {
      }
    });
  }

  public onSearchingGarden() {
    // this.gardenSvc.start
  }

  onNavigate(page, forward) {
    let pages = ["WelcomePage", "HomePage", "SettingsPage"];
    this.navCtrl.setRoot(pages[page-1], {}, {"animate": true, "direction": forward?"forward":"back"});
  }
}
