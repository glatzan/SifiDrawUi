import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {UserSettings} from "../../model/user-settings";
import {AuthenticationService} from "../../service/authentication.service";
import {Layer} from "../../model/layer";
import CImageUtil from "../../utils/cimage-util";
import {SImage} from "../../model/SImage";
import {LayerType} from "../../model/layer-type.enum";

@Component({
  selector: 'app-layer-preset-dialog',
  templateUrl: './layer-preset-dialog.component.html',
  styleUrls: ['./layer-preset-dialog.component.scss']
})
export class LayerPresetDialogComponent implements OnInit {

  userSettings: UserSettings;

  selectedLayerSetting: Layer;

  contentChanged = false;

  layerTypes = LayerType;

  constructor(public dialogRef: MatDialogRef<LayerPresetDialogComponent>,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.userSettings = new UserSettings();
    this.userSettings.defaultLayerSettings = [];
    this.userSettings.defaultLayerSettings.push(new Layer(""));
    this.selectedLayerSetting = this.userSettings.defaultLayerSettings[0]

    this.authenticationService.getUserSettings(this.authenticationService.currentUserValue.name).subscribe(x => {
        this.userSettings = x;
        if (this.userSettings.defaultLayerSettings.length > 0)
          this.selectedLayerSetting = this.userSettings.defaultLayerSettings[0];
      }
    )
  }

  onChange($event) {
    this.contentChanged = true
  }

  saveSettings() {
    this.authenticationService.updateUserSettings(this.userSettings).subscribe();
    this.contentChanged = false;
  }

  newLayer() {
    const tmp = new SImage();
    tmp.setLayers(this.userSettings.defaultLayerSettings);
    const layer = CImageUtil.addLayer(tmp);
    this.userSettings.defaultLayerSettings = tmp.getLayers();
    this.saveSettings();
    this.selectedLayerSetting = layer;
  }

  delete() {
    const tmp = new SImage();
    tmp.setLayers(this.userSettings.defaultLayerSettings);
    CImageUtil.removeLayer(tmp, this.selectedLayerSetting.id);
    this.userSettings.defaultLayerSettings = tmp.getLayers();
    this.saveSettings();
  }

  close(): void {
    this.dialogRef.close();
  }
}
