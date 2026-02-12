import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TStockSummaryRes } from '../dashboard.component';
import { Chart, ChartType, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-stock-charts',
  imports: [BaseChartDirective],
  templateUrl: './stock-charts.component.html',
  styleUrl: './stock-charts.component.css'
})
export class StockChartsComponent implements OnChanges {
  @Input({ required: true }) stockData: TStockSummaryRes['response'] = [];

  noData = true;

  constructor() {
    Chart.register(...registerables);
  }

  chartType: ChartType = 'bar';
  chartData: Chart<'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar'>['data'] = {
    labels: [],
    datasets: []
  }
  chartOptions: Chart<'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'radar' | 'polarArea'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.stockData.length) {
      this.noData = true;
      return
    }
    this.noData = false;
    this.renderCharts();
  }

  private renderCharts() {
    const labels = this.stockData.map(x => x.productName);
    const dataSet = this.stockData.map(x => x.availableQty);

    this.chartData = {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Product Quantity',
          data: dataSet,
          backgroundColor: function (context) {
            const value = context.dataset.data[context.dataIndex];
            if (typeof value === 'number' && value < 10) {
              return 'rgba(244, 35, 20, 0.5)';
            }
            return 'rgba(102, 116, 26, 0.5)'; // Default color
          },
          yAxisID: 'y'
        }
      ]
    }

    this.chartOptions = {
      'responsive': true,
      scales: {
        y: {
          position: 'left',
          beginAtZero: true,
          title: { 'display': true, 'text': 'Product' }
        },
      }
    }
    console.log(labels, dataSet);
  }
}
