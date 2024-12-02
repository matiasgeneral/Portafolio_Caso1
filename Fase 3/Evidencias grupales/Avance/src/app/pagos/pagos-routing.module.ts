import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagoExitosoComponent } from './components/pago-exitoso/pago-exitoso.component';
import { PagoFallidoComponent } from './components/pago-fallido/pago-fallido.component';
import { PagoPendienteComponent } from './components/pago-pendiente/pago-pendiente.component';
import { PagoVerificacionComponent } from './components/pago-verificacion/pago-verificacion.component';

const routes: Routes = [
  {
    path: 'pagos',
    children: [
      { path: 'exitoso', component: PagoExitosoComponent },
      { path: 'fallido', component: PagoFallidoComponent },
      { path: 'pendiente', component: PagoPendienteComponent },
      { path: 'verificacion', component: PagoVerificacionComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagosRoutingModule { }
