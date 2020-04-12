import {Component, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {Project} from '../../model/project';
import {ProjectService} from '../../service/project.service';
import {WorkViewService} from "../workView/work-view.service";
import {Dataset} from "../../model/dataset";
import {Overlay, OverlayRef} from "@angular/cdk/overlay";
import {TemplatePortal} from "@angular/cdk/portal";
import {fromEvent, Subscription} from "rxjs";
import {filter, take} from "rxjs/operators";
import {DatasetService} from "../../service/dataset.service";

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {

  projectData: Project[];

  selectedDataset: Dataset;

  @ViewChild('projectOverlayMenu', {static: false}) projectOverlayMenu: TemplateRef<any>;

  overlayRef: OverlayRef | null;

  sub: Subscription;

  constructor(private projectService: ProjectService,
              private overlay: Overlay,
              private clipboard: Clipboard,
              private datasetService: DatasetService,
              public viewContainerRef: ViewContainerRef,
              private workViewService: WorkViewService) {
    this.loadData();
  }

  ngOnInit() {
    this.workViewService.reloadProjectList.subscribe(x => {
      this.loadData();
      if (this.selectedDataset != null) {
        this.workViewService.selectDataset(this.selectedDataset)
      }
    });
  }

  private loadData() {
    this.projectData = [];
    this.projectService.getProjects().subscribe((data: Project[]) => {
      this.projectData = data;
    }, error1 => {
      console.log('Fehler beim laden der Project Datein');
    });
  }

  public onSelectDataset(event, dataset) {
    this.selectedDataset = dataset;
    this.workViewService.selectDataset(this.selectedDataset)
  }

  openContextMenu(event: MouseEvent, data: any) {
    this.closeOverlayMenu();
    event.preventDefault();
    const x = event.pageX;
    const y = event.pageY;

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo({x, y})
      .withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });

    let tmp = null;
    if (data instanceof Project) {
      tmp = {type: "p", data: data}
    } else {
      tmp = {type: "d", data: data}
    }

    this.overlayRef.attach(new TemplatePortal(this.projectOverlayMenu, this.viewContainerRef, {
      $implicit: tmp
    }));

    this.sub = fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter(event => {
          const clickTarget = event.target as HTMLElement;
          return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
        }),
        take(1)
      ).subscribe((x) => {
        this.closeOverlayMenu()
      })
  }

  closeOverlayMenu() {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  delete(data: { type: string, data: any }) {
    if (data.type == "p") {
      this.projectService.deleteProject(data.data).subscribe(x => this.loadData());
    } else {
      this.datasetService.deleteDataset(data.data).subscribe(x => this.loadData());
    }

    this.closeOverlayMenu();
  }


  copyToClip(data: { type: string, data: any }) {
    this.clipboard.writeText(data.data.id).then( x => x)
  }

}

