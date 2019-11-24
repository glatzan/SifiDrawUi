import { TestBed } from '@angular/core/testing';

import { WorkViewService } from './work-view.service';

describe('WorkViewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkViewService = TestBed.get(WorkViewService);
    expect(service).toBeTruthy();
  });
});
