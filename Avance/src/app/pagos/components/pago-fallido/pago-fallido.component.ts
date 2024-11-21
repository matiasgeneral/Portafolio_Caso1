import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoCertificadoService } from '../../services/pago-certificado.service';

@Component({
  selector: 'app-pago-fallido',
  templateUrl: './pago-fallido.component.html',
  styleUrls: ['./pago-fallido.component.scss']
})
export class PagoFallidoComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoCertificadoService: PagoCertificadoService
  ) {}

  ngOnInit() {
    const certificadoId = this.route.snapshot.queryParams['certificado_id'];
    if (certificadoId) {
      this.pagoCertificadoService.actualizarEstadoPago(certificadoId, 'cancelado');
    }
  }

  reintentar() {
    this.router.navigate(['/solicitar-certificado']);
  }
}