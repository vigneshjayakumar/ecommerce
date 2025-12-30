import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewEditProductComponent } from './create-new-edit-product.component';

describe('CreateNewEditProductComponent', () => {
  let component: CreateNewEditProductComponent;
  let fixture: ComponentFixture<CreateNewEditProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateNewEditProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateNewEditProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
