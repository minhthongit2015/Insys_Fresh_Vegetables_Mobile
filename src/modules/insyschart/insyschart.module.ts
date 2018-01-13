import { NgModule } from '@angular/core';
import { InsysChartComponent } from './insyschart.component';
import { nvD3 } from "./nvd3.core";

import './d3.min_3.5.6.js';
// import './d3.min_4.9.1.js';
import './nv.d3.min_1.8.4.js';
// import './nv.d3_1.8.1.css';

@NgModule({
  declarations: [InsysChartComponent, nvD3],
  imports: [],
  exports: [InsysChartComponent],
  providers: []
})
export class InsysChartModule { }

export class ChartData {
  key: string = "";
  values: number[] = [];
  labels: any[] = [];

  constructor(key: string = "", length: number = 0, min: number = 0, max: number = 0) {
    this.key = key;
    for (let i=0; i<length; i++) {
      // this.values[i] = new ChartRecord(i*10, (Math.random()*(max-min+1) + min).toFixed(2));
      // this.values[i] = {x: i*10, y: parseFloat((Math.random()*(max-min+1) + min).toFixed(2))};
      this.values[i] = parseFloat((Math.random()*(max-min+1) + min).toFixed(2));
      this.labels[i] = i*5*60*1000;
    }
  }
}

export class ChartRecord {
  x: any;
  y: any;
  constructor(x: number, y: any) {
    this.x = x;
    this.y = parseInt(y);
  }
}