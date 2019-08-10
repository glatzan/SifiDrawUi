import { Component, OnInit , EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.css']
})
export class ImageListComponent implements OnInit {

  @Input()  projectId: string;
  @Output() selectImage = new EventEmitter<String>();

  constructor() { }

  ngOnInit() {
  }

}
