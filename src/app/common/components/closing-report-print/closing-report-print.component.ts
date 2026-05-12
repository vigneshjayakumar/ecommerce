import { Component, EventEmitter, inject, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map, Observable, of, Subscription } from 'rxjs';

import { DashboardApiService, TOverallInvoicePrintRes, TOverAllPurchasePrintRes, TOverallTransferPrintRes } from 'src/app/dashboard/services/dashboard-api.service';
import { BmDateRangeComponent, IDateRange } from "src/app/ui/shared/components/bm-date-range/bm-date-range.component";
import { BmSelectComponent } from 'src/app/ui/shared/components/bm-select/bm-select.component';
import { TableComponent } from 'src/app/ui/shared/components/table/table.component';
import { ElectronPrintService, TOverallPrintPayload, TPrinterPayload } from '../../services/electron-print-agent.service';

type TPrintResponse = TOverallInvoicePrintRes['response'] | TOverAllPurchasePrintRes['response'] | TOverallTransferPrintRes['response']
type TTableRow = Record<string, any>;
@Component({
  selector: 'app-closing-report-print',
  imports: [BmDateRangeComponent, FormsModule, BmSelectComponent, TableComponent],
  templateUrl: './closing-report-print.component.html',
  styleUrl: './closing-report-print.component.css'
})
export class ClosingReportPrintComponent implements OnDestroy {
  @Output() buttonAction = new EventEmitter<'Cancel' | 'Print'>();

  private dashboardService = inject(DashboardApiService);
  private printAgentService = inject(ElectronPrintService);

  printSubsription!: Subscription;
  tableColumn: { label: string, key: string }[] = [];
  tableRowContent: { [key: number]: { col: string, value: string }[] }[] = [];

  selectedDateRange: IDateRange = { 'from': null, 'to': null };

  printTypes = [
    { value: 'Invoice', label: 'Invoice' },
    { value: 'Purchase', label: 'Purchase' },
    { value: 'Transfer', label: 'Transfer' }
  ]

  selectPrintType: string = 'Invoice';
  onSelectedChanges(event: string) {
    this.selectPrintType = event;
  }

  onDateRangeChange(event: boolean) {
    if (!event) return;
    let printObs: Observable<TPrintResponse> = of([])
    switch (this.selectPrintType) {
      case 'Invoice':
        printObs = this.dashboardService.getInvocieDailyPrint(this.selectedDateRange).pipe(map(res => res.response));
        break;
      case 'Purchase':
        printObs = this.dashboardService.getPurchaseDailyPrint(this.selectedDateRange).pipe(map(res => res.response));
        break;
      case 'Transfer':
        printObs = this.dashboardService.getTransferDailyPrint(this.selectedDateRange).pipe(map(res => res.response));
        break;
    }
    this.printSubsription = printObs.subscribe((res) => {
      this.previewPrintData = res;
      this.mapPrintPreview();
    });
  }
  previewPrintData: TTableRow[] = [];
  mapPrintPreview() {
    if (!this.previewPrintData?.length) return;
    const heading = Object.keys(this.previewPrintData[0]);
    this.tableColumn = heading.map(ele => ({
      label: ele,
      key: ele
    }));
    this.tableRowContent = [];
    this.previewPrintData.forEach((ele, i) => {
      const rowData = heading.map(col => ({
        col,
        value: ele[col]
      }));
      this.tableRowContent.push({
        [i]: rowData
      });
    });
    console.log('RESPONSE', heading, this.previewPrintData);
  }

  onButtonClick(action: 'Cancel' | 'Print') {
    if (action === 'Print') this.onPrint()
    this.buttonAction.emit(action)
  }

  onPrint() {
    this.mapPrintingDetails().subscribe(res => console.log(res));
  }

  private mapPrintingDetails() {
    const payload: TOverallPrintPayload = {
      'transport': 'usb',
      'title': 'Report',
      'cut': true,
      'date': new Date().toString(),
      'footer': 'Thank You!!!',
      'items': this.tableRowContent,
      'productId': 33054,
      'vendorId': 4070,
      'subtitle': 'Print'
    }
    console.log(payload);
    return this.printAgentService.postOverallPrint(payload);
  }

  ngOnDestroy(): void {
    if (this.printSubsription) this.printSubsription.unsubscribe()
  }
}
