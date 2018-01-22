import { Component, ViewChild } from '@angular/core';
import { IonicPage, ModalController, NavController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';


import { Garden } from '../../models/garden';
import { Gardens } from '../../providers/gardens/gardens';
import { HomeServices } from './home.service';
import { IBaseAPI } from '../../providers/api/api';
import { Database } from '../../providers/storage/storage';
import { UserModule } from '../../providers/providers';
import { Observable } from 'rxjs/Observable';

import { BluetoothCtl } from '../../providers/connection/bluetoothctl';
import { ChartData } from '../../modules/insyschart/insyschart.module';
import { Chart } from 'chart.js';


@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  linechart: any;
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
    public homeServices: HomeServices, public blctl: BluetoothCtl, public sanitizer: DomSanitizer) {
    let pthis = this;

    this.clock = Observable.interval(1000).map(() => this.clockTime.setTime(this.clockTime.getTime() + 500));

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
        plant['chartData'] = [new ChartData("humidity", 0, 50, 100), new ChartData("temperature", 0, 20, 35)];
        plant['chartViewData'] = plant['chartData'];
        return plant;
      });
      pthis.currentPlants = gardens;
      pthis.selectedPlant = pthis.currentPlants[1];
    } else {
      this.gardenServices.query().observe.subscribe((gardens: any) => {
        gardens = gardens.map((plant: any) => {
          plant['pins'] = [true, true, true, true];
          plant['auto'] = true;
          plant['humidity'] = 0;
          plant['temperature'] = 0;
          plant['pH'] = 0;
          plant['chartData'] = [new ChartData("humidity", 0, 50, 100), new ChartData("temperature", 0, 20, 35)];
          plant['chartViewData'] = plant['chartData'];
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
      pthis.averageHumi = (totalHumi / count).toFixed(2);
      pthis.averageTemp = (totalTemp / count).toFixed(2);
      pthis.db.insertKey(pthis.currentPlants, "Garden");
      // if (pthis.chart && pthis.chart.update) pthis.chart.update();
    });

    this.weekday = 0;
    this.ytbchannel = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/y0NcwRYGOHU");

    this.blctl.setListener((cmd,sub1,sub2,data) => { this.resolveResponse(cmd,sub1,sub2,data) });
  }

  @ViewChild('insyschart') chart;
  ionViewDidLoad() {
    this.linechart = new Chart(this.chart.nativeElement, {
      type: 'line',
      data: {
        // labels: ["Độ Ẩm", "Nhiệt Độ"],
        // labels: new ChartData("Độ Ẩm",40, 60, 100).labels,
        labels: [],
        datasets: [{
          label: "Độ Ẩm",
          // data: new ChartData("Độ Ẩm",40, 60, 100).values,
          data: [],
          borderColor: "#5bc0de",
          fillStyle: "#f0ad4e",
          fill: false,
          pointRadius: 0
        }, {
          label: "Nhiệt Độ",
          // data: new ChartData("Độ Ẩm",40, 20, 35).values,
          data: [],
          borderColor: "#f0ad4e",
          fillStyle: "#f0ad4e",
          fill: false,
          pointRadius: 0
        }]
      },
      options: {
        scales: {
          xAxes: [{
            display: true,
            scaleLable: {
              display: true
            },
            ticks: {
              fontColor: "#fff"
            },
            type: 'time',
            time: {
              displayFormats: {
                 'millisecond': 'h:mm',
                 'second': 'h:mm',
                 'minute': 'h:mm',
                 'hour': 'h:mm',
                 'day': 'h:mm',
                 'week': 'MMM DD',
                 'month': 'MMM DD',
                 'quarter': 'h:mm',
                 'year': 'h:mm',
              }
            }
          }],
          yAxes: [{
            ticks: {
              // beginAtZero: true,
              scaleBeginAtZero: true,
              // suggestedMin: 0,
              // suggestedMax: 100,
              // max: 100,
              fontColor: "#fff"
            },
          }]
        },
        legend: {
            display: true,
            labels: {
              fontColor: '#fff',
              fontSize: 16
            }
        },
        Element: {
          line: {
            tension: 0
          }
        },
        tooltips: {
          mode: "index"
        },
        // animation: {
        //   duration: 0, // general animation time
        // },
        // hover: {
        //   animationDuration: 0, // duration of animations when hovering an item
        // },
        // responsiveAnimationDuration: 0, // animation duration after a resize
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  }

  isShowQuickView: boolean = false;
  selectedPlant: Garden;
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
        this.blctl.disconnect().then(() => {
          this.syncViaBluetooth();
        });
      } catch (e) { }
    }
  }

  syncViaBluetooth(justread = false) {
    let pthis = this;
    if (!this.blctl.connected) {
      this.blctl.sendRecvWithCommand([4,2], "", (data) => {
        resolveSyncData(data);
      }, () => {
      });
    }
    function resolveSyncData(data) {
      debugger
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
    }
  }

  resolveResponse(cmd, sub1, sub2, data) {
    switch (cmd) {
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        let info, time, humi, temp, pH;
        switch (sub1) {
          case 1:
            info = data.split("|");
            time = parseInt(info[0]);
            humi = parseInt(info[1]);
            temp = parseInt(info[2]);
            pH = parseInt(info[3]);
            this.selectedPlant.humidity = humi;
            this.selectedPlant.temperature = temp;
            this.selectedPlant.pH = pH;

            this.linechart.data.datasets[0].data.push(humi);
            this.linechart.data.datasets[1].data.push(temp);
            this.linechart.data.labels.push(time);
            if (this.linechart.data.labels.length > 50) {
              this.linechart.data.datasets[0].data.shift();
              this.linechart.data.datasets[1].data.shift();
              this.linechart.data.labels.shift();
            }
            this.linechart.updateDatasets();
            break;
          case 2:
            let records = JSON.parse(data);
            for (let i=records.length-1; i>=0; i--) {
              time = parseInt(records[i][0]);
              pH = parseInt(records[i][1]);
              temp = parseInt(records[i][2]);
              humi = parseInt(records[i][3]);
              this.linechart.data.datasets[0].data.push(humi);
              this.linechart.data.datasets[1].data.push(temp);
              this.linechart.data.labels.push(time);
              if (this.linechart.data.labels.length > 50) {
                this.linechart.data.datasets[0].data.shift();
                this.linechart.data.datasets[1].data.shift();
                this.linechart.data.labels.shift();
              }
            }
            this.linechart.update();
            break;
        }
        break;
      default:
        console.log("Unrecognite")
    }
  }

  onNewRecords(data) {

  }

  isShowDetails: boolean = false;
  private getChartAPIs: { [api: string]: {} } = {};
  onViewDetailPlant(plant) {
    // let pthis = this;
    // let plantId = plant['managerDeviceId'];
    this.isShowDetails = !this.isShowDetails;
    this.isCameraView = false;

    setTimeout(() => {
      // pthis.homeServices.installGetChartViaBluetooth(5000, () => {
      //   pthis.blctl.sendRecvWithCommand(3, "", (data) => {
      //     // let envs = data.split("|");
      //     // pthis.selectedPlant['humidity'] = parseFloat(envs[1])
      //     // pthis.selectedPlant['temperature'] = parseFloat(envs[2])
      //     // pthis.selectedPlant['pH'] = parseFloat(envs[3])
      //     // pthis.selectedPlant['chartData'][0].values.push({x: envs[0], y: pthis.selectedPlant['humidity']})
      //     // pthis.selectedPlant['chartData'][1].values.push({x: envs[0], y: pthis.selectedPlant['temperature']})
      //     // pthis.selectedPlant['chartViewData'] = pthis.selectedPlant['chartData'];
      //     // if (pthis.charts && pthis.charts.length>0)
      //     //   pthis.charts.forEach(chart => chart.update());
      //     console.log(data)
      //   })
      // });
    }, 1000);
    // if (this.isShowDetails) {
    //   if (!this.getChartAPIs[plantId]) {       // install api
    //     this.getChartAPIs[plantId] = {};
    //     this.getChartAPIs[plantId]['garden'] = this.currentPlants.find(g => g['managerDeviceId'] == plantId);
    //     this.getChartAPIs[plantId]['garden']['chartViewData'] = [new ChartData(100, 60, 100), new ChartData(100, 20, 35)];
    //     this.getChartAPIs[plantId]['garden']['lastTimeChart'] = new Date().getTime() - 86400000;

    //     this.getChartAPIs[plantId]['garden']['chart'] = document.querySelector(`#g${plantId} insys-chart > nvd3 > svg`);

    //     this.getChartAPIs[plantId]['api'] = this.homeServices.installGetChartAPI(15000000, plantId, this.getChartAPIs[plantId]['garden']['lastTimeChart'], (rs: any) => {
    //       if (!rs.data.length || !rs.data[0].values || !rs.data[0].values.length) return;

    //       let data = rs.data;
    //       pthis.getChartAPIs[plantId]['garden']['chartViewData'][0].values.push(...data[0].values);
    //       pthis.getChartAPIs[plantId]['garden']['chartViewData'][1].values.push(...data[1].values);
    //       pthis.getChartAPIs[plantId]['garden']['lastTimeChart'] = data[0].values.pop().x+1;
    //       pthis.getChartAPIs[plantId]['api'].params.timestampStart = pthis.getChartAPIs[plantId]['garden']['lastTimeChart'];

    //       let nowStart = new Date().getTime() - 86400000;
    //       pthis.getChartAPIs[plantId]['garden']['chartViewData'][0].values = pthis.getChartAPIs[plantId]['garden']['chartViewData'][0].values.filter(p => p.x > nowStart);
    //       pthis.getChartAPIs[plantId]['garden']['chartViewData'][1].values = pthis.getChartAPIs[plantId]['garden']['chartViewData'][1].values.filter(p => p.x > nowStart);

    //       pthis.updateCharts();
    //     });
    //   }
    // }
    let tooltip = document.getElementsByClassName("nvtooltip");
    for (let i = 0; i < tooltip.length; i++) (<any>(tooltip[i])).style.opacity = 0;
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
    // this.blctl.sendWithCommand(4, "", () => {
    // })
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
    this.blctl.sendRecvWithCommand(1, String.fromCharCode(pinIndex) + String.fromCharCode(state), (data) => {
      console.log(data);
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
}
