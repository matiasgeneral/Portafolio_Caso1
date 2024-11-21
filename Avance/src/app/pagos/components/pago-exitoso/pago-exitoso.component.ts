// pago-exitoso.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoCertificadoService } from '../../services/pago-certificado.service';
import { PdfService } from 'src/app/service/pdf.service';


interface CertificadoPago {
  id: string;
  pdfDocumento: string;
  userData: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    rut: string;
    direccion: string;
  };
  estado: 'pendiente' | 'pagado' | 'cancelado';
}

@Component({
  selector: 'app-pago-exitoso',
  templateUrl: './pago-exitoso.component.html',
  styleUrls: ['./pago-exitoso.component.scss']
})
export class PagoExitosoComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoCertificadoService: PagoCertificadoService,
    private pdfService: PdfService
  ) {}

  async ngOnInit() {
    const certificadoId = this.route.snapshot.queryParams['certificado_id'];
    if (certificadoId) {
      const certificado = await this.pagoCertificadoService.actualizarEstadoPago(certificadoId, 'pagado') as unknown as CertificadoPago;
      if (certificado?.pdfDocumento && certificado.userData) {
        await this.pdfService.downloadPDF(certificado.pdfDocumento, certificado.userData);
      }
    }
  }

  volver() {
    this.router.navigate(['/']);
  }
}