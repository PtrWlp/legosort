import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Part, PartInBox } from '../interfaces/legosort.interface';
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

  private userName: string;

  constructor(
    public dialogRef: MatDialogRef<PartDetailComponent>,
    private dataService: DataService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public part: Part
  ) {
    this.userName = router.getCurrentNavigation()?.extras?.state?.['userName'];
  }

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
          this.dataService.updatePartInBox(partInBox, this.userName);
        } else {
          // Must be delete then
          this.dataService.deletePartInBox(partInBox, this.userName);
        }
      } else {
        this.dataService.addPartInBox(partInBox, this.userName);
      }
    }
    this.dialogRef.close();
  }
}
