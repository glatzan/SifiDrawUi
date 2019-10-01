import { TestBed } from '@angular/core/testing';

import { ScImportService } from './sc-import.service';

describe('ScImportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScImportService = TestBed.get(ScImportService);
    expect(service).toBeTruthy();
  });
});
