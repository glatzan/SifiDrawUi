import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubImageListComponent } from './sub-image-list.component';

describe('FilterImageListComponent', () => {
  let component: SubImageListComponent;
  let fixture: ComponentFixture<SubImageListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubImageListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubImageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
