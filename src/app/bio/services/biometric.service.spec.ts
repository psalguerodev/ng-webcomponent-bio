import { TestBed } from '@angular/core/testing';

import { BiometricService } from './biometric.service';

describe('BiometricService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BiometricService = TestBed.get(BiometricService);
    expect(service).toBeTruthy();
  });
});
