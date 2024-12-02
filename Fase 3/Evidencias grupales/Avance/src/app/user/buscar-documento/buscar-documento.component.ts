import { Component } from '@angular/core';
import { DocumentoService, DocumentoResidencia } from '../../service/documento.service';
import { AlertController } from '@ionic/angular';
import { PdfService } from '../../service/pdf.service';

@Component({
  selector: 'app-buscar-documento',
  templateUrl: './buscar-documento.component.html',
  styleUrls: ['./buscar-documento.component.scss']
})
export class BuscarDocumentoComponent {
  numeroDocumento: string = '';
  documentoEncontrado: DocumentoResidencia | null = null;
  isLoading: boolean = false;

  constructor(
    private documentoService: DocumentoService,
    private alertController: AlertController,
    private pdfService: PdfService
  ) {}

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }



  getFechaFormateada(date: Date): string {
    return `${this.formatDate(date)} `;
  }

  async buscarDocumento() {
    if (!this.numeroDocumento) {
      await this.mostrarAlerta('Error', 'Por favor ingrese un número de documento');
      return;
    }

    if (!this.pdfService.validateDocumentNumber(this.numeroDocumento)) {
      await this.mostrarAlerta('Error', 'El formato del número de documento no es válido');
      return;
    }

    this.isLoading = true;
    this.documentoService.buscarDocumento(this.numeroDocumento)
      .subscribe(
        async (documento) => {
          this.isLoading = false;
          if (documento) {
            this.documentoEncontrado = documento;
          } else {
            this.documentoEncontrado = null;
            await this.mostrarAlerta(
              'No encontrado', 
              'No se encontró ningún documento con el número proporcionado'
            );
          }
        },
        async (error) => {
          this.isLoading = false;
          this.documentoEncontrado = null;
          await this.mostrarAlerta('Error', 'Error al buscar el documento');
          console.error('Error en la búsqueda:', error);
        }
      );
  }

  private async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}