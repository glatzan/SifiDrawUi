import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerPresetDialogComponent } from './layer-preset-dialog.component';

describe('LayerPresetDialogComponent', () => {
  let component: LayerPresetDialogComponent;
  let fixture: ComponentFixture<LayerPresetDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayerPresetDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerPresetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
