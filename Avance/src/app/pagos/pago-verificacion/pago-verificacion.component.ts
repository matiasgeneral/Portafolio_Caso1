import { Component, OnInit } from '@angular/core';
import { PagoCertificadoService } from '../services/pago-certificado.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

declare var MercadoPago: any;

@Component({
  selector: 'app-pago-verificacion',
  templateUrl: './pago-verificacion.component.html',
  styleUrls: ['./pago-verificacion.component.scss']
})
export class PagoVerificacionComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoCertificadoService: PagoCertificadoService
  ) {}

  async ngOnInit() {
    const user = {
      uid: 'user-uid',
      nombre: 'Nombre',
      apellidoPaterno: 'Apellido1',
      apellidoMaterno: 'Apellido2',
      rut: '12345678-9',
      direccion: 'Dirección del usuario'
    };

    try {
      // Iniciar el pago y obtener la preferencia
      const preference = await this.pagoCertificadoService.iniciarPago(user);
      
      // Inicializar el SDK de Mercado Pago
      const mp = new MercadoPago(environment.mercadoPagoPublicKey, {
        locale: 'es-CL'
      });

      // Crear el checkout con la preferencia
      const checkout = mp.checkout({
        preference: {
          id: preference.id
        },
        autoOpen: true, // Abre automáticamente el widget de pago
        render: {
          container: '#mp-container', // Elemento HTML donde se mostrará el formulario de pago
          label: 'Pagar' // Texto del botón
        }
      });

      // Luego de realizar el pago, verifica el estado del mismo y actualiza Firestore
      this.verificarPago(preference.id);
    } catch (error) {
      console.error('Error al procesar el pago:', error);
    }
  }

  async verificarPago(paymentId: string) {
    // Método para verificar el estado del pago y actualizar la información en Firestore
    try {
      await this.pagoCertificadoService.actualizarEstadoPago(paymentId, 'pagado');
      this.router.navigate(['/exito']);
    } catch (error) {
      console.error('Error al actualizar el pago:', error);
      this.router.navigate(['/solicitar-certificado']);
    }
  }
}
