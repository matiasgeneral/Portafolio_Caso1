import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrearNoticiasComponent } from './crear-noticias/crear-noticias.component';

const routes: Routes = [

  {
    path:'crear-noticias',
    component:CrearNoticiasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoordinadorRoutingModule { }
