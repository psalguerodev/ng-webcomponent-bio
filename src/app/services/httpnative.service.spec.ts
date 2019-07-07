import { TestBed } from '@angular/core/testing';

import { HttpnativeService } from './httpnative.service';

describe('HttpnativeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HttpnativeService = TestBed.get(HttpnativeService);
    expect(service).toBeTruthy();
  });
});
