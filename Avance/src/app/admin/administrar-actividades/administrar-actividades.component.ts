import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';

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
    private firestoreService: FirestoreService
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

  // Método para editar la actividad
  updateDoc() {
    this.router.navigate(['/editar-actividad', this.id]);
  }

  // Método para borrar la actividad
  deleteDoc() {
    if (this.id) {
      this.firestoreService.deleteDoc('actividad', this.id).then(() => {
        console.log('Actividad borrada');
        this.goBack(); // Regresa a la lista de actividad después de borrar
      }).catch(error => {
        console.error('Error al borrar la actividad:', error);
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
