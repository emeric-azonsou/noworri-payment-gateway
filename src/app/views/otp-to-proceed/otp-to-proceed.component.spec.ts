import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpToProceedComponent } from './otp-to-proceed.component';

describe('OtpToProceedComponent', () => {
  let component: OtpToProceedComponent;
  let fixture: ComponentFixture<OtpToProceedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtpToProceedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpToProceedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
