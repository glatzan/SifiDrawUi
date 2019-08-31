import { TestBed } from '@angular/core/testing';

import { ImageMagicService } from './image-magic.service';

describe('ImageMagicService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImageMagicService = TestBed.get(ImageMagicService);
    expect(service).toBeTruthy();
  });
});
