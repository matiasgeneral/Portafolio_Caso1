import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PagosRoutingModule } from './pagos-routing.module';
import { PagoCertificadoService } from './services/pago-certificado.service';
import { PagoExitosoComponent } from './components/pago-exitoso/pago-exitoso.component';
import { PagoFallidoComponent } from './components/pago-fallido/pago-fallido.component';
import { PagoPendienteComponent } from './components/pago-pendiente/pago-pendiente.component';
import { PagoVerificacionComponent } from './pago-verificacion/pago-verificacion.component';

@NgModule({
  declarations: [
    PagoExitosoComponent,
    PagoFallidoComponent,
    PagoPendienteComponent,
    PagoVerificacionComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    PagosRoutingModule
  ],
  providers: [
    PagoCertificadoService
  ],
  exports: [
    PagoExitosoComponent,
    PagoFallidoComponent,
    PagoPendienteComponent,
    PagoVerificacionComponent
  ]
})
export class PagosModule { }
