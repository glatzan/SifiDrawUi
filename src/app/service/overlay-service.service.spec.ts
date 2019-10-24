import { TestBed } from '@angular/core/testing';

import { OverlayServiceService } from './overlay-service.service';

describe('OverlayServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OverlayServiceService = TestBed.get(OverlayServiceService);
    expect(service).toBeTruthy();
  });
});
