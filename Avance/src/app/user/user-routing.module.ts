import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SolicitudCertificadoResidenciaComponent } from './solicitud-certificado-residencia/solicitud-certificado-residencia.component';

import { VisualizacionEspaciosPublicosComponent } from './visualizacion-espacios-publicos/visualizacion-espacios-publicos.component'; 
import { PostulacionEspaciosPublicosComponent } from './postulacion-espacios-publicos/postulacion-espacios-publicos.component';

import { VisualizacionEventosComponent } from './visualizacion-eventos/visualizacion-eventos.component';
import { PostulacionEventosComponent } from './postulacion-eventos/postulacion-eventos.component';

import { VisualizacionProyectosComponent } from './visualizacion-proyectos/visualizacion-proyectos.component';
import { PostulacionProyectosComponent } from './postulacion-proyectos/postulacion-proyectos.component';
import { VisualizacionNoticiasComponent } from './visualizacion-noticias/visualizacion-noticias.component';
import { NoticiaComponent } from './noticia/noticia.component';

const routes: Routes = [
  {
    path:'solicitud-certificado-residencia',
    component: SolicitudCertificadoResidenciaComponent,
  },
  {
    path: 'visualizacion-espacios-publicos',
    component: VisualizacionEspaciosPublicosComponent,
  },
  {
    path: 'postulacion-espacios-publicos/:id',
    component: PostulacionEspaciosPublicosComponent,
  },
  {
    path: 'visualizacion-eventos',
    component:VisualizacionEventosComponent,
  },
  {
    path: 'postulacion-eventos',
    component:PostulacionEventosComponent,
  },
  {
    path: 'visualizacion-proyectos',
    component:VisualizacionProyectosComponent,
  },
  {
    path: 'postulacion-proyectos',
    component:PostulacionProyectosComponent,
  },
  {
    path: 'visualizacion-noticias',
    component:VisualizacionNoticiasComponent,
  },
  {
    path: 'noticia/:id',
    component:NoticiaComponent,
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
