import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import { FirestorageService } from 'src/app/service/firestorage.service';

@Component({
  selector: 'app-administrar-noticias',
  templateUrl: './administrar-noticias.component.html',
  styleUrls: ['./administrar-noticias.component.scss'],
})
export class AdministrarNoticiasComponent implements OnInit {
  id: string | null = null; // Aquí almacenaremos el id de la noticia
  noticiaDetails: any; // Variable para almacenar los detalles de la noticia

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestoreService: FirestoreService,
    private FirestorageService: FirestorageService
  ) { }

  ngOnInit() {
    // Obtener el ID de la noticia desde los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id'); // Accede al id de la noticia
      console.log('ID de la noticia:', this.id);

      if (this.id) {
        // Cargar los detalles de la noticia
        this.firestoreService.getDoc<any>('noticias', this.id).subscribe(noticia => {
          if (noticia) {
            this.noticiaDetails = noticia;
            console.log('Detalles de la noticia:', this.noticiaDetails);
          } else {
            console.error('Noticia no encontrada');
          }
        }, error => {
          console.error('Error al obtener la noticia:', error);
        });
      }
    });
  }

  // Método para regresar a la lista de noticias
  goBack() {
    this.router.navigate(['/buscador-noticias']); // Asegúrate de que esta ruta sea correcta
  }

 // Método para ver los detalles de un usuario y luego editar
 verDetalles(noticias: any) {
  console.log('Detalles de las noticias:', noticias);
  if (noticias.id) {
    this.router.navigate(['/editar-noticias', noticias.id]); // Asegúrate de que la ruta sea correcta
  } else {
    console.error('ID de noticia no definido');
  }
}



  deleteDoc() {
    if (this.id) {
      // Obtén la noticia para acceder a los datos de la imagen antes de eliminarla
      this.firestoreService.getDoc('noticias', this.id).subscribe((noticia: any) => {
        const imageUrl = noticia.image;  // Suponiendo que 'noticia.image' contiene la URL completa de la imagen
    
        // Primero elimina la imagen usando refFromURL
        this.FirestorageService.deleteImageFromUrl(imageUrl).subscribe(() => {
          console.log('Imagen borrada');
    
          // Luego elimina el documento
          this.firestoreService.deleteDoc('noticias', this.id!).then(() => {
            console.log('Noticia borrada');
            this.goBack(); // Regresa a la lista de noticias después de borrar
          }).catch((error: any) => {
            console.error('Error al borrar la noticia:', error);
          });
        }, (error: any) => {
          console.error('Error al borrar la imagen:', error);
        });
      });
    }
  }
  



/*  
// Método para deshabilitar la noticia
  deshabilitarDoc() {
    if (this.id) {
      this.firestoreService.deshabilitarDoc('noticias', this.id).then(() => {
        console.log('Noticia deshabilitada');
        this.goBack(); // Regresa a la lista de noticias después de deshabilitar
      }).catch(error => {
        console.error('Error al deshabilitar la noticia:', error);
      });
    }
  }
    */

}
