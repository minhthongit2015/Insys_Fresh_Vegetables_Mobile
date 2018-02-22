"use strict";
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';

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
import { InSysChartJS } from '../../modules/insyschartjs/insyschartjs';
import { listPlantLib, PlantLib } from '../../models/garden/plant_lib';



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
  public curGarden: Garden;
  public clock: any;
  public clockTime = new Date();
  @ViewChild('insyschart') chart;
  public cylinders: HydroponicCylinder[];

  // model binding with create new plant
  public listPlantLib: PlantLib[] = listPlantLib;

  private _newPlantPlantingDate: any = `${new Date().getFullYear()}-${('0'+(new Date().getMonth()+1)).substr(-2)}-${('0'+new Date().getDate()).substr(-2)}`;
  get newPlantPlantingDate() { return this._newPlantPlantingDate }
  set newPlantPlantingDate(d) { this._newPlantPlantingDate = d }

  public newPlantAlias: string;
  public newPlantName: string;
  public newPlantPosition: string;
  public _newPlantType: string;
  public set newPlantType(type) {
    this._newPlantType = type;
    for (let plant of this.listPlantLib) {
      if (plant.type == type) {
        this.newPlantName = plant.name;
        break;
      }
    }
  }
  public get newPlantType() { return this._newPlantType }

  // Model binding in Quick View Panel
  public selectedCylinder: HydroponicCylinder;
  public selectedPlant: Plant;
  public ytbchannel: SafeResourceUrl;

  @ViewChild('insyschart') envsChartEle: any;
  public envsChart: InSysChartJS;
  
  constructor(public navCtrl: NavController,
              public sanitizer: DomSanitizer,
              public alertCtrl: AlertController,
              public connectMgr: ConnectionManager,
              public gardenSvc: GardenServices) {
    console.log(213);
    this.connectMgr.alertCtrl = alertCtrl;
    //
  }

  ionViewDidLoad() {
    this.curGarden = this.gardenSvc.getCurrentGarden();
    
    this.clock = Observable.interval(1000).map(() => this.clockTime.setTime(this.clockTime.getTime() + 500));

    this.ytbchannel = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/Qmla9NLFBvU");

    this.connectMgr.setup(this.curGarden);
    this.gardenSvc.setup(this.connectMgr);

    this.getListCylinders();
  }

  public onInputSecurityCode() {
    this.gardenSvc.checkSecurity(this.curGarden, () => {});
  }

  public getListCylinders() {
    this.connectMgr.connect(() => {
      this.gardenSvc.getListHydroponic((cylinders) => {
        this.cylinders = cylinders;
        if (this.cylinders.length > 0) this.newPlantPosition = this.cylinders[0].id;
      });
      // this.gardenSvc.checkSecurity(this.curGarden, (isValid) => {
      //   if (this.curGarden.accessToken == '') {
      //     this.curGarden.securityCode = '';
      //     this.gardenSvc.saveGarden(this.curGarden);
      //   }
      //   if (isValid) {
      //     this.gardenSvc.getListHydroponic((cylinders) => {
      //       this.cylinders = cylinders;
      //       if (this.cylinders.length > 0) this.newPlantPosition = this.cylinders[0].id;
      //     });
      //   }
      // });
    }, () => {
      setTimeout(() => this.getListCylinders(), 2000);
    });
  }

  onViewPlant(plant, cylinder) {
    this.isShowQuickView = true;
    this.selectedCylinder = cylinder;
    this.selectedPlant = plant;
  }

  onViewDetailPlant(plant) {
    this.isShowDetails = !this.isShowDetails;
    this.isCameraView = false;
    
    this.envsChart = new InSysChartJS(this.envsChartEle)
    this.gardenSvc.getChartRecords(this.selectedCylinder.id, (records: any[]) => {
      this.envsChart.attachRecords(records);
    });
    this.gardenSvc.keepInfoUpdate(this.selectedCylinder.id, (info) => {
      if (info.id != this.selectedCylinder.id) return;
      this.selectedCylinder.reload(info);
    })
  }

  onUserSet(e, equipment, state) {
    this.gardenSvc.sendUserCommand(this.selectedCylinder.id, equipment, state!=null ? state : e.target.checked, () => {
      this.selectedCylinder.equipmentSet[equipment] = state!=null ? state : e.target.checked;
    });
  }

  onViewCamera(plant) {
    this.isCameraView = !this.isCameraView;
    this.isShowDetails = false;
    // this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
  }
  
  onClickOut(e) {
    if (e.path[0].classList.contains("plant-icon")) return;
    for (let p of e.path)
      if (p.classList && (p.id == "quickview-panel" || p.classList.contains("newplant-popup"))) return;
    this.onBackToMain();
  }

  onCreatePlant() {
    // this.blctl.sendCommand(4, "");
    if (this.isShowDetails) this.onBackToMain();
    this.isShowCreatePlantPopup = true;
  }
  onCreateNewPlant() {
    this.newPlantPlantingDate;
    this.newPlantPosition;
    this.newPlantType;
    this.newPlantAlias;
    this.newPlantName;
    let alias = this.newPlantAlias || this.newPlantName;
    this.gardenSvc.createNewPlant(this.newPlantPosition, this.newPlantType, this.newPlantPlantingDate, alias, (cylinders) => {
      this.cylinders = cylinders;
      this.onBackToMain();
    });
  }

  public onRemovePlant() {
    if (confirm(`Bạn có chắc muốn gỡ bỏ ${this.selectedPlant.alias} khỏi ${this.selectedCylinder.name}`)) {
      this.gardenSvc.removePlant(this.selectedCylinder.id, this.selectedPlant.plantId, (cylinders) => {
        this.cylinders = cylinders;
        this.onBackToMain();
      });
    }
  }

  onBackToMain() {
    if (this.isShowQuickView) {
      if (!this.isCameraView && !this.isShowDetails) {
        this.isShowQuickView = false;
        // this.blctl.disconnect();
      }
      this.isCameraView = false;
      this.isShowDetails = false;
      this.onDeselectPlant();
    }
    this.isShowCreatePlantPopup = false;
  }
  onDeselectPlant() {
    this.gardenSvc.unkeepInfoUpdate();
  }

  ionViewWillLeave() {
    this.onDeselectPlant();
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
