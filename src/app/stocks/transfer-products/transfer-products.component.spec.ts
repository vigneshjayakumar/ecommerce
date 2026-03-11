import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferProductsComponent } from './transfer-products.component';

describe('TransferProductsComponent', () => {
  let component: TransferProductsComponent;
  let fixture: ComponentFixture<TransferProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
