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
      const { paymentId } = this.route.snapshot.queryParams;
      if (paymentId) {
        // Actualiza el estado del pago a "pagado"
        await this.payCertificateService.actualizarEstadoPago(paymentId, 'pagado');
        this.showAlert('Éxito', 'El pago se ha completado exitosamente.');
      } else {
        throw new Error('No se encontró el identificador del pago.');
      }
    } catch (error) {
      console.error('Error al procesar el pago exitoso:', error);
      this.router.navigate(['/solicitar-certificado']);
    }
  }

  volver() {
    this.router.navigate(['/']);
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
