import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BiometricPopupComponent } from './biometric-popup.component';

describe('BiometricPopupComponent', () => {
  let component: BiometricPopupComponent;
  let fixture: ComponentFixture<BiometricPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BiometricPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BiometricPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
