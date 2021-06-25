import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayementOptionComponent } from './payement-option.component';

describe('PayementOptionComponent', () => {
  let component: PayementOptionComponent;
  let fixture: ComponentFixture<PayementOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayementOptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayementOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
