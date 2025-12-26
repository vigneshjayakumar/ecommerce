import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllProductsListComponent } from './all-products-list.component';

describe('AllProductsListComponent', () => {
  let component: AllProductsListComponent;
  let fixture: ComponentFixture<AllProductsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllProductsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllProductsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
