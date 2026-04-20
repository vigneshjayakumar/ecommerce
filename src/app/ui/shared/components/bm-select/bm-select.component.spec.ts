import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BmSelectComponent } from './bm-select.component';

describe('BmSelectComponent', () => {
  let component: BmSelectComponent;
  let fixture: ComponentFixture<BmSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BmSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BmSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
