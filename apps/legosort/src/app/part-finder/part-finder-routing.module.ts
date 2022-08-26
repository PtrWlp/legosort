import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartFinderComponent } from './part-finder.component';

const routes: Routes = [{ path: '', component: PartFinderComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartFinderRoutingModule { }
