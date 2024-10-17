import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import { formatDate } from '@angular/common'; // Importar para formatear fechas
import {FirestorageService} from 'src/app/service/firestorage.service';

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
    private FirestorageService: FirestorageService
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
      // Obtén el espacioPublico  para acceder a los datos de la imagen antes de eliminarla
      this.firestoreService.getDoc('espacioPublico', this.id).subscribe((espacioPublico: any) => {
        const imageUrl = espacioPublico.image;  // Suponiendo que 'noticia.image' contiene la URL completa de la imagen
    
        // Primero elimina la imagen usando refFromURL
        this.FirestorageService.deleteImageFromUrl(imageUrl).subscribe(() => {
          console.log('Imagen borrada');
    
          // Luego elimina el documento
          this.firestoreService.deleteDoc('espacioPublico', this.id!).then(() => {
            console.log('espacio publico borrado');
            this.goBack(); // Regresa a la lista de espacio publicos después de borrar
          }).catch((error: any) => {
            console.error('Error al borrar el espacio publico:', error);
          });
        }, (error: any) => {
          console.error('Error al borrar la imagen:', error);
        });
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

   // Método para ver los detalles  luego editar
 verDetalles(espacioPublico: any) {
  console.log('Detalles del espacio publico', espacioPublico);
  if (espacioPublico.id) {
    this.router.navigate(['/editar-espacios-publicos', espacioPublico.id]); // Asegúrate de que la ruta sea correcta
  } else {
    console.error('ID del espacio publico no  es definido');
  }
}



}
