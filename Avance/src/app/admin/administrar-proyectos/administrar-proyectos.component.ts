import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import {FirestorageService} from 'src/app/service/firestorage.service';


@Component({
  selector: 'app-administrar-proyectos',
  templateUrl: './administrar-proyectos.component.html',
  styleUrls: ['./administrar-proyectos.component.scss'],
})
export class AdministrarProyectosComponent implements OnInit {
  id: string | null = null; // Aquí almacenaremos el id del proyecto
  proyectoDetails: any; // Variable para almacenar los detalles del proyecto
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestoreService: FirestoreService,
    private FirestorageService: FirestorageService

  ) { }

  ngOnInit() {
    // Obtener el ID de la proyecto desde los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id'); // Accede al id del proyecto
      console.log('ID del proyecto:', this.id);

      if (this.id) {
        // Cargar los detalles del Proyecto
        this.firestoreService.getDoc<any>('proyecto', this.id).subscribe(proyecto => {
          if (proyecto) {
            this.proyectoDetails = proyecto;
            console.log('Detalles del Proyecto', this.proyectoDetails);
          } else {
            console.error('Proyecto no encontrada');
          }
        }, error => {
          console.error('Error al obtener el Proyecto:', error);
        });
      }
    });
  }

  // Método para regresar a la lista de Proyectos
  goBack() {
    this.router.navigate(['/buscador-proyectos']); // Asegúrate de que esta ruta sea correcta
  }

  // Método para editar el Proyecto
  updateDoc() {
    this.router.navigate(['/editar-proyecto', this.id]);
  }

  // Método para borrar el Proyecto
  deleteDoc() {
    if (this.id) {
      // Obtén el espacioPublico  para acceder a los datos de la imagen antes de eliminarla
      this.firestoreService.getDoc('proyecto', this.id).subscribe((proyecto: any) => {
        const imageUrl = proyecto.image;  // Suponiendo que 'noticia.image' contiene la URL completa de la imagen

        // Primero elimina la imagen usando refFromURL
        this.FirestorageService.deleteImageFromUrl(imageUrl).subscribe(() => {
          console.log('Imagen borrada');

          // Luego elimina el documento
          this.firestoreService.deleteDoc('proyecto', this.id!).then(() => {
            console.log('proyecto borrado');
            this.goBack(); // Regresa a la lista de noticias después de borrar
          }).catch((error: any) => {
            console.error('Error al borrar el proyecto:', error);
          });
        }, (error: any) => {
          console.error('Error al borrar la imagen:', error);
        });
      });
    }
  }

  // Método para deshabilitar el Proyecto
  deshabilitarDoc() {
    if (this.id) {
      this.firestoreService.deshabilitarDoc('proyecto', this.id).then(() => {
        console.log('Proyecto deshabilitada');
        this.goBack(); // Regresa a la lista de los Proyecto  después de deshabilitar
      }).catch(error => {
        console.error('Error al deshabilitar la Proyecto:', error);
      });
    }
  }
}
