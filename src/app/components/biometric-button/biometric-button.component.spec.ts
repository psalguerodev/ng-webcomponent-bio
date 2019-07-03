import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BiometricButtonComponent } from './biometric-button.component';

describe('BiometricButtonComponent', () => {
  let component: BiometricButtonComponent;
  let fixture: ComponentFixture<BiometricButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BiometricButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BiometricButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
