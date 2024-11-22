import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecretarioRoutingModule } from './secretario-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AsignacionSolicitudesEspaciosPublicosComponent } from './asignacion-solicitudes-espacios-publicos/asignacion-solicitudes-espacios-publicos.component';
import { EnvioSolicitudesProyectosComponent } from './envio-solicitudes-proyectos/envio-solicitudes-proyectos.component';
import { GestionNuevosUsuariosComponent } from './gestion-nuevos-usuarios/gestion-nuevos-usuarios.component';
import { ListaRegistrosUsuariosComponent } from './lista-registros-usuarios/lista-registros-usuarios.component';
import { ListaSolicitudesEspaciosPublicosComponent } from './lista-solicitudes-espacios-publicos/lista-solicitudes-espacios-publicos.component';
import { ListaSolicitudesProyectosComponent } from './lista-solicitudes-proyectos/lista-solicitudes-proyectos.component';
import { VerificacionSolicitudesProyectosComponent } from './verificacion-solicitudes-proyectos/verificacion-solicitudes-proyectos.component';
import { ReactiveFormsModule } from '@angular/forms';
import { VerParticipantesComponent } from './ver-participantes/ver-participantes.component';


@NgModule({
  declarations: [
    AsignacionSolicitudesEspaciosPublicosComponent,
    EnvioSolicitudesProyectosComponent,
    GestionNuevosUsuariosComponent,

    ListaRegistrosUsuariosComponent,
    ListaSolicitudesEspaciosPublicosComponent,
    ListaSolicitudesProyectosComponent,
    
    VerificacionSolicitudesProyectosComponent,
    VerParticipantesComponent,
    
  ],
  imports: [
    CommonModule,
    SecretarioRoutingModule,
    IonicModule ,
    FormsModule, // Formularios Template-Driven
    ReactiveFormsModule // Formularios Reactivos (necesario para formGroup)

  ]
})
export class SecretarioModule { }
