import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { BoxContentComponent } from './box-content/box-content.component';
import { PartFinderComponent } from './part-finder/part-finder.component';

const routes: Routes = [
  { path: 'legosort/:box', component: PartFinderComponent },
  { path: 'legosort', component: PartFinderComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
