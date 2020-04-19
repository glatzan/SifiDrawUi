import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSetDialogComponent } from './filter-set-dialog.component';

describe('FilterSetDialogComponent', () => {
  let component: FilterSetDialogComponent;
  let fixture: ComponentFixture<FilterSetDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterSetDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterSetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
