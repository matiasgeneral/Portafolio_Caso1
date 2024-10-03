import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import { formatDate } from '@angular/common'; // Importar para formatear fechas

@Component({
  selector: 'app-administrar-espacios-publicos',
  templateUrl: './administrar-espacios-publicos.component.html',
  styleUrls: ['./administrar-espacios-publicos.component.scss'],
})
export class AdministrarEspaciosPublicosComponent implements OnInit {
  id: string | null = null;
  espacioPublicoDetails: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) {
        this.firestoreService.getDoc<any>('espacioPublico', this.id).subscribe(espacioPublico => {
          if (espacioPublico) {
            this.espacioPublicoDetails = espacioPublico;
          }
        }, error => {
          console.error('Error al obtener el espacio público:', error);
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/buscador-espacios-publicos']);
  }

  deleteDoc() {
    if (this.id) {
      this.firestoreService.deleteDoc('espaciosPublicos', this.id).then(() => {
        this.goBack();
      }).catch(error => {
        console.error('Error al borrar el espacio público:', error);
      });
    }
  }

  deshabilitarDoc() {
    if (this.id) {
      this.firestoreService.updateDoc({ habilitado: false }, 'espaciosPublicos', this.id).then(() => {
        this.goBack();
      }).catch(error => {
        console.error('Error al deshabilitar el espacio público:', error);
      });
    }
  }

  // Método para formatear el título correctamente
  formatTitle(title: string): string {
    return title.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  // Método para formatear la fecha
  formatDate(date: any): string {
    return formatDate(date, 'dd/MM/yyyy', 'en-US');
  }
}
