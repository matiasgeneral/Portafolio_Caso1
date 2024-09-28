import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoordinadorRoutingModule } from './coordinador-routing.module';
import { BuscadorNoticiasComponent } from './buscador-noticias/buscador-noticias.component';
import { CrearNoticiasComponent } from './crear-noticias/crear-noticias.component';
import { IonicModule } from '@ionic/angular';


@NgModule({
  declarations: [
    BuscadorNoticiasComponent,
    CrearNoticiasComponent
  ],
  imports: [
    CommonModule,
    CoordinadorRoutingModule,
    IonicModule
  ]
})
export class CoordinadorModule { }
