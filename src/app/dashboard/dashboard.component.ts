import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs/internal/operators/tap';
import { catchError, EMPTY, of, Subscription, switchMap } from 'rxjs';

import { DashboardApiService, TRevenueGraphData, TTopSellerGraphData, TTotalRevenueTrends } from './services/dashboard-api.service';
import { BranchWiseService } from '../branch-wise/branch-wise.service';
import { Router } from '@angular/router';
import { InvoiceService, TInvoiceListEle } from '../admin/invoice/invoice.service';
import { INRCurrency } from '../common/pipes/inr-currency.pipe';
import { DatePipe, NgClass } from '@angular/common';
import { TableComponent } from '../ui/shared/components/table/table.component';
import { NgxEchartsDirective } from 'ngx-echarts';
import { BmSelectComponent } from '../ui/shared/components/bm-select/bm-select.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    ReactiveFormsModule, TableComponent, NgxEchartsDirective, NgClass, BmSelectComponent, FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [DatePipe, INRCurrency]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardApiService = inject(DashboardApiService);
  private branchService = inject(BranchWiseService);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private datePipe = inject(DatePipe);
  private INRCurrency = inject(INRCurrency);

  private subs: Subscription[] = [];

  chartDurationSelect = [
    { label: '7 Days', value: '7' },
    {
      label: '30 Days', value: '30'
    }, {
      label: '60 Days', value: '60'
    }
  ];

  selectDuration = '7'


  branchList: { value: number, label: string }[] = [];
  invoiceList: TInvoiceListEle[] = [];
  productsTableColumn: { key: string, label: string }[] = [
    { key: 'invoiceId', label: 'Invoice ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'amt', label: 'Amount' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
  ];

  productTableRows: { [key: number]: { col: string, value: string }[] }[] = []

  insightsCardsList = [
    {
      label: 'Total Revenue',
      icon: 'assets/icons/total-revenue.svg',
      data: '₹1,00,000',
      trends: {
        icon: 'assets/icons/trending-up.svg',
        trendsValue: '12%',
        class: 'trending-up'
      }
    },
    {
      label: 'Paid Invoice',
      icon: 'assets/icons/paid-invoices.svg',
      data: '350',
    },
    {
      label: 'Pending Invoice',
      icon: 'assets/icons/pending-invoice.svg',
      data: '48',
    },
    {
      label: 'Cancelled Invoice',
      icon: 'assets/icons/failed-payment.svg',
      data: '6',
    },
  ]


  private mapDataIntoTableRows = (schProductList: TInvoiceListEle[]) => {
    this.productTableRows = [];
    schProductList.forEach((ele, i) => {
      const tempEle = {
        [i]: [
          { col: 'invoice_number', value: ele.invoice_number },
          { col: 'customer_name', value: ele.customer_name },
          { col: 'total_amount', value: ele.total_amount, formatter: (value: string) => this.INRCurrency.transform(value) },
          { col: 'date', value: ele.created_at.toString().split('T')[0], formatter: (value: any) => this.datePipe.transform(value, 'mediumDate') },
          { col: 'status', value: ele.invoice_status, class: this.activeClass(ele.invoice_status), formatter: (value: string) => (value[0].toUpperCase() + value.substring(1).toLowerCase()) }
        ]
      }
      this.productTableRows.push(tempEle)
    })
  }
  private activeClass(status: "DRAFT" | "PAID" | "CANCELLED" | "CONFIRMED") {
    let styleClass = 'bm-chip-success';
    if (status === 'DRAFT') styleClass = 'bm-chip-netural';
    if (status === 'CONFIRMED') styleClass = 'bm-chip-warning';
    if (status === 'CANCELLED') styleClass = 'bm-chip-danger';
    return styleClass
  }
  private fetchInvoiceList() {
    const sub = this.invoiceService.fetchInvoiceLists()
      .pipe(tap(res => this.mapDataIntoTableRows(res)))
      .subscribe();
    this.subs.push(sub);
  }

  revenueChartOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const value = params[0].value.toLocaleString('en-IN');
        return `${params[0].axisValue}<br/><b>₹ ${value}</b>`;
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Apr 1', 'Apr 2', 'Apr 3', 'Apr 4', 'Apr 5', 'Apr 6', 'Apr 7'],
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#eee' } }
    },
    grid: {
      left: 10,
      right: 10,
      top: 20,
      bottom: 10,
      containLabel: true
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: [170000, 190000, 160000, 200000, 210000, 195000, 220000],
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3
        },
        areaStyle: {
          opacity: 0.2
        }
      }
    ]
  };

  topSellersOption = {
    color: ['#83C5BE', '#FFDDD2', '#006D77', '#E29578'],
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>${params.value}%`;
      }
    },

    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      icon: 'circle'
    },

    series: [
      {
        name: 'Top Sellers',
        type: 'pie',

        radius: ['20%', '65%'], // donut shape

        center: ['30%', '50%'], // shift left (space for legend)

        avoidLabelOverlap: true,

        itemStyle: {
          borderRadius: 2,
          borderColor: '#fff',
          borderWidth: 2
        },

        label: {
          show: true,
          position: 'inside',
          formatter: '{d}%',
          fontWeight: 'bold'
        },

        labelLine: {
          show: false
        },

        data: [
          { value: 40, name: 'Product 1' },
          { value: 30, name: 'Product 2' },
          { value: 20, name: 'Product 3' },
          { value: 10, name: 'Product 4' }
        ]
      }
    ]
  };

  private overAllSalesReport() {
    const sub = this.invoiceService.getOverallSalesReport().pipe(tap(res => console.log('Over all sales', res))).subscribe();
    this.subs.push(sub);
  }

  private revenueChartData: TRevenueGraphData['response']['revenueGraph'] = [];
  updateOptions!: { xAxis: { data: string[] }, series: [{ data: number[] }] }

  totalStockCount = 0;
  totalProductsCount = 0;
  lowStockCount = 0;
  outOfStockCount = 0;

  private totalRevenueTrends() {
    const sub = this.dashboardApiService.getTotalRevenueTrends('30')
      .pipe(
        tap(res => {
          this.mapTotalRevenue(res);
          this.mapInvoiceCount(res)
        }),
        switchMap(() => this.dashboardApiService.getRevenueGraph('90', '1')))
      .pipe(
        tap(res => {
          this.revenueChartData = res.response.revenueGraph;
          this.mapRevenueGraphData()
        }), switchMap(() => this.dashboardApiService.getTopSeller('90', '1')))
      .pipe(tap(res => this.mapTopSellerGraphData(res)),
        switchMap(() => this.dashboardApiService.getTotalItemsBranchwise('1').pipe(tap(res => {
          const totalCounts = res.response.totalItems;

          this.totalStockCount = +totalCounts.total_stock_quantity;
          this.totalProductsCount = +totalCounts.total_products;
          this.lowStockCount = +totalCounts.low_stock_count;
          this.outOfStockCount = +totalCounts.out_of_stock_count;
        })))
      )
      .subscribe();
    this.subs.push(sub);
  }

  updateTopSellerOptions!: { series: [{ data: { value: number, name: string }[] }] }
  private mapTopSellerGraphData(res: TTopSellerGraphData) {
    let data = res.response.topSeller.map(ele => ({ ...ele, value: +ele.value }));
    this.updateTopSellerOptions = {
      series: [{
        data
      }]
    }
  }

  private mapRevenueGraphData() {
    this.revenueChartData = this.revenueChartData.map(ele => ({ ...ele, 'date': this.datePipe.transform(ele.date, 'MMM dd') ?? '' }));
    this.updateOptions = {
      xAxis: {
        data: this.revenueChartData.map(ele => ele.date)
      },
      series: [{ data: this.revenueChartData.map(ele => +ele.revenue) }]
    }
    console.log('REVENUE', this.revenueChartData, this.revenueChartOption)
  }

  private mapInvoiceCount(res: TTotalRevenueTrends) {
    const invoiceStatus = res.response.invoiceStatusDetails;
    this.insightsCardsList[1].data = invoiceStatus.paid.length.toString();
    this.insightsCardsList[2].data = invoiceStatus.confirmed.length.toString();
    this.insightsCardsList[3].data = invoiceStatus.cancelled.length.toString();
  }
  private mapTotalRevenue(res: TTotalRevenueTrends) {
    let revenue = Math.round(+res.response.totalRevenue.current_revenue).toString();
    revenue = this.INRCurrency.transform(revenue);
    this.insightsCardsList[0].data = revenue;
    this.insightsCardsList[0].trends!.icon = res.response.totalRevenue.trend_direction === 'DOWN' ? 'assets/icons/trending-down.svg' : 'assets/icons/trending-up.svg';
    let percent: string | string[] = res.response.totalRevenue.trend_percent.split('');
    percent.splice(0, 1)
    this.insightsCardsList[0].trends!.trendsValue = percent.join('').split('.')[0] + '%';
    this.insightsCardsList[0].trends!.class = res.response.totalRevenue.trend_direction === 'DOWN' ? 'trending-down' : 'trending-up'
  }
  // New Dashboard 2.0 refactoring ending.


  stockSummaryList: TStockSummaryRes['response'] = [];
  invoiceSummaryList: TInvoiceSummary['response']['data'] = [];
  invoiceSummaryOverall: TInvoiceSummary['response']['summary'] = {
    invoiceCount: 0,
    totalSales: 0,
  };

  today = new Date();

  startDate: Date = new Date(this.today);
  endDate: Date = new Date();
  paymentFilter: TpaymentStatus = 'DRAFT';

  dateRangeForm = new FormGroup({
    start: new FormControl(this.startDate),
    end: new FormControl(this.endDate),
  });
  filterSelect = new FormControl(this.paymentFilter);

  dateChangeSubs = this.dateRangeForm.controls['end'].valueChanges
    .pipe(
      switchMap((res) => {
        const start = this.dateRangeForm.controls['start'].value ?? '';
        if (res && start) {
          this.startDate = new Date(start);
          this.endDate = new Date(res);
          return this.fetchSalesReport();
        }
        return EMPTY;
      }),
    )
    .subscribe();

  paymentFilterChangeSubs = this.filterSelect.valueChanges
    .pipe(
      switchMap((filterTerm) => {
        if (filterTerm) {
          this.paymentFilter = filterTerm as TpaymentStatus;
          return this.fetchSalesReport();
        }
        return EMPTY;
      }),
    )
    .subscribe();


  ngOnInit(): void {
    this.fetchInvoiceList();
    this.overAllSalesReport();
    this.totalRevenueTrends();
    const sub = this.branchService.getBranchList().pipe(
      tap(res => this.branchList = res.map(ele => ({ value: +ele.id, label: ele.branch_name })))
    ).subscribe();
    this.subs.push(sub);

    this.startDate.setDate(this.today.getDate() - 30);
    this.dashboardApiService
      .getStockReport()
      .pipe(
        tap((res) => (this.stockSummaryList = res)),
        switchMap(() => this.fetchSalesReport()),
      )
      .subscribe();
  }
  private fetchSalesReport() {
    const payload: { start: string; end: string; paymentStatus: string } = {
      start: this.startDate.toISOString(),
      end: this.endDate.toISOString(),
      paymentStatus: this.paymentFilter,
    };
    console.log(payload);
    return this.dashboardApiService.getSalesReport(payload).pipe(
      tap((res) => {
        this.invoiceSummaryList = res.data;
        this.invoiceSummaryOverall = res.summary;
      }),
      catchError((err) => {
        console.log('ERROR', err);
        return of({});
      }),
    );
  }

  onRouteTo(path: '/admin/invoice/create-invoice' | '/admin/create-new' | '/invoice/invoice-lists' | '/branch/list') {
    this.router.navigate([path])
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => {
      if (sub) sub.unsubscribe()
    })
  }
}

type TpaymentStatus = 'ALL' | 'PAID' | 'CANCELLED' | 'DRAFT';

export type TStockSummaryRes = {
  message: string;
  response: {
    productId: number;
    productName: string;
    availableQty: number;
    lowStock: boolean;
  }[];
};

export type TInvoiceSummary = {
  message: string;
  response: {
    summary: {
      invoiceCount: number;
      totalSales: number;
    };
    data: {
      period: string;
      invoiceCount: number;
      totalSales: number;
    }[];
  };
};
