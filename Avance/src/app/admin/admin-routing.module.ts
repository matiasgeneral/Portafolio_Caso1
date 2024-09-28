import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdministrarActividadesComponent } from './administrar-actividades/administrar-actividades.component';
import { AdministrarEspaciosPublicosComponent } from './administrar-espacios-publicos/administrar-espacios-publicos.component';
import { AdministrarProyectosComponent } from './administrar-proyectos/administrar-proyectos.component';
import { AdministrarUsuariosComponent } from './administrar-usuarios/administrar-usuarios.component';
import { BuscadorActividadesComponent } from './buscador-actividades/buscador-actividades.component';
import { BuscadorEspaciosPublicosComponent } from './buscador-espacios-publicos/buscador-espacios-publicos.component';
import { BuscadorProyectosComponent } from './buscador-proyectos/buscador-proyectos.component';
import { BuscadorUsuariosComponent } from './buscador-usuarios/buscador-usuarios.component';

const routes: Routes = [
  {
    path:'administrar-actividades',
    component: AdministrarActividadesComponent,
  },
  {
    path:'administrar-espacios-publicos',
    component: AdministrarEspaciosPublicosComponent,
  },
  {
    path:'administrar-proyectos',
    component:AdministrarProyectosComponent,
  },
  {
  path: 'administrar-usuarios',
  component: AdministrarUsuariosComponent,
  },
  {
    path: 'buscador-actividades',
    component: BuscadorActividadesComponent,
  },
  {
    path: 'buscador-espacios-publicos',
    component: BuscadorEspaciosPublicosComponent
  },
  {
    path:'buscador-proyectos',
    component: BuscadorProyectosComponent
  },
  {
    path: 'buscador-usuarios',
    component: BuscadorUsuariosComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
