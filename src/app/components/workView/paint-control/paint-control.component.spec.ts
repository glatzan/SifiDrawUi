import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaintControlComponent } from './paint-control.component';

describe('PaintControlComponent', () => {
  let component: PaintControlComponent;
  let fixture: ComponentFixture<PaintControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaintControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaintControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
