import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';

const routes: Routes = [
  {path: 'legosort', redirectTo: 'legosort/', pathMatch: 'full'},
  {path: 'legosort/:box', component: AppComponent },
  {path: '', redirectTo: '/', pathMatch: 'full'},
  {path: ':box', component: AppComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
