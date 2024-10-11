import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import { FirestorageService } from 'src/app/service/firestorage.service';

@Component({
  selector: 'app-administrar-actividades',
  templateUrl: './administrar-actividades.component.html',
  styleUrls: ['./administrar-actividades.component.scss'],
})
export class AdministrarActividadesComponent  implements OnInit {
  id: string | null = null; // Aquí almacenaremos el id de la actividad
 actividadDetails: any; // Variable para almacenar los detalles de la actividad

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestoreService: FirestoreService,
    private FirestorageService: FirestorageService
  ) { }

  ngOnInit() {
    // Obtener el ID de la actividad desde los parámetros de la ruta
    this.route?.paramMap.subscribe(params => {
      this.id = params.get('id'); // Accede al id de la actividad
      console.log('ID de la actividad:', this.id);

      if (this.id) {
        // Cargar los detalles de la actividad
        this.firestoreService.getDoc<any>('actividad', this.id).subscribe(actividad => {
          if (actividad) {
            this.actividadDetails = actividad;
            console.log('Detalles de la actividad:', this.actividadDetails);
          } else {
            console.error('Actividad no encontrada');
          }
        }, error => {
          console.error('Error al obtener la actividad:', error);
        });
      }
    });
  }

  // Método para regresar a la lista de actividades
  goBack() {
    this.router.navigate(['/buscador-actividades']); // Asegúrate de que esta ruta sea correcta
  }

  // Método para ver los detalles de un usuario y luego editar
  verDetalles(actividades: any) {
    console.log('Detalles de la actividad:', actividades);
    // Asegúrate de que `usuario.rut` existe antes de navegar
    if (actividades.id) {
      this.router.navigate(['/editar-actividades', actividades.id]); // Redirige a la pantalla de detalles del usuario, pasando su RUT
    } else {
      console.error('RUT de usuario no definido');
    }
    }
  
  



  // Método para borrar la actividad
  deleteDoc() {
    if (this.id) {
      // Obtén el espacioPublico  para acceder a los datos de la imagen antes de eliminarla
      this.firestoreService.getDoc('actividad', this.id).subscribe((actividad: any) => {
        const imageUrl = actividad.image;  // Suponiendo que 'noticia.image' contiene la URL completa de la imagen
    
        // Primero elimina la imagen usando refFromURL
        this.FirestorageService.deleteImageFromUrl(imageUrl).subscribe(() => {
          console.log('Imagen borrada');
    
          // Luego elimina el documento
          this.firestoreService.deleteDoc('actividad', this.id!).then(() => {
            console.log('actividad borrada');
            this.goBack(); // Regresa a la lista de noticias después de borrar
          }).catch((error: any) => {
            console.error('Error al borrar la actividad:', error);
          });
        }, (error: any) => {
          console.error('Error al borrar la imagen:', error);
        });
      });
    }
  }

  // Método para deshabilitar la actividad
  deshabilitarDoc() {
    if (this.id) {
      this.firestoreService.deshabilitarDoc('actividad', this.id).then(() => {
        console.log('actividad deshabilitada');
        this.goBack(); // Regresa a la lista de nactividades después de deshabilitar
      }).catch(error => {
        console.error('Error al deshabilitar la actividad:', error);
      });
    }
  }
}
