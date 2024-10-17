import { Component, OnInit } from '@angular/core';
import { PdfService } from 'src/app/service/pdf.service'; // Servicio para generar el PDF
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-solicitud-certificado-residencia',
  templateUrl: './solicitud-certificado-residencia.component.html',
  styleUrls: ['./solicitud-certificado-residencia.component.scss'],
})
export class SolicitudCertificadoResidenciaComponent implements OnInit {
  userData: any = {};

  constructor(
    private pdfService: PdfService,              // Servicio para generar el PDF
    private afAuth: AngularFireAuth,             // Servicio de autenticación de Firebase
    private firestore: AngularFirestore          // Servicio de Firestore para obtener datos del usuario
  ) {}

  ngOnInit() {
    // Obtenemos el estado de autenticación del usuario
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        // Obtenemos los datos del usuario autenticado desde Firestore
        this.firestore
          .collection('Usuario')
          .doc(user.uid)
          .valueChanges()
          .subscribe((data) => {
            this.userData = data;
          });
      }
    });
  }

  // Método para generar el PDF con los datos del usuario
  generatePDF() {
    if (this.userData) {
      this.pdfService.generateCertificate(this.userData);
    }
  }
}
