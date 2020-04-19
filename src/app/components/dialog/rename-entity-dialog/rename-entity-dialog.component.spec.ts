import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenameEntityDialogComponent } from './rename-entity-dialog.component';

describe('RenameEntityDialogComponent', () => {
  let component: RenameEntityDialogComponent;
  let fixture: ComponentFixture<RenameEntityDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenameEntityDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameEntityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
