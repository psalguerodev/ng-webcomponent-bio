import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule, MatDialogModule, MatProgressSpinnerModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FingerPipe } from '../../pipes/finger.pipe';
import { FingerimagePipe } from '../../pipes/fingerimage.pipe';
import { ImagePipe } from '../../pipes/image.pipe';
import { BiometricPopupComponent } from './biometric-popup.component';
import { InputUser } from '../../models/inputuser.model';
import { BiometricService } from '../../services/biometric.service';
import { HttpClientModule } from '@angular/common/http';


describe('BiometricPopupComponent', () => {
  let component: BiometricPopupComponent;
  let fixture: ComponentFixture<BiometricPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BiometricPopupComponent,
        FingerPipe,
        ImagePipe,
        FingerimagePipe
      ],
      imports: [
        HttpClientModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatDialogModule
      ],
      providers: [
        BiometricService,
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {} as InputUser
        },
      ]
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
