import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PartFilter } from '../model/types';
import { MatSelectChange } from '@angular/material/select';

import { Part, PartInBox } from '../model/types';
import { DataService } from '../services/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { PartDetailComponent } from '../part-detail/part-detail.component';

@Component({
  selector: 'legosort-box-content',
  templateUrl: './box-content.component.html',
  styleUrls: ['./box-content.component.scss'],
})
export class BoxContentComponent implements OnInit, OnDestroy {
  defaultValue = 'All';
  filterDictionary = new Map<string, string>();

  partFilters: PartFilter[] = [];

  public dataSourceFilters!: MatTableDataSource<Part>;
  public displayedColumns: string[] = [
    'image',
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
      this.getAllPartInBoxes(allPartInBox)
    );

    // this.dataSourceFilters.filterPredicate = createFilter;
  }

  private addOrUpdateFilters(allPartInBox: PartInBox[]): void {
    if (!this.partfiltersHasFilter(this.partFilters, 'box')) {
      this.partFilters.push({
        name: 'box',
        options: this.getListOfBoxes(allPartInBox),
        defaultValue: this.defaultValue,
      });
    }
  }

  private partfiltersHasFilter(
    partFilters: PartFilter[],
    name: string
  ): boolean {
    return partFilters.some((part) => part.name === name);
  }

  getAllPartInBoxes(allPartInBox: PartInBox[]): Part[] {
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
