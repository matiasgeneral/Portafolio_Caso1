import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrearNoticiasComponent } from './crear-noticias/crear-noticias.component';
import { CrearActividadesComponent } from './crear-actividades/crear-actividades.component';
import { CrearEspaciosPublicosComponent } from './crear-espacios-publicos/crear-espacios-publicos.component';

const routes: Routes = [

  {
    path:'crear-noticias',
    component:CrearNoticiasComponent
  },
  {
    path:'crear-actividades',
    component:CrearActividadesComponent
  },
  {
    path:'crear-espacios-publicos',
    component:CrearEspaciosPublicosComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoordinadorRoutingModule { }
