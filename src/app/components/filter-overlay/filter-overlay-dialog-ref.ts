import {OverlayRef} from "@angular/cdk/overlay";

export class FilterOverlayDialogRef {
  constructor(private overlayRef: OverlayRef) {
  }

  close(): void {
    this.overlayRef.dispose();
  }
}
