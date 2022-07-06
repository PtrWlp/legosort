import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PartFilter } from '../model/partfilter';
import { MatSelectChange } from '@angular/material/select';

import { Part } from '../model/part';
import { DataService } from '../services/data.service';
import { PartInBox } from '../model/part-in-box';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { PartDetailComponent } from '../part-detail/part-detail.component';

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

  constructor(private dataService: DataService, private dialog: MatDialog) {}
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.dataService
      .getAllPartInBox()
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
    this.dataSourceFilters = new MatTableDataSource(
      this.getAllPartsWithBoxNumber(allPartInBox)
    );

    this.dataSourceFilters.filterPredicate = this.createFilter();
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

  private createFilter(): (part: Part, filters: string) => boolean {
    // We return a function for the MatTableDataSource to call for each item in the source
    return function (part: Part, filters: string): boolean {
      const mappedFilters = new Map(JSON.parse(filters));
      let isMatch = true;

      const nameFilterValue = mappedFilters.get('name') as string;
      const categoryFilterValue =
        mappedFilters.get('category') !== 'All'
          ? (mappedFilters.get('category') as string)
          : undefined;
      const dim1FilterValue =
        mappedFilters.get('dim1') !== 'All'
          ? (mappedFilters.get('dim1') as string)
          : undefined;
      const dim2FilterValue =
        mappedFilters.get('dim2') !== 'All'
          ? (mappedFilters.get('dim2') as string)
          : undefined;
      const heightFilterValue =
        mappedFilters.get('height') !== 'All'
          ? (mappedFilters.get('height') as string)
          : undefined;
      const boxFilterValue =
        mappedFilters.get('box') !== 'All'
          ? (mappedFilters.get('box') as string)
          : undefined;

      const nameValue = part['name'].toString().toLowerCase();
      const categoryValue = part['category'].toString().toLowerCase();

      // if no filter was specified by the user, show nothing
      if (
        !(
          nameFilterValue?.length > 2 ||
          categoryFilterValue ||
          dim1FilterValue ||
          dim2FilterValue ||
          heightFilterValue ||
          boxFilterValue
        )
      ) {
        isMatch = false;
      }

      // Apply filters until the part does no longer pass one of the filters
      if (isMatch && nameFilterValue && nameFilterValue.length > 2) {
        // Only filter on free text if more than 2 characters are filled.
        // Match on name or partnumber ( id )
        isMatch =
          nameValue.includes(nameFilterValue.toLowerCase()) ||
          categoryValue.includes(nameFilterValue.toLowerCase()) ||
          part['partnumber'] == nameFilterValue;
      }

      if (isMatch && categoryFilterValue) {
        isMatch = categoryValue.includes(categoryFilterValue.toLowerCase());
      }

      if (isMatch && dim1FilterValue) {
        if (dim1FilterValue === '10+') {
          isMatch = parseFloat(part['dim1']) > 10;
          // dim1 and dim2 should be interchangeable
          if (!isMatch) {
            isMatch = parseFloat(part['dim2']) > 10;
          }
        } else {
          isMatch = part['dim1'].toString() === dim1FilterValue;
          if (!isMatch) {
            isMatch = part['dim2'].toString() === dim1FilterValue;
          }
        }
      }

      if (isMatch && dim2FilterValue) {
        if (dim2FilterValue === '10+') {
          isMatch = parseFloat(part['dim2']) > 10;
          if (!isMatch) {
            isMatch = parseFloat(part['dim1']) > 10;
          }
        } else {
          isMatch = part['dim2'].toString().toLowerCase() === dim2FilterValue;
          if (!isMatch) {
            isMatch = part['dim1'].toString() === dim2FilterValue;
          }
        }
      }

      if (isMatch && heightFilterValue) {
        const cellValueNum: number =
          part['height'] === '' ? 0 : parseFloat(part['height']);
        // Filter on upper and lower
        if (['1', '2', '3'].includes(heightFilterValue)) {
          isMatch = cellValueNum === parseFloat(heightFilterValue);
        } else if (heightFilterValue === '0-1') {
          isMatch = cellValueNum > 0 && cellValueNum < 1;
        } else if (heightFilterValue === '1-2') {
          isMatch = cellValueNum > 1 && cellValueNum < 2;
        } else if (heightFilterValue === '2-3') {
          isMatch = cellValueNum > 2 && cellValueNum < 3;
        } else if (heightFilterValue === '3-6') {
          isMatch = cellValueNum > 3 && cellValueNum < 6;
        } else if (heightFilterValue === '6+') {
          isMatch = cellValueNum > 6;
        }
      }

      if (isMatch && boxFilterValue) {
        const cellBoxValue = part['box'] || '';
        if (boxFilterValue === 'any box') {
          isMatch = cellBoxValue !== '';
        } else if (boxFilterValue === 'not in box') {
          isMatch = cellBoxValue === '';
        } else {
          // Eventually filter for box value
          isMatch = cellBoxValue === boxFilterValue;
        }
      }

      return isMatch;
    };
  }

  getAllPartsWithBoxNumber(allPartInBox: PartInBox[]): Part[] {
    const availableParts = this.dataService.getAllParts();
    const allPartsWithBoxNumber =  availableParts.map((availablePart) => {
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
