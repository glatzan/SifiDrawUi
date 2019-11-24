import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterImageListComponent } from './filter-image-list.component';

describe('FilterImageListComponent', () => {
  let component: FilterImageListComponent;
  let fixture: ComponentFixture<FilterImageListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterImageListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterImageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
