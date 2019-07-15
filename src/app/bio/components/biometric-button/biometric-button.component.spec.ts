import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatProgressSpinnerModule, MatButtonModule } from '@angular/material';
import { BiometricButtonComponent } from './biometric-button.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


describe('BiometricButtonComponent', () => {
  let component: BiometricButtonComponent;
  let fixture: ComponentFixture<BiometricButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BiometricButtonComponent ],
      imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        FormsModule,
        MatProgressSpinnerModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
