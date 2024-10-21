import { Component, OnInit } from '@angular/core';
import { PdfService } from 'src/app/service/pdf.service'; // Servicio para generar el PDF
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

// Definimos un tipo para el estado de generación del PDF
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
  userData: any = {}; // Almacena los datos del usuario
  pdfGenerationStatus: PdfGenerationStatus | null = null; // Estado de la generación del PDF

  constructor(
    private pdfService: PdfService,              // Servicio para generar el PDF
    private afAuth: AngularFireAuth,             // Servicio de autenticación de Firebase
    private firestore: AngularFirestore          // Servicio de Firestore para obtener datos del usuario
  ) {}

  ngOnInit() {
    // Obtenemos el estado de autenticación del usuario
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.loadUserData(user.uid);
      }
    });
  }

  // Método para cargar los datos del usuario desde Firestore
  private loadUserData(userId: string) {
    this.firestore
      .collection('usuarios')
      .doc(userId)
      .valueChanges()
      .subscribe((data) => {
        this.userData = data;
      });
  }

  // Método para generar el PDF con los datos del usuario
  async generatePDF() {
    if (this.userData) {
      try {
        await this.pdfService.generateCertificate(this.userData);
        this.pdfGenerationStatus = { success: true, message: 'PDF generado correctamente' };
        console.log('PDF generado correctamente');
      } catch (error) {
        this.pdfGenerationStatus = { success: false, message: 'Error al generar el PDF: ' + (error as Error).message };
        console.error('Error al generar el PDF:', error);
      }
    } else {
      this.pdfGenerationStatus = { success: false, message: 'No se encontraron datos del usuario.' };
    }
  }
}
