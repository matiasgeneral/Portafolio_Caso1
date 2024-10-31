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
import { BuscadorNoticiasComponent } from './buscador-noticias/buscador-noticias.component';
import { AdministrarNoticiasComponent } from './administrar-noticias/administrar-noticias.component';
import { EditarUsuariosComponent } from './editar-usuarios/editar-usuarios.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importa ReactiveFormsModule
import { EditarActividadesComponent } from './editar-actividades/editar-actividades.component';
import { EditarEspaciosPublicosComponent } from './editar-espacios-publicos/editar-espacios-publicos.component';
import { EditarNoticiasComponent } from './editar-noticias/editar-noticias.component';
import { EditarProyectosComponent } from './editar-proyectos/editar-proyectos.component';
import { PostulacionesComponent } from './postulaciones/postulaciones.component';
// Importa tus componentes aquí


@NgModule({
  declarations: [

    AdministrarActividadesComponent,
    AdministrarEspaciosPublicosComponent,
    AdministrarProyectosComponent,
    AdministrarUsuariosComponent,
    AdministrarNoticiasComponent,

    BuscadorActividadesComponent,
    BuscadorEspaciosPublicosComponent,
    BuscadorProyectosComponent,
    BuscadorUsuariosComponent,
    BuscadorNoticiasComponent,

    EditarActividadesComponent,
    EditarEspaciosPublicosComponent,
    EditarNoticiasComponent,
    EditarProyectosComponent,
    EditarUsuariosComponent,
    PostulacionesComponent,



  ],

  imports: [
    CommonModule,
    AdminRoutingModule,
    IonicModule,
    FormsModule, // Formularios Template-Driven
    ReactiveFormsModule // Formularios Reactivos (necesario para formGroup)

  ],  
  exports:[
    PostulacionesComponent
  ]


})
export class AdminModule { }
