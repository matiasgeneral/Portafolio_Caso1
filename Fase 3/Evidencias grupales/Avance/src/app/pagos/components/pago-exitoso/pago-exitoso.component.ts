import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoCertificadoService } from '../../services/pago-certificado.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-pago-exitoso',
  templateUrl: './pago-exitoso.component.html',
  styleUrls: ['./pago-exitoso.component.scss']
})
export class PagoExitosoComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private payCertificateService: PagoCertificadoService,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    try {
      // Mostrar todos los parámetros de la URL para depuración
      const queryParams = this.route.snapshot.queryParams;
      console.log('Parámetros de la URL:', queryParams);

      const paymentId = queryParams['payment_id'];
      const collectionStatus = queryParams['collection_status'];

      // Verificar que los parámetros estén presentes
      if (!paymentId || !collectionStatus) {
        console.error('Faltan parámetros en la URL:', queryParams);
        await this.showAlert(
          'Error',
          'Faltan parámetros en la URL. Por favor, verifica el enlace proporcionado por MercadoPago.'
        );
        this.router.navigate(['/pagos/fallido']);
        return;
      }

      console.log('Parámetros recibidos:', { paymentId, collectionStatus });

      // Obtener los datos del pago usando el método correcto
      const pagoData = await this.payCertificateService.obtenerCertificadoPorPreferenceId(paymentId);

      // Comprobar si se encontraron los datos
      if (!pagoData) {
        console.error('No se encontró el pago con el ID proporcionado');
        await this.showAlert('Error', 'No se encontró el pago. Intenta nuevamente.');
        this.router.navigate(['/pagos/fallido']);
        return;
      }

      // Procesar el estado del pago según el parámetro collectionStatus
      if (collectionStatus === 'approved') {
        console.log('El estado del pago es aprobado.');

        // Actualizar el estado del pago en Firestore
        await this.payCertificateService.actualizarEstadoPago(paymentId, 'pagado');
        console.log('Estado del pago actualizado a "pagado".');

        // Mostrar un mensaje de éxito y redirigir
        await this.showAlert('Éxito', 'El pago se ha completado exitosamente.');
        this.router.navigate(['/']); // Redirigir a la página principal
      } else {
        console.warn(`Estado del pago no aprobado: ${collectionStatus}`);
        await this.showAlert(
          'Pago no aprobado',
          'Tu pago no fue aprobado. Por favor, intenta nuevamente.'
        );
        this.router.navigate(['/pagos/fallido']);
      }
    } catch (error) {
      console.error('Error al procesar el pago exitoso:', error);
      await this.showAlert(
        'Error',
        'Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.'
      );
      this.router.navigate(['/pagos/fallido']);
    }
  }

  /**
   * Mostrar una alerta al usuario
   * @param header Título de la alerta
   * @param message Mensaje de la alerta
   */
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  /**
   * Navegar de vuelta a la página de solicitud de certificado
   */
  volver() {
    this.router.navigate(['/solicitud-certificado-residencia']);
  }
}
