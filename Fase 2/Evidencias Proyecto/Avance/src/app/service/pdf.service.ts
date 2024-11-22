import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { AlertController } from '@ionic/angular';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  generarPdf(userData: any) {
    throw new Error('Method not implemented.');
  }
  constructor(
    private platform: Platform,
    private alertController: AlertController
  ) {
    try {
      (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
      console.log('vfs asignado correctamente a pdfMake.');
    } catch (error) {
      console.error('Error al asignar vfs a pdfMake:', error);
    }
  }

  /**
   * Genera el PDF sin descargarlo, solo retorna el base64
   */
  async generateCertificate(userData: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const fullName = `${userData.nombre} ${userData.apellidoPaterno} ${userData.apellidoMaterno}`;
      const currentDate = new Date();
      const formattedDate = this.formatDate(currentDate);
      const formattedTime = this.formatTime(currentDate);

      const documentDefinition: TDocumentDefinitions = {
        content: [
          { text: 'Certificado de Residencia', style: 'header' },
          { text: 'Junta de Vecinos San Bernardo', style: 'subheader', margin: [0, 10, 0, 20] },
          { text: `\nNombre completo: ${fullName}`, style: 'details' },
          { text: `Dirección: ${userData.direccion}`, style: 'details' },
          { text: `RUT: ${userData.rut}`, style: 'details' },
          { text: `Fecha de emisión: ${formattedDate}`, style: 'details', margin: [0, 10, 0, 10] },
          {
            text: 'Este certificado acredita que el usuario mencionado reside en la dirección indicada, ' +
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
        pageMargins: [40, 60, 40, 60],
      };

      const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.getBase64(base64 => {
        resolve(base64);
      });
    });
  }

  /**
   * Descarga o guarda el PDF después del pago exitoso
   */
  async downloadPDF(pdfBase64: string, userData: any) {
    const currentDate = new Date();
    const formattedDate = this.formatDate(currentDate);
    const formattedTime = this.formatTime(currentDate);
    const fullName = `${userData.nombre} ${userData.apellidoPaterno} ${userData.apellidoMaterno}`;
    
    if (this.platform.is('hybrid')) {
      const fileName = `certificado_residencia_${fullName.replace(/\s+/g, '_')}_${formattedDate}_${formattedTime}.pdf`;
      await this.savePdfToDevice(pdfBase64, fileName);
      if (this.platform.is('android')) {
        await this.showDownloadAlert();
      }
    } else {
      const linkSource = `data:application/pdf;base64,${pdfBase64}`;
      const downloadLink = document.createElement("a");
      const fileName = `certificado_residencia_${fullName.replace(/\s+/g, '_')}_${formattedDate}_${formattedTime}.pdf`;

      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    }
  }

  /**
   * Guarda el PDF en el dispositivo móvil
   */
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

  /**
   * Muestra alerta de descarga completada
   */
  private async showDownloadAlert() {
    const alert = await this.alertController.create({
      header: 'PDF Guardado',
      message: 'Recuerda ver la carpeta Documentos para ver el archivo, la carpeta donde se guarda su certificado de residencia puede variar dependiendo del dispositivo.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  /**
   * Formatea la fecha a dd-mm-yyyy
   */
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Formatea la hora a hh-mm
   */
  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}-${minutes}`;
  }
}