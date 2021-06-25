import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyUserPageComponent } from './empty-user-page.component';

describe('EmptyUserPageComponent', () => {
  let component: EmptyUserPageComponent;
  let fixture: ComponentFixture<EmptyUserPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmptyUserPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptyUserPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
