import { Component, ViewChildren } from '@angular/core';
import { IonicPage, ModalController, NavController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';


import { Garden } from '../../models/garden';
import { Gardens } from '../../providers/gardens/gardens';
import { HomeServices } from './home.service';
import { IBaseAPI } from '../../providers/api/api';
import { Database } from '../../providers/storage/storage';
import { UserModule } from '../../providers/providers';
import { Observable } from 'rxjs/Observable';
import { InsysChartComponent } from '../../modules/insyschart/insyschart.component';

import { BluetoothCtl } from '../../providers/connection/bluetoothctl';
import { ChartData } from '../../modules/insyschart/insyschart.module';


declare let d3: any;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentPlants: Garden[];
  gardenAPI: IBaseAPI;
  weekday = 0;
  db: Database;
  user: UserModule;

  get connecting() { return this.blctl.connecting }
  get connected() { return this.blctl.connected }
  
  averageTemp: string = '27';
  averageHumi: string = '80';

  clock: any;
  clockTime = new Date();
  ytbchannel: any = "";
  constructor(public navCtrl: NavController, public gardenServices: Gardens, public modalCtrl: ModalController,
    public homeServices: HomeServices, private blctl: BluetoothCtl, private sanitizer: DomSanitizer) {
    let pthis = this;

    this.clock = Observable.interval(1000).map( () => this.clockTime.setTime(this.clockTime.getTime()+500) );

    this.db = new Database("Gardens");
    this.user = new UserModule();

    if (this.db.queryKey("Garden")) {
      let gardens = this.db.queryKey("Garden");
      gardens = gardens.map((plant: any) => {
        plant['pins'] = [];
        plant['auto'] = true;
        plant['humidity'] = 0;
        plant['temperature'] = 0;
        plant['pH'] = 0;
        return plant;
      });
      pthis.currentPlants = gardens;
      pthis.selectedPlant = pthis.currentPlants[1];
    } else {
      this.gardenServices.query().observe.subscribe((gardens: any) => {
        gardens = gardens.map((plant: any) => {
          plant['pins'] = [true,true,true,true];
          plant['auto'] = true;
          plant['humidity'] = 0;
          plant['temperature'] = 0;
          plant['pH'] = 0;
          return plant;
        });
        pthis.currentPlants = gardens;
        pthis.selectedPlant = pthis.currentPlants[1];
        pthis.db.insertKey(gardens, "Garden");
      });
    }
    this.homeServices.setServer('https://insysdemo.azurewebsites.net');
    this.gardenAPI = this.homeServices.startSynchronizeThread(5000000, (rs: any) => {
      let totalHumi = 0, totalTemp = 0, count = 0;
      for (let garden of pthis.currentPlants) {
        for (let device of rs.data.items) {
          if (device['deviceId'] == garden['managerDeviceId']) {
            garden['config']['water_manure'] = device['buttons'][3]['active'];
            garden['temperature'] = device['temperature'];
            garden['humidity'] = device['humidity'];
            totalHumi += device['humidity'];
            totalTemp += device['temperature'];
            count++;
          }
        }
      }
      pthis.averageHumi = (totalHumi/count).toFixed(2);
      pthis.averageTemp = (totalTemp/count).toFixed(2);
      pthis.db.insertKey(pthis.currentPlants, "Garden");
      // if (pthis.chart && pthis.chart.update) pthis.chart.update();
    });
    
    this.weekday = 0;
    this.ytbchannel = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/y0NcwRYGOHU");
  }

  options: any;
  @ViewChildren(InsysChartComponent) charts: any[];
  ionViewDidLoad() {
    this.options = {
      chart: {
        type: 'lineWithFocusChart',
        margin: {
          top: 50,
          right: 10,
          bottom: 30,
          left: 60
        },
        useInteractiveGuideline: true,
        dispatch: {   
          stateChange: (e: any) => this.onChangeLabel(e)
        },
        interpolate: 'line',// basic, monotone
        forceY: [0, 50, 100],
        duration: 100,
        color: ['#5bc0de', '#f0ad4e'],
        x: function(d: any){ return d?d.x:0; },
        y: function(d: any){ return d?d.y:0; },
        xAxis: {
          // axisLabel: 'Time (hh:mm:ss dd/mm)',
          tickFormat: function(x: any) { return d3.time.format('%H:%M %d/%m')(new Date(parseInt(x))) },
          showMaxMin: true
        },
        x2Axis: {
          axisLabel: 'Time 2',
          tickFormat: function(x: any) { return d3.time.format('%H:%M')(new Date(parseInt(x))) },
          showMaxMin: true
        },
        yAxis: {
          // axisLabel: 'Nhiệt độ (°C)            Độ ẩm (%)',
          tickFormat: function(d: any) { return d3.format(',.2f')(d) },
          // valueFormat: function(d: any) { d3.format(',.2f') },
          axisLabelDistance: 0,
          showMaxMin: true
        },
        y2Axis: {
          // axisLabel: 'Nhiệt độ (°C)            Độ ẩm (%)',
          tickFormat: function(d: any) { return d3.format(',.2f')(d) },
          axisLabelDistance: 0,
          showMaxMin: true
        }
      }
    };
    let chartViewData = [new ChartData(100, 50, 100), new ChartData(100, 20, 35)];
  }
  
  
  onChangeLabel(e: any) {
    if (!this.charts) return;
    debugger
    // this.chartViewData.forEach((data: any, index: number) => {
    //   this.chartViewData[index].disabled = e.disabled[index];
    // });
    this.adjustYAxis();
    e.update();
  }

  adjustYAxis() {
    // if (this.chart && this.chartViewData && this.chartViewData.length == 2 && this.chartViewData[0].disabled^this.chartViewData[1].disabled) {
    //   var min: number = 100, max: number = 0;
    //   this.chartViewData.forEach((data: any) => {
    //     if (!data.disabled) {
    //       data.values.forEach((p: any) => {
    //         max = (max == null) ? p.y : (p.y > max ? p.y : max);
    //         min = (min == null) ? p.y : (p.y < min ? p.y : min);
    //       });
    //     }
    //   });
    //   this.chart.nvD3.chart.forceY([min-5, max+5]);
    // } else this.chart.nvD3.chart.forceY([0, 50, 100]);
  }

  isShowQuickView: boolean = false;
  selectedPlant : Garden;
  selectedPlantConn;
  blueToken: string = "";
  onViewPlant(plant) {
    // let pthis = this;
    this.selectedPlant = plant;
    this.isShowQuickView = true;
    if (!this.isShowQuickView) {
      this.syncViaBluetooth();
    } else {
      try {
        this.blctl.disconnect().then(()=>{
          this.syncViaBluetooth();
        });
      } catch (e) { }
    }
  }

  syncViaBluetooth(justread=false) {
    let pthis = this;
    if (!this.blctl.connected) {
      this.blctl.sendRecvWithCommand(2, "", (data) => {
        resolveSyncData(data);
      }, () => {
      });
    }
    function resolveSyncData(data) {
      let part = data.split("/");
      let pins = part[0].split("|");
      let envs = part[1].split("|");
      pins = pins.map(p => {
        let info = p.split(":");
        p = {};
        p.pin = parseInt(info[0]);
        p.state = parseInt(info[1]) == 1;
        return p;
      });
      pthis.selectedPlant['pins'] = pins;
      pthis.selectedPlant['auto'] = pins[0].state;
      pthis.selectedPlant['humidity'] = parseFloat(envs[0])
      pthis.selectedPlant['temperature'] = parseFloat(envs[1])
      pthis.selectedPlant['pH'] = parseFloat(envs[2])
      console.log(data);

      setTimeout(() => {
        pthis.homeServices.installGetChartViaBluetooth(5000, () => {
          pthis.blctl.sendRecvWithCommand(3, "", (data) => {
            console.log(data);
          })
        });
      }, 1000);
    }
  }

  isShowDetails: boolean = false;
  private getChartAPIs: {[api: string]: {}} = {};
  onViewDetailPlant(plant) {
    let pthis = this;
    let plantId = plant['managerDeviceId'];
    this.isShowDetails = !this.isShowDetails;
    this.isCameraView = false;
    if (this.isShowDetails) {
      if (!this.getChartAPIs[plantId]) {       // install api
        this.getChartAPIs[plantId] = {};
        this.getChartAPIs[plantId]['garden'] = this.currentPlants.find(g => g['managerDeviceId'] == plantId);
        this.getChartAPIs[plantId]['garden']['chartViewData'] = [new ChartData(100, 60, 100), new ChartData(100, 20, 35)];
        this.getChartAPIs[plantId]['garden']['lastTimeChart'] = new Date().getTime() - 86400000;
        
        this.getChartAPIs[plantId]['garden']['chart'] = document.querySelector(`#g${plantId} insys-chart > nvd3 > svg`);
        
        this.getChartAPIs[plantId]['api'] = this.homeServices.installGetChartAPI(15000000, plantId, this.getChartAPIs[plantId]['garden']['lastTimeChart'], (rs: any) => {
          if (!rs.data.length || !rs.data[0].values || !rs.data[0].values.length) return;
  
          let data = rs.data;
          pthis.getChartAPIs[plantId]['garden']['chartViewData'][0].values.push(...data[0].values);
          pthis.getChartAPIs[plantId]['garden']['chartViewData'][1].values.push(...data[1].values);
          pthis.getChartAPIs[plantId]['garden']['lastTimeChart'] = data[0].values.pop().x+1;
          pthis.getChartAPIs[plantId]['api'].params.timestampStart = pthis.getChartAPIs[plantId]['garden']['lastTimeChart'];
  
          let nowStart = new Date().getTime() - 86400000;
          pthis.getChartAPIs[plantId]['garden']['chartViewData'][0].values = pthis.getChartAPIs[plantId]['garden']['chartViewData'][0].values.filter(p => p.x > nowStart);
          pthis.getChartAPIs[plantId]['garden']['chartViewData'][1].values = pthis.getChartAPIs[plantId]['garden']['chartViewData'][1].values.filter(p => p.x > nowStart);

          pthis.updateCharts();
        });
      }
    }
    let tooltip = document.getElementsByClassName("nvtooltip");
    for (let i=0; i < tooltip.length; i++) (<any>(tooltip[i])).style.opacity = 0;
  }

  onClickOut(e) {
    if (e.target == e.currentTarget) {
      this.onBackToMain();
    }
  }

  isCameraView: boolean = false;
  onViewCamera(plant) {
    this.isCameraView = !this.isCameraView;
    this.isShowDetails = false;
    // this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
  }

  onAddNewPlant() {
    
  }

  onBackToMain() {
    if (!this.isCameraView && !this.isShowDetails) {
      this.isShowQuickView = false;
      this.blctl.disconnect();
    }
    this.isCameraView = false;
    this.isShowDetails = false;
  }

  onWater(garden: Garden) {
    this.homeServices.onWater(garden, (rs) => { console.log(rs); });
  }
  onToggleAuto(state) {
    // this.db.insertKey(this.currentPlants, "Garden");
    this.selectedPlant['auto'] = state;
    this.blctl.sendRecvWithCommand(1, "\x00" + String.fromCharCode(state), (data) => {
      console.log(data);
    })
  }
  onSwitchChange(pinIndex, e) {
    if (!this.selectedPlant['pins']) return;
    let state = e.target.checked;
    this.selectedPlant['pins'][pinIndex].state = state;
    this.blctl.sendRecvWithCommand(1, String.fromCharCode(pinIndex) + String.fromCharCode(state), (ready) => {
      if (ready) {
        ready.catch().then((rs) => {
        })
      }
    });
  }

  onLogout() {
    this.ionViewWillLeave();
    this.user.logout();
    this.navCtrl.setRoot('MyWelcomePage');
  }

  ionViewWillLeave() {
    for (let api in this.getChartAPIs) {
      this.homeServices.uninstallAPI(this.getChartAPIs[api]['api']);
    }
    this.homeServices.uninstallAPI(this.gardenAPI);
  }

  // @ViewChild(InsysChartComponent) listChart:any;

  updateCharts() {
    this.charts.forEach(chart => chart.update());
  }

}
