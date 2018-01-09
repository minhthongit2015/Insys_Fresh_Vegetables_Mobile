import { Component, Input, ViewChild, AfterViewInit } from '@angular/core';
// import { allData, allOptions } from './demo-data';
import { nvD3 } from './nvd3.core';

/**
 * For more detail: 
 * https://github.com/krispo/ng2-nvd3
 * https://nvd3-community.github.io/nvd3/examples/documentation.html
 * https://nvd3-community.github.io/nvd3/examples/site.html
 * http://www.d3noob.org/2013/01/smoothing-out-lines-in-d3js.html
 */

// declare let d3: any;
/*
[*] Here's the list of available options and for more about them head on over to the D3 wiki and look for 'line.interpolate'.
  linear – Normal line (jagged).
  step-before – a stepping graph alternating between vertical and horizontal segments.
  step-after - a stepping graph alternating between horizontal and vertical segments.
  basis - a B-spline, with control point duplication on the ends (that's the one above).
  basis-open - an open B-spline; may not intersect the start or end.
  basis-closed - a closed B-spline, with the start and the end closed in a loop.
  bundle - equivalent to basis, except a separate tension parameter is used to straighten the spline. This could be really cool with varying tension.
  cardinal - a Cardinal spline, with control point duplication on the ends. It looks slightly more 'jagged' than basis.
  cardinal-open - an open Cardinal spline; may not intersect the start or end, but will intersect other control points. So kind of shorter than 'cardinal'.
  cardinal-closed - a closed Cardinal spline, looped back on itself.
  monotone - cubic interpolation that makes the graph only slightly smoother.
*/
@Component({
  selector: 'insys-chart',
  template: `<nvd3 [options]="options" [data]="data" #nvd3></nvd3>`
})
export class InsysChartComponent implements AfterViewInit {
  ngAfterViewInit(): void {
  }

  @ViewChild("insys-chart") wrapper: any;

  @ViewChild("nvd3") nvD3: nvD3;

  private _options: any;
  @Input("options")
  set options(options: any) {
    if (!options) return;
    this._options = options;
  }
  get options() { return this._options }

  private _data: any;
  @Input("data")
  set data(data: any) {
    if (!data) return;
    this._data = data;
  }
  get data() { return this._data }

  update() {
    if (this.nvD3 && this.nvD3.chart && this.nvD3.chart.update) this.nvD3.chart.update();

    // if (this.nvD3 && this.nvD3.chart) this.nvD3.chart.update();
    // console.log(this.nvD3.chart.update)
  }

  ngOnInit() {
    /* test */
    // this.options = allOptions["lineChart"];
    // this.data = allData["lineChart"];
    // console.log("Insys chart init.")
  }

  initChart(options: any, data: any) {
    this.options = options;
    this.data = data;
  }

  setOptions(options: any) {
    this.options = options;
  }

  setData(data: any) {
    this.data = data;
  }

}
