import { CommonModule } from '@angular/common';
import { PartFinderComponent } from './part-finder.component';
import { PartFinderRoutingModule } from './part-finder-routing.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgModule } from '@angular/core';
import { PartDetailComponent } from '../part-detail/part-detail.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialComponentsModule } from '../material-components/material-components.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [PartFinderComponent, PartDetailComponent],
  imports: [
    CommonModule,
    PartFinderRoutingModule,
    MatToolbarModule,
    RouterModule,
    MaterialComponentsModule,
    // BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class PartFinderModule {}
