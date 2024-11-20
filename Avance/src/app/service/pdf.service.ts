import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { AlertController } from '@ionic/angular';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(private platform: Platform, private alertController: AlertController) {
    // Inicializar las fuentes para PDFMake
    try {
      (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
      console.log('vfs asignado correctamente a pdfMake.');
    } catch (error) {
      console.error('Error al asignar vfs a pdfMake:', error);
    }
  }

  async generateCertificate(userData: any) {
    const fullName = `${userData.nombre} ${userData.apellidoPaterno} ${userData.apellidoMaterno}`;
    const currentDate = new Date();
    const formattedDate = this.formatDate(currentDate); // Formatear la fecha actual
    const formattedTime = this.formatTime(currentDate); // Formatear la hora actual

    // Definición del documento PDF
    const documentDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Certificado de Residencia', style: 'header' },
        { text: 'Junta de Vecinos San Bernardo', style: 'subheader', margin: [0, 10, 0, 20] },
        { text: `\nNombre completo: ${fullName}`, style: 'details' },
        { text: `Dirección: ${userData.direccion}`, style: 'details' },
        { text: `RUT: ${userData.rut}`, style: 'details' },
        { text: `Fecha de emisión: ${formattedDate}`, style: 'details', margin: [0, 10, 0, 10] },
        {
          text:
            'Este certificado acredita que el usuario mencionado reside en la dirección indicada, ' +
            'y puede utilizar este documento para los fines que estime convenientes.',
          margin: [0, 10, 0, 10],
        },
        {
          text: '\n_____Junta de Vecinos de San Bernardo_____',
          alignment: 'center',
          margin: [0, 30, 0, 5],
        },
        { text: 'Firma del Responsable', alignment: 'center', margin: [0, 0, 0, 20] },
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 10],
        },
        subheader: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        details: {
          fontSize: 14,
          margin: [0, 5, 0, 5],
        },
      },
      pageMargins: [40, 60, 40, 60], // Márgenes de la página
    };

    // Crear el PDF usando PDFMake
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

    // Manejo para plataformas móviles o web
    if (this.platform.is('hybrid')) {
      // En Android/iOS, guardar el PDF en el dispositivo
      pdfDocGenerator.getBase64(async (data) => {
        try {
          const fileName = `certificado_residencia_${fullName.replace(/\s+/g, '_')}_${formattedDate}_${formattedTime}.pdf`;
          await this.savePdfToDevice(data, fileName);
          console.log('PDF guardado correctamente.');

          // Mostrar alerta solo en Android
          if (this.platform.is('android')) {
            this.showDownloadAlert();
          }
        } catch (error) {
          console.error('Error al guardar el PDF:', error);
        }
      });
    } else {
      // En la web, descargar el archivo directamente
      const fileName = `certificado_residencia_${fullName.replace(/\s+/g, '_')}_${formattedDate}_${formattedTime}.pdf`;
      pdfDocGenerator.download(fileName);
    }
  }

  // Guardar PDF en el dispositivo móvil
  private async savePdfToDevice(pdfData: string, fileName: string) {
    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: pdfData,
        directory: Directory.Documents,
        recursive: true,
      });
      console.log('PDF guardado en:', result.uri);
    } catch (error) {
      console.error('Error al guardar el archivo en el dispositivo:', error);
      throw new Error('No se pudo guardar el PDF en el dispositivo.');
    }
  }

  // Método para mostrar alerta
  private async showDownloadAlert() {
    const alert = await this.alertController.create({
      header: 'PDF Guardado',
      message:
        'Recuerda ver la carpeta Documentos para ver el archivo, la carpeta donde se guarda su certificado de residencia puede variar dependiendo del dispositivo.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  // Formatear la fecha en 'dd-mm-yyyy'
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses son 0-11
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Formatear la hora en 'hh-mm'
  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}-${minutes}`;
  }
}
