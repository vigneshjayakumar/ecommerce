import { Component, Input, OnChanges } from '@angular/core';
import { Chart, ChartType, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { INRCurrency } from 'src/app/common/pipes/inr-currency.pipe';

@Component({
  selector: 'app-sales-charts',
  imports: [BaseChartDirective, INRCurrency],
  templateUrl: './sales-charts.component.html',
  styleUrl: './sales-charts.component.css'
})
export class SalesChartsComponent implements OnChanges {
  @Input({ required: true }) invoiceSummaryList: any[] = [];
  @Input({ required: true }) invoiceSummaryOverall: any = null;
  noData = false;

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

  ngOnChanges(): void {
    if (!this.invoiceSummaryList.length) {
      this.noData = true
      return
    };
    this.noData = false;
    this.renderCharts();
  }

  renderCharts() {
    const labels = this.invoiceSummaryList.map(x => x.period);
    const salesData = this.invoiceSummaryList.map(x => Number(x.totalSales));
    const invoiceCount = this.invoiceSummaryList.map(x => x.invoiceCount);

    this.chartData = {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Total Sales',
          data: salesData,
          yAxisID: 'y1'
        },
        {
          type: 'bar',
          label: 'Invoice Count',
          data: invoiceCount,
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
          title: { 'display': true, 'text': 'Invoices' }
        },
        y1: {
          position: 'right',
          'beginAtZero': true,
          grid: { drawOnChartArea: false },
          title: { display: true, 'text': 'Sales Amount' }
        }
      }
    }
    console.log('DATA', this.invoiceSummaryList, this.invoiceSummaryOverall, labels, salesData);
  }
}
