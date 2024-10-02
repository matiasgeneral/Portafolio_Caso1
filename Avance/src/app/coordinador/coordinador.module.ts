import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoordinadorRoutingModule } from './coordinador-routing.module';
import { CrearNoticiasComponent } from './crear-noticias/crear-noticias.component';
import { CrearActividadesComponent } from './crear-actividades/crear-actividades.component';

import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@NgModule({
  declarations: [
    CrearNoticiasComponent,
    CrearActividadesComponent,
  ],
  
  imports: [
    CommonModule,
    CoordinadorRoutingModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class CoordinadorModule { }
