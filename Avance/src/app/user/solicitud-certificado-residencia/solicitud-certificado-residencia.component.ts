import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PdfService } from 'src/app/service/pdf.service';
import { FcmService } from 'src/app/service/Fcm.Service';

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
   private fcmService: FcmService
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

 async initiatePayment() {
   if (!this.userData) {
     this.pdfGenerationStatus = { 
       success: false, 
       message: 'No se encontraron datos del usuario.' 
     };
     return;
   }

   try {
     this.isProcessing = true;
     const buyOrder = 'CERT' + Date.now();
     const sessionId = 'SESSION' + Date.now();
     
     const response = await this.fcmService.transbankPayment(
       1000,
       buyOrder,
       sessionId,
       window.location.origin + '/certificado-resultado'
     );

     // Redirige a la página de pago de Webpay
     window.location.href = response.url;
     
   } catch (error) {
     console.error('Error al procesar el pago:', error);
     this.pdfGenerationStatus = { 
       success: false, 
       message: 'Error al procesar el pago: ' + (error as Error).message 
     };
   } finally {
     this.isProcessing = false;
   }
 }

 async generatePDF() {
   if (this.userData) {
     try {
       await this.pdfService.generateCertificate(this.userData);
       this.pdfGenerationStatus = { 
         success: true, 
         message: 'PDF generado correctamente' 
       };
     } catch (error) {
       this.pdfGenerationStatus = { 
         success: false, 
         message: 'Error al generar el PDF: ' + (error as Error).message 
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