import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPopupModalComponent } from './custom-popup-modal.component';

describe('CustomPopupModalComponent', () => {
  let component: CustomPopupModalComponent;
  let fixture: ComponentFixture<CustomPopupModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomPopupModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomPopupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
