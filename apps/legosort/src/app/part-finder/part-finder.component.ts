import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BoxWithParts, PartFilter } from '../interfaces/legosort.interface';
import { MatSelectChange } from '@angular/material/select';

import { Part, PartInBox } from '../interfaces/legosort.interface';
import { DataService } from '../services/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { PartDetailComponent } from '../part-detail/part-detail.component';
import { createFilter } from './part-finder.helpers';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'legosort-part-finder',
  templateUrl: './part-finder.component.html',
  styleUrls: ['./part-finder.component.scss'],
})
export class PartFinderComponent implements OnInit, OnDestroy {
  defaultValue = 'All';
  filterDictionary = new Map<string, string>();

  dim: string[] = [
    this.defaultValue,
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '10+',
  ];
  heights: string[] = [
    this.defaultValue,
    '0',
    '0-1',
    '1',
    '1-2',
    '2',
    '3',
    '3-6',
    '6+',
  ];
  categories: string[] = [
    this.defaultValue,
    'Antenna',
    'Arch',
    'Ball',
    'Bar',
    'Baseplate',
    'Bracket',
    'Brick',
    'Chain',
    'Cockpit',
    'Cone',
    'Container',
    'Cylinder',
    'Dish',
    'Door',
    'Fence',
    'Flag',
    'Hinge',
    'Hook',
    'Hose',
    'Ladder',
    'Magnet',
    'Panel',
    'Plant',
    'Plate',
    'Propeller',
    'Ring',
    'Rock',
    'Roof',
    'Slope',
    'Stairs',
    'Support',
    'Tail',
    'Tap',
    'Technic',
    'Tile',
    'Train',
    'Vehicle',
    'Wedge',
    'Wheel',
    'Window',
    'Windscreen',
    'Wing',
  ];
  partFilters: PartFilter[] = [];

  public dataSourceFilters!: MatTableDataSource<Part>;
  public displayedColumns: string[] = [
    'image',
    'category',
    'dimensions',
    'name',
    'box',
  ];

  public boxView = false; // Will be set in html template by slider
  public seeSpecificBox: string;
  public boxWithParts: BoxWithParts[] = [];

  private userName;

  constructor(
    private routeParams: ActivatedRoute,
    private dataService: DataService,
    private dialog: MatDialog,
    private router: Router,
  ) {
    this.seeSpecificBox = routeParams.snapshot.params['box'];
    this.userName = router.getCurrentNavigation()?.extras?.state?.['userName'];
  }
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.dataService
    .getAllPartInBox(this.userName)
    .pipe(takeUntil(this.destroy$))
    .subscribe((allPartInBox: PartInBox[]) => {
      this.fillTable(allPartInBox);
      this.addOrUpdateFilters(allPartInBox);
      // Fire the filters initially, so initially no parts will be displayed
      this.applyPartFilter('box', this.defaultValue);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fillTable(allPartInBox: PartInBox[]): void {
    const AllPartsWithBoxNumber = this.getAllPartsWithBoxNumber(allPartInBox);
    this.dataSourceFilters = new MatTableDataSource(AllPartsWithBoxNumber);
    // Magic happens. The helper contains a big function that decides if a part is a match or not.
    this.dataSourceFilters.filterPredicate = createFilter;

    this.boxWithParts = this.getBoxesWithParts(AllPartsWithBoxNumber);
    if (this.seeSpecificBox) {
      this.boxView = true;
      this.boxWithParts = this.boxWithParts.filter(
        (box) => box.box === this.seeSpecificBox
      );
    }
  }

  private addOrUpdateFilters(allPartInBox: PartInBox[]): void {
    if (!this.partfiltersHasFilter(this.partFilters, 'category')) {
      this.partFilters.push({
        name: 'category',
        options: this.categories,
        defaultValue: this.defaultValue,
      });
    }
    if (!this.partfiltersHasFilter(this.partFilters, 'dim1')) {
      this.partFilters.push({
        name: 'dim1',
        options: this.dim,
        defaultValue: this.defaultValue,
      });
    }
    if (!this.partfiltersHasFilter(this.partFilters, 'dim2')) {
      this.partFilters.push({
        name: 'dim2',
        options: this.dim,
        defaultValue: this.defaultValue,
      });
    }
    if (!this.partfiltersHasFilter(this.partFilters, 'height')) {
      this.partFilters.push({
        name: 'height',
        options: this.heights,
        defaultValue: this.defaultValue,
      });
    }

    if (!this.partfiltersHasFilter(this.partFilters, 'box')) {
      this.partFilters.push({
        name: 'box',
        options: this.getListOfBoxes(allPartInBox),
        defaultValue: this.defaultValue,
      });
    } else {
      // Something special with box: The values depend on the incoming data,
      // so filter needs to be updated. But the chosen defaultvalue needs to be retained
      const boxFilter = this.partFilters.find(
        (part) => part.name === 'box'
      ) as PartFilter;
      boxFilter['options'] = this.getListOfBoxes(allPartInBox);
    }
  }

  private partfiltersHasFilter(
    partFilters: PartFilter[],
    name: string
  ): boolean {
    return partFilters.some((part) => part.name === name);
  }

  getAllPartsWithBoxNumber(allPartInBox: PartInBox[]): Part[] {
    const availableParts = this.dataService.getAllParts();
    const allPartsWithBoxNumber = availableParts.map((availablePart) => {
      const partInBox = allPartInBox.find(
        (partInBox) => availablePart.partnumber === partInBox.partnumber
      );
      return {
        ...availablePart,
        boxId: partInBox?.id,
        box: partInBox?.box,
      };
    });
    return allPartsWithBoxNumber.sort(this.partSort);
  }

  private partSort(partA: Part, partB: Part): number {
    if (partA.box === partB.box) {
      // partnumber is only important when boxes are equal
      return partA.partnumber > partB.partnumber ? 1 : -1;
    }
    // undefined goes last in the sort
    const boxA = partA.box || 'zzz';
    const boxB = partB.box || 'zzz';
    return boxA.localeCompare(boxB, 'en', { numeric: true });
  }

  getBoxesWithParts(allPartsWithBoxNumber: Part[]): BoxWithParts[] {
    // We need to normalize: An array of boxes,
    //  and then an array of items in that box
    const allBoxesWithParts: BoxWithParts[] = [];
    allPartsWithBoxNumber.sort(this.partSort).forEach((part) => {
      // Only the parts assigned to actual boxes
      if (part.box) {
        let specificBox = allBoxesWithParts.find(
          (boxWithPart) => boxWithPart.box === part.box
        );

        if (!specificBox) {
          specificBox = { box: part.box, parts: [] } as BoxWithParts;
          allBoxesWithParts.push(specificBox);
        }
        specificBox.parts.push(part);
      }
    });

    return allBoxesWithParts;
  }

  getListOfBoxes(allPartInBox: PartInBox[]): string[] {
    return [
      this.defaultValue,
      'any box',
      'not in box',
      ...new Set(allPartInBox.map((data) => data.box).sort(this.boxSort)),
    ];
  }

  private boxSort(boxA: string, boxB: string): number {
    return boxA?.localeCompare(boxB, 'en', { numeric: true });
  }

  handleFilterDropdown(ob: MatSelectChange, partFilter: PartFilter): void {
    this.applyPartFilter(partFilter.name, ob.value);
  }

  handleFilterInput(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.applyPartFilter('name', filterValue.trim().toLowerCase());
  }

  applyPartFilter(name: string, value: string) {
    this.filterDictionary.set(name, value);

    const jsonString = JSON.stringify(
      Array.from(this.filterDictionary.entries())
    );

    this.dataSourceFilters.filter = jsonString;
  }

  onClear(
    event: MouseEvent,
    partFilter: { name: string; defaultValue: string }
  ) {
    partFilter.defaultValue = this.defaultValue;
    this.applyPartFilter(partFilter.name, this.defaultValue);
    event.stopPropagation();
  }

  openPartDetailDialog(part: Part): void {
    const dialogRef = this.dialog.open(PartDetailComponent, {
      width: '400px',
      data: part,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Part) => {
        // Somehow keep the filters
        // eslint-disable-next-line no-self-assign
        this.dataSourceFilters.filter = this.dataSourceFilters.filter;
        console.log('done', result);
      });
  }
}
