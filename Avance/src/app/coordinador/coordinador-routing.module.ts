import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuscadorNoticiasComponent } from './buscador-noticias/buscador-noticias.component';
import { CrearNoticiasComponent } from './crear-noticias/crear-noticias.component';

const routes: Routes = [
  {
    path:'buscador-noticias',
    component: BuscadorNoticiasComponent
  },
  {
    path:'crear-noticia',
    component:CrearNoticiasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoordinadorRoutingModule { }
