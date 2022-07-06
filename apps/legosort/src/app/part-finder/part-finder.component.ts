import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PartFilter } from '../model/partfilter';
import { MatSelectChange } from '@angular/material/select';

import { Part } from '../model/part';
import { DataService } from '../services/data.service';
import { PartInBox } from '../model/part-in-box';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'legosort-part-finder',
  templateUrl: './part-finder.component.html',
  styleUrls: ['./part-finder.component.scss'],
})
export class PartFinderComponent implements OnInit, OnDestroy {
  dim: string[] = [
    'All',
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
    'All',
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
    'All',
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

  defaultValue = 'All';

  filterDictionary = new Map<string, string>();

  public dataSourceFilters!: MatTableDataSource<Part>;
  public displayedColumns: string[] = [
    'image',
    'category',
    'dimensions',
    'name',
    'box',
  ];

  constructor(private dataService: DataService) {}
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.dataService
      .getAllPartInBox()
      .pipe(takeUntil(this.destroy$))
      .subscribe((AllPartInBox: PartInBox[]) => {
        console.log(AllPartInBox);
        this.dataSourceFilters = new MatTableDataSource(
          this.getAllPartsWithBoxNumber(AllPartInBox)
        );
        this.dataSourceFilters.filterPredicate = this.createFilter();
      });

    this.partFilters.push({
      name: 'category',
      options: this.categories,
      defaultValue: this.defaultValue,
    });
    this.partFilters.push({
      name: 'dim1',
      options: this.dim,
      defaultValue: this.defaultValue,
    });
    this.partFilters.push({
      name: 'dim2',
      options: this.dim,
      defaultValue: this.defaultValue,
    });
    this.partFilters.push({
      name: 'height',
      options: this.heights,
      defaultValue: this.defaultValue,
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
      const onlyInBoxFilterValue =
        mappedFilters.get('box') || (undefined as string | unknown);

      const nameValue = part['name'].toString().toLowerCase();
      const categoryValue = part['category'].toString().toLowerCase();

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

      if (isMatch && onlyInBoxFilterValue != undefined) {
        if (onlyInBoxFilterValue === 'true') {
          const cellBoxValue = part['box'] || '';
          // Eventually filter for box
          isMatch = cellBoxValue !== '';
        }
      }

      return isMatch;
    };
  }

  getAllPartsWithBoxNumber(allPartInBox: PartInBox[]): Part[] {
    const availableParts = this.dataService.getAllParts();
    return availableParts.map((availablePart) => {
      return {
        ...availablePart,
        box: allPartInBox.find(
          (partInBox) => availablePart.partnumber === partInBox.partnumber
        )?.box,
      };
    });
  }

  handleFilterDropdown(ob: MatSelectChange, partFilter: PartFilter): void {
    this.applyPartFilter(partFilter.name, ob.value);
  }

  handleFilterInput(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.applyPartFilter('name', filterValue.trim().toLowerCase());
  }

  handleFilterCheckbox(event: MatCheckboxChange): void {
    this.applyPartFilter('box', `${event.checked}`);
  }

  applyPartFilter(name: string, value: string) {
    this.filterDictionary.set(name, value);

    const jsonString = JSON.stringify(
      Array.from(this.filterDictionary.entries())
    );

    this.dataSourceFilters.filter = jsonString;
    //console.log(this.filterValues);
  }

  onClear(
    event: MouseEvent,
    partFilter: { name: string; defaultValue: string }
  ) {
    partFilter.defaultValue = this.defaultValue;
    this.applyPartFilter(partFilter.name, this.defaultValue);
    event.stopPropagation();
  }
}
