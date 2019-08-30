import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-filter-list',
  templateUrl: './filter-list.component.html',
  styleUrls: ['./filter-list.component.scss']
})
export class FilterListComponent implements OnInit {

  public filter = [
    {
      category: "Split", filter: [
        {
          name: "Split-Filter",
          description: "Ausplitten des Filterbaumes",
          command: "const split = new SplitFilter(img);"
        }
      ]
    },
    {
      category: "Merge", filter: [
        {
          name: "Img-Merge-Filter",
          description: "Ausplitten des Filterbaumes",
          command: "const merge = new IMGMergeFilter(imgs, colors);"
        }
      ]
    }
  ]

  constructor() {
  }

  ngOnInit() {
  }

}
