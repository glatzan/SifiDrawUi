import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoViewComponent } from './histo-view.component';

describe('HistoViewComponent', () => {
  let component: HistoViewComponent;
  let fixture: ComponentFixture<HistoViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
