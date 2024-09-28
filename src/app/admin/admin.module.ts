import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { IonicModule } from '@ionic/angular';
import { AdministrarActividadesComponent } from './administrar-actividades/administrar-actividades.component';
import { AdministrarEspaciosPublicosComponent } from './administrar-espacios-publicos/administrar-espacios-publicos.component';
import { AdministrarProyectosComponent } from './administrar-proyectos/administrar-proyectos.component';
import { AdministrarUsuariosComponent } from './administrar-usuarios/administrar-usuarios.component';
import { BuscadorActividadesComponent } from './buscador-actividades/buscador-actividades.component';
import { BuscadorEspaciosPublicosComponent } from './buscador-espacios-publicos/buscador-espacios-publicos.component';
import { BuscadorProyectosComponent } from './buscador-proyectos/buscador-proyectos.component';
import { BuscadorUsuariosComponent } from './buscador-usuarios/buscador-usuarios.component';


@NgModule({
  declarations: [
    AdministrarActividadesComponent,
    AdministrarEspaciosPublicosComponent,
    AdministrarProyectosComponent,
    AdministrarUsuariosComponent,

    BuscadorActividadesComponent,
    BuscadorEspaciosPublicosComponent,
    BuscadorProyectosComponent,
    BuscadorUsuariosComponent
  ],

  imports: [
    CommonModule,
    AdminRoutingModule,
    IonicModule 
  ]
})
export class AdminModule { }
