
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
}