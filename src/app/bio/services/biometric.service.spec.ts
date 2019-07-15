import { TestBed } from '@angular/core/testing';

import { BiometricService } from './biometric.service';
import { HttpClientModule } from '@angular/common/http';

describe('BiometricService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientModule]
  }));

  it('should be created', () => {
    const service: BiometricService = TestBed.get(BiometricService);
    expect(service).toBeTruthy();
  });
});
