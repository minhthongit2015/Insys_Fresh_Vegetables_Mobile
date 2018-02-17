"use strict";
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

/// ---

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';


/// ---

// import { HomeServices } from './home.service';
import { ConnectionManager } from '../../providers/connection/connect_mgr';
import { GardenServices } from '../../providers/garden/garden.services';
import { HydroponicCylinder } from '../../models/garden/hydroponic';
import { Garden } from '../../models/garden/garden';
import { Plant } from '../../models/garden/plant';


@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  /// View state properties
  public isShowQuickView: boolean = false;
  public isShowDetails: boolean = false;
  public isCameraView: boolean = false;
  public isShowCreatePlantPopup: boolean = false;

  /// View component
  public clock: any;
  public clockTime = new Date();
  @ViewChild('insyschart') chart;
  public cylinders: HydroponicCylinder[];

  // model binding with planting date in create new plant popup
  private _newPlantingDate: any = `${new Date().getFullYear()}-${('0'+(new Date().getMonth()+1)).substr(-2)}-${('0'+new Date().getDate()).substr(-2)}`;
  get newPlantingDate() { return this._newPlantingDate }
  set newPlantingDate(d) { this._newPlantingDate = d }

  // model binding with planting position in create new plant popup
  public newPlantPosition: string;

  // Model binding in Quick View Panel
  public selectedCylinder: HydroponicCylinder;
  public selectedPlant: Plant;
  public ytbchannel: SafeResourceUrl;
  
  constructor(public navCtrl: NavController,
    public sanitizer: DomSanitizer,
    // public homeServices: HomeServices,
    public connectMgr: ConnectionManager,
    public gardenSvc: GardenServices) {
  }

  ionViewDidLoad() {
    this.clock = Observable.interval(1000).map(() => this.clockTime.setTime(this.clockTime.getTime() + 500));

    this.ytbchannel = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/y0NcwRYGOHU");

    this.connectMgr.setup(new Garden("B8:27:EB:73:2A:5D", "192.168.1.3:4444"));
    this.gardenSvc.setup(this.connectMgr);

    this.connectMgr.connect(() => {
      this.gardenSvc.getListHydroponic((cylinders) => {
        this.cylinders = cylinders;
        if (this.cylinders.length > 0) this.newPlantPosition = this.cylinders[0].name;
      });
    });
  }

  // onNewRecords(data) {
  //   let time,humi,temp,pH, pthis=this;
  //   if (data.length) {
  //     for (let i=0; i<data.length; i++) {
  //       parseRecord(data[i]);
  //       pushRecord(time,humi,temp,pH);
  //     }
  //   } else {
  //     parseRecord(data);
  //     pushRecord(time,humi,temp,pH);
  //   }
  //   this.selectedPlant.pH = pH;
  //   this.selectedPlant.humidity = humi;
  //   this.selectedPlant.temperature = temp;
  //   this.linechart.update();

  //   function parseRecord(record) {
  //     time = parseInt(record[0])*1000;
  //     pH = parseFloat(record[1]);
  //     temp = parseFloat(record[2]);
  //     humi = parseFloat(record[3]);
  //   }
  //   function pushRecord(time, humi, temp, pH) {
  //     pthis.linechart.data.datasets[0].data.push(humi);
  //     pthis.linechart.data.datasets[1].data.push(temp);
  //     pthis.linechart.data.labels.push(time);
  //     if (pthis.linechart.data.labels.length > 50) {
  //       pthis.linechart.data.datasets[0].data.shift();
  //       pthis.linechart.data.datasets[1].data.shift();
  //       pthis.linechart.data.labels.shift();
  //     }
  //   }
  // }

  onViewPlant(plant, cylinder) {
    this.isShowQuickView = true;
    this.selectedCylinder = cylinder;
    this.selectedPlant = plant;
  }

  onViewDetailPlant(plant) {
    this.isShowDetails = !this.isShowDetails;
    this.isCameraView = false;
  }

  onChangeWorkingMode(mode) {
    // true: automatic mode / false: manual mode
  }

  onUserSet(e, equipment, state) {
    this.gardenSvc.sendUserCommand(this.selectedCylinder.id, equipment, state!=null ? state : e.target.checked, () => {
      this.selectedCylinder.equipments[equipment] = state!=null ? state : e.target.checked;
    });
  }

  onViewCamera(plant) {
    this.isCameraView = !this.isCameraView;
    this.isShowDetails = false;
    // this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
  }

  onClickOut(e) {
    if (e.target == e.currentTarget) {
      this.onBackToMain();
    }
  }

  onCreatePlant() {
    // this.blctl.sendCommand(4, "");
    if (this.isShowDetails) this.onBackToMain();
    this.isShowCreatePlantPopup = true;
  }

  onBackToMain() {
    if (this.isShowQuickView) {
      if (!this.isCameraView && !this.isShowDetails) {
        this.isShowQuickView = false;
        // this.blctl.disconnect();
      }
      this.isCameraView = false;
      this.isShowDetails = false;
    }
    this.isShowCreatePlantPopup = false;
  }

  ionViewWillLeave() {
    // for (let api in this.getChartAPIs) {
    //   this.homeServices.uninstallAPI(this.getChartAPIs[api]['api']);
    // }
    // this.homeServices.uninstallAPI(this.gardenAPI);
  }

  onNavigate(page, forward) {
    let pages = ["WelcomePage", "HomePage", "SettingsPage"];
    this.navCtrl.setRoot(pages[page-1], {}, {"animate": true, "direction": forward?"forward":"back"});
  }
}
