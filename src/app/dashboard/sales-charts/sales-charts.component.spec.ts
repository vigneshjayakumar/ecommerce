import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesChartsComponent } from './sales-charts.component';

describe('ChartsComponent', () => {
  let component: SalesChartsComponent;
  let fixture: ComponentFixture<SalesChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesChartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
