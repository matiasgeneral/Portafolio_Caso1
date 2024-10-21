import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { VisualizacionEspaciosPublicosComponent } from './visualizacion-espacios-publicos/visualizacion-espacios-publicos.component';
import { IonicModule } from '@ionic/angular';
import { PostulacionEspaciosPublicosComponent } from './postulacion-espacios-publicos/postulacion-espacios-publicos.component';
import { SolicitudCertificadoResidenciaComponent } from './solicitud-certificado-residencia/solicitud-certificado-residencia.component';
import { VisualizacionEventosComponent } from './visualizacion-eventos/visualizacion-eventos.component';
import { PostulacionEventosComponent } from './postulacion-eventos/postulacion-eventos.component';
import { VisualizacionProyectosComponent } from './visualizacion-proyectos/visualizacion-proyectos.component';
import { PostulacionProyectosComponent } from './postulacion-proyectos/postulacion-proyectos.component';
import { VisualizacionNoticiasComponent } from './visualizacion-noticias/visualizacion-noticias.component';
import { NoticiaComponent } from './noticia/noticia.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SolicitudCertificadoResidenciaComponent,
    VisualizacionEspaciosPublicosComponent,
    PostulacionEspaciosPublicosComponent,
    VisualizacionEventosComponent,
    PostulacionEventosComponent,
    VisualizacionProyectosComponent,
    PostulacionProyectosComponent,
    VisualizacionNoticiasComponent,
    NoticiaComponent,
    
    

  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    IonicModule,
    ReactiveFormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
})
export class UserModule { }
