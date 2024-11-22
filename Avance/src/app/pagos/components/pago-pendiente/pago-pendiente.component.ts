import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pago-pendiente',
  templateUrl: './pago-pendiente.component.html',
  styleUrls: ['./pago-pendiente.component.scss']
})
export class PagoPendienteComponent {
  constructor(private router: Router) {}

  volver() {
    this.router.navigate(['/']);
  }
}
