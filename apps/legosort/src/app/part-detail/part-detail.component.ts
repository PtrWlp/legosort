import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Part, PartInBox } from '../model/types';
import { DataService } from '../services/data.service';

@Component({
  selector: 'legosort-part-detail',
  templateUrl: './part-detail.component.html',
  styleUrls: ['./part-detail.component.scss'],
})
export class PartDetailComponent implements OnInit {
  boxForm = new FormGroup({
    box: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<PartDetailComponent>,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public part: Part
  ) {}

  ngOnInit() {
    this.boxForm.reset({ box: this.part.box });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    console.log(this.boxForm.value);
    if (this.boxForm.value.box !== this.part.box) {
      const partInBox: PartInBox = {
        partnumber: this.part.partnumber,
        box: this.boxForm.value.box as string
      }
      if (this.part.boxId) {
        partInBox.id = this.part.boxId;
        if (this.boxForm.value.box?.trim() !== '') {
          this.dataService.updatePartInBox(partInBox);
        } else {
          // Must be delete then
          this.dataService.deletePartInBox(partInBox);
        }
      } else {
        this.dataService.addPartInBox(partInBox);
      }
    }
    this.dialogRef.close();
  }
}
