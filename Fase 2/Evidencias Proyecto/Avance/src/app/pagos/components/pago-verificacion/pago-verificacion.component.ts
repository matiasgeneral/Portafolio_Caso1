import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoCertificadoService } from '../../services/pago-certificado.service';

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
    // Captura los parámetros de la URL redirigida por Mercado Pago
    this.route.queryParams.subscribe(async (params) => {
      const collectionStatus = params['collection_status']; // Estado del pago
      const preferenceId = params['preference_id']; // ID de la preferencia
      const paymentId = params['payment_id']; // ID del pago

      // Valida que los parámetros esenciales estén presentes
      if (!collectionStatus || !preferenceId || !paymentId) {
        console.error('Faltan parámetros necesarios en la redirección.');
        this.router.navigate(['/pagos/fallido']); // Redirige a "fallido" si faltan datos
        return;
      }

      try {
        console.log(`Estado del pago recibido: ${collectionStatus}`);
        console.log(`ID de la preferencia: ${preferenceId}`);
        console.log(`ID del pago: ${paymentId}`);

        // Maneja los diferentes estados del pago
        if (collectionStatus === 'approved') {
          // Actualiza el estado en Firestore a "pagado"
          await this.pagoCertificadoService.actualizarEstadoPago(preferenceId, 'pagado');
          console.log('Estado del pago actualizado a "pagado".');
          this.router.navigate(['/pagos/exitoso']); // Redirige a "exitoso"
        } else if (collectionStatus === 'pending') {
          console.warn('El pago está pendiente.');
          this.router.navigate(['/pagos/pendiente']); // Redirige a "pendiente"
        } else {
          console.error('El pago falló o fue rechazado.');
          this.router.navigate(['/pagos/fallido']); // Redirige a "fallido"
        }
      } catch (error) {
        console.error('Error al procesar el estado del pago:', error);
        this.router.navigate(['/pagos/fallido']); // Redirige a "fallido" en caso de error
      }
    });
  }
}
