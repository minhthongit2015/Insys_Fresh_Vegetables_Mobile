
import { Chart } from 'chart.js';

export class InSysChartJS {
  public linechart: Chart;

  constructor(chart_element) {
    this.linechart = new Chart(chart_element.nativeElement, {
      type: 'line',
      data: {
        // labels: ["Độ Ẩm", "Nhiệt Độ"],
        // labels: new ChartData("Độ Ẩm",40, 60, 100).labels,
        labels: [],
        datasets: [{
          label: "Nhiệt Độ",
          // data: new ChartData("Độ Ẩm",40, 60, 100).values,
          data: [],
          borderColor: "#f0ad4e",
          fillStyle: "#f0ad4e",
          fill: false,
          pointRadius: 0
        }, {
          label: "Độ Ẩm",
          // data: new ChartData("Độ Ẩm",40, 20, 35).values,
          data: [],
          borderColor: "#5bc0de",
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

  public attachRecords(records: any[]) {
    for (let record of records) {
      let timestamp = record[0];
      let temperature = record[1][0];
      let humidity = record[1][1];
      this.linechart.data.labels.push(timestamp*1000);
      this.linechart.data.datasets[0].data.push(temperature);
      this.linechart.data.datasets[1].data.push(humidity);
      // if (this.linechart.data.labels.length > 50) {
      //   this.linechart.data.labels.shift();
      //   this.linechart.data.datasets[0].data.shift();
      //   this.linechart.data.datasets[1].data.shift();
      // }
    }
    this.linechart.update();
  }

  public pushRecords(records: any[]) {

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
}