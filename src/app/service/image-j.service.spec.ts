import { TestBed } from '@angular/core/testing';

import { ImageJService } from './image-j.service';

describe('ImageJService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImageJService = TestBed.get(ImageJService);
    expect(service).toBeTruthy();
  });
});
