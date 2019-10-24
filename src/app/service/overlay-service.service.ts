import {ElementRef, Injectable} from '@angular/core';
import {ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef} from "@angular/cdk/overlay";
import {ComponentPortal} from "@angular/cdk/portal";
import {FilterOverlayComponent} from "../components/filter-overlay/filter-overlay.component";
import {FilterOverlayDialogRef} from "../components/filter-overlay/filter-overlay-dialog-ref";


interface CustomOverlayConfig {
  panelClass?: string;
  hasBackdrop?: boolean;
  backdropClass?: string;
}

const DEFAULT_CONFIG: CustomOverlayConfig = {
  hasBackdrop: true,
  backdropClass: 'dark-backdrop',
  panelClass: 'tm-file-preview-dialog-panel'
}

@Injectable({
  providedIn: 'root'
})
export class OverlayServiceService {

  constructor(private overlay: Overlay) {
  }

  open(config: CustomOverlayConfig = {}, elementRef ?: ElementRef) {
    // Override default configuration
    const dialogConfig = {...DEFAULT_CONFIG, ...config};

    // Returns an OverlayRef which is a PortalHost
    const overlayRef = this.createOverlay(dialogConfig, elementRef);

    // Instantiate remote control
    const dialogRef = new FilterOverlayDialogRef(overlayRef);

    // Create ComponentPortal that can be attached to a PortalHost
    const filePreviewPortal = new ComponentPortal(FilterOverlayComponent);

    // Attach ComponentPortal to PortalHost
    overlayRef.attach(filePreviewPortal);

    overlayRef.backdropClick().subscribe(_ => dialogRef.close());

    return dialogRef;
  }

  private createOverlay(config: CustomOverlayConfig, elementRef ?: ElementRef) {
    // Returns an OverlayConfig
    const overlayConfig = this.getOverlayConfig(config, elementRef);

    // Returns an OverlayRef
    return this.overlay.create(overlayConfig);
  }

  private getOverlayConfig(config: CustomOverlayConfig, elementRef ?: ElementRef): OverlayConfig {
    let positionStrategy;
    if (elementRef) {
      console.log(elementRef)
      console.log("element")
      console.log(elementRef)
      positionStrategy = this.overlay      .position()
        .flexibleConnectedTo(elementRef.nativeElement) // <-- elementRef is the icon element from the screenshot
        .withPositions([
          { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' },
          { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' }
        ])
        .withPush(false);
    } else {
      positionStrategy = this.overlay.position().global().centerHorizontally().centerVertically();
      console.log("Global")
    }

    const overlayConfig = new OverlayConfig({
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy
    });

    return overlayConfig;
  }
}

