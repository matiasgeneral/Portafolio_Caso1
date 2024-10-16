import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsignacionSolicitudesEspaciosPublicosComponent } from './asignacion-solicitudes-espacios-publicos/asignacion-solicitudes-espacios-publicos.component';
import { EnvioSolicitudesProyectosComponent } from './envio-solicitudes-proyectos/envio-solicitudes-proyectos.component';
import { GestionNuevosUsuariosComponent } from './gestion-nuevos-usuarios/gestion-nuevos-usuarios.component';
import { ListaRegistrosUsuariosComponent } from './lista-registros-usuarios/lista-registros-usuarios.component';
import { ListaSolicitudesEspaciosPublicosComponent } from './lista-solicitudes-espacios-publicos/lista-solicitudes-espacios-publicos.component';
import { ListaSolicitudesProyectosComponent } from './lista-solicitudes-proyectos/lista-solicitudes-proyectos.component';
import { VerificacionSolicitudesProyectosComponent } from './verificacion-solicitudes-proyectos/verificacion-solicitudes-proyectos.component';

const routes: Routes = [
  {
    path:'asignacion-solicitudes-espacios-publicos',
    component: AsignacionSolicitudesEspaciosPublicosComponent,
  },
  {
    path: 'envio-solicitudes-proyectos',
    component:EnvioSolicitudesProyectosComponent,
  },
  {
    path: 'gestion-nuevos-usuarios/:rut',
    component:GestionNuevosUsuariosComponent,
  },
  {
    path: 'lista-registros-usuarios',
    component:ListaRegistrosUsuariosComponent,
  },
  {
    path: 'lista-solicitudes-espacios-publicos',
    component:ListaSolicitudesEspaciosPublicosComponent,
  },
  {
    path: 'lista-solicitudes-proyectos',
    component:ListaSolicitudesProyectosComponent,
  },
  {
    path: 'verificacion-solicitudes-proyectos',
    component:VerificacionSolicitudesProyectosComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecretarioRoutingModule { }
