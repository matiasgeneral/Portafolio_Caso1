import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoCertificadoService } from '../services/pago-certificado.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-pago-verificacion',
  templateUrl: './pago-verificacion.component.html',
  styleUrls: ['./pago-verificacion.component.scss']
})
export class PagoVerificacionComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoCertificadoService: PagoCertificadoService,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    try {
      // Obtener el parámetro `preference-id` de la URL
      const preferenceId = this.route.snapshot.queryParams['preference-id'];
      
      if (preferenceId) {
        // Verificar el estado del pago usando el ID de la preferencia
        await this.pagoCertificadoService.manejarNotificacionPago(preferenceId);
        
        // Mostrar alerta y redirigir al usuario
        this.showAlert('Éxito', 'El pago se ha completado exitosamente.');
        this.router.navigate(['/solicitar-certificado']);
      } else {
        throw new Error('No se encontró el identificador de la preferencia de pago.');
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      this.router.navigate(['/solicitar-certificado']);
    }
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
