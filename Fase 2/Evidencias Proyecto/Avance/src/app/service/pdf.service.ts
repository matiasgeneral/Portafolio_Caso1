import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { AlertController } from '@ionic/angular';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { DocumentoService } from './documento.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private readonly DOCUMENT_PREFIX = 'CR';
  private readonly STORAGE_KEY = 'last_document_number';

  constructor(
    private platform: Platform,
    private alertController: AlertController,
    private documentoService: DocumentoService
  ) {
    try {
      (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
      console.log('vfs asignado correctamente a pdfMake.');
    } catch (error) {
      console.error('Error al asignar vfs a pdfMake:', error);
    }
  }

  private async generateDocumentNumber(): Promise<string> {
    const lastNumber = localStorage.getItem(this.STORAGE_KEY) || '0';
    const nextNumber = parseInt(lastNumber) + 1;
    localStorage.setItem(this.STORAGE_KEY, nextNumber.toString());
    
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const sequence = String(nextNumber).padStart(5, '0');
    
    return `${this.DOCUMENT_PREFIX}-${year}${month}${day}-${sequence}`;
  }

  public validateDocumentNumber(documentNumber: string): boolean {
    const regex = /^CR-\d{8}-\d{5}$/;
    if (!regex.test(documentNumber)) {
      return false;
    }

    const datePart = documentNumber.split('-')[1];
    const year = parseInt(datePart.substring(0, 4));
    const month = parseInt(datePart.substring(4, 6)) - 1;
    const day = parseInt(datePart.substring(6, 8));

    const date = new Date(year, month, day);
    return date instanceof Date && !isNaN(date.getTime());
  }

  async generateCertificate(userData: any): Promise<string> {
    const documentNumber = await this.generateDocumentNumber();
    const fullName = `${userData.nombre} ${userData.apellidoPaterno} ${userData.apellidoMaterno}`;
    const currentDate = new Date();
    const formattedDate = this.formatDate(currentDate);
    const formattedTime = this.formatTime(currentDate);

    // Guardar la información del documento
    await this.documentoService.guardarDocumento({
      numeroDocumento: documentNumber,
      fechaEmision: currentDate,
      userData: {
        nombre: userData.nombre,
        apellidoPaterno: userData.apellidoPaterno,
        apellidoMaterno: userData.apellidoMaterno,
        direccion: userData.direccion,
        rut: userData.rut
      }
    });

    return new Promise((resolve, reject) => {
      const documentDefinition: TDocumentDefinitions = {
        content: [
          { text: 'Certificado de Residencia', style: 'header' },
          { text: 'Junta de Vecinos San Bernardo', style: 'subheader', margin: [0, 10, 0, 10] },
          { text: `Número de Documento: ${documentNumber}`, style: 'documentNumber', margin: [0, 0, 0, 5] },
          { text: `Nombre completo: ${fullName}`, style: 'details' },
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
          documentNumber: {
            fontSize: 12,
            color: '#444444',
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

  private async showDownloadAlert() {
    const alert = await this.alertController.create({
      header: 'PDF Guardado',
      message: 'Recuerda ver la carpeta Documentos para ver el archivo, la carpeta donde se guarda su certificado de residencia puede variar dependiendo del dispositivo.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}-${minutes}`;
  }
}