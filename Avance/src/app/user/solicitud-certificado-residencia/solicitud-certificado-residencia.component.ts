import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PdfService } from 'src/app/service/pdf.service';
import { PagoCertificadoService } from '../../pagos/services/pago-certificado.service';
import { AlertController } from '@ionic/angular';

interface PdfGenerationStatus {
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-solicitud-certificado-residencia',
  templateUrl: './solicitud-certificado-residencia.component.html',
  styleUrls: ['./solicitud-certificado-residencia.component.scss'],
})
export class SolicitudCertificadoResidenciaComponent implements OnInit {
  userData: any = {};
  pdfGenerationStatus: PdfGenerationStatus | null = null;
  isProcessing: boolean = false;

  constructor(
    private pdfService: PdfService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private pagoCertificadoService: PagoCertificadoService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.loadUserData(user.uid);
      }
    });
  }

  private loadUserData(userId: string) {
    this.firestore
      .collection('usuarios')
      .doc(userId)
      .valueChanges()
      .subscribe((data) => {
        this.userData = data;
      });
  }

  async generatePDF() {
    if (this.userData) {
      try {
        const pdfBase64 = await this.pdfService.generateCertificate(this.userData);
        
        // Iniciar proceso de pago
        const urlPago = await this.pagoCertificadoService.procesarPagoYRegistro(
          this.userData,
          pdfBase64
        );
        window.open(urlPago, '_blank');
        
        this.pdfGenerationStatus = { 
          success: true, 
          message: 'PDF generado y pago iniciado correctamente' 
        };
      } catch (error) {
        this.pdfGenerationStatus = { 
          success: false, 
          message: 'Error en el proceso: ' + (error as Error).message 
        };
      }
    } else {
      this.pdfGenerationStatus = { 
        success: false, 
        message: 'No se encontraron datos del usuario.' 
      };
    }
  }
}