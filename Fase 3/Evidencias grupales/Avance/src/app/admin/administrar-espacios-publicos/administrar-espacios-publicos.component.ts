import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import { formatDate } from '@angular/common'; // Importar para formatear fechas
import { FirestorageService } from 'src/app/service/firestorage.service';

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
    private firestoreService: FirestoreService,
    private firestorageService: FirestorageService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) {
        this.firestoreService.getDoc<any>('espaciosPublicos', this.id).subscribe(espacioPublico => {
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
      // Obtén el espacioPublico para acceder a los datos de la imagen antes de eliminarla
      this.firestoreService.getDoc('espaciosPublicos', this.id).subscribe((espacioPublico: any) => {
        const imageUrl = espacioPublico.image; // Suponiendo que 'espacioPublico.image' contiene la URL completa de la imagen

        // Primero elimina la imagen usando refFromURL
        this.firestorageService.deleteImageFromUrl(imageUrl).subscribe(() => {
          console.log('Imagen borrada');

          // Luego elimina el documento
          this.firestoreService.deleteDoc('espaciosPublicos', this.id!).then(() => {
            console.log('espacio público borrado');
            this.goBack(); // Regresa a la lista de espacios públicos después de borrar
          }).catch((error: any) => {
            console.error('Error al borrar el espacio público:', error);
          });
        }, (error: any) => {
          console.error('Error al borrar la imagen:', error);
        });
      });
    }
  }
/*
  deshabilitarDoc() {
    if (this.id) {
      this.firestoreService.updateDoc({ habilitado: false }, 'espaciosPublicos', this.id).then(() => {
        this.goBack();
      }).catch(error => {
        console.error('Error al deshabilitar el espacio público:', error);
      });
    }
  }
*/


  // Método para formatear el título y la descripción correctamente
  formatTitle(title: string): string {
    return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
  }

  formatDescription(description: string): string {
    return description.charAt(0).toUpperCase() + description.slice(1).toLowerCase();
  }

  // Método para formatear la fecha
  formatDate(dateString: string | undefined): string {
    if (!dateString) {
      return 'Fecha no disponible'; // Manejo de fecha no disponible
    }

    // Asumir que dateString está en formato 'DD/MM/YYYY'
    const parts = dateString.split('/');
    return `${parts[0]}/${parts[1]}/${parts[2]}`; // Retorna en formato 'DD/MM/YYYY'
  }

  // Método para ver los detalles y luego editar
  verDetalles(espacioPublico: any) {
    console.log('Detalles del espacio público', espacioPublico);
    if (espacioPublico.id) {
      this.router.navigate(['/editar-espacios-publicos', espacioPublico.id]); // Asegúrate de que la ruta sea correcta
    } else {
      console.error('ID del espacio público no está definido');
    }
  }
}
