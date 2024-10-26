import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-postulacion-eventos',
  templateUrl: './postulacion-eventos.component.html',
  styleUrls: ['./postulacion-eventos.component.scss'],
})
export class PostulacionEventosComponent implements OnInit {
  actividad: any; // Almacena la información de la actividad
  nombreSolicitante: string = ''; // Almacena el nombre del solicitante
  postulacionForm: FormGroup; // Formulario para la postulación
  disponible: boolean = true; // Indica si hay lugares disponibles

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private toastController: ToastController // Inyecta el ToastController
  ) {
    // Inicializa el formulario con validaciones
    this.postulacionForm = this.fb.group({
      cantidadParticipantes: ['', [Validators.required, Validators.min(1), Validators.max(3)]], // Límite de 3 participantes
    });
  }

  ngOnInit() {
    // Obtiene el ID de la actividad desde la ruta
    const actividadId = this.route.snapshot.paramMap.get('id');
    if (actividadId) {
      this.cargarActividad(actividadId); // Carga la información de la actividad
    } else {
      console.error('No se encontró el ID de la actividad.');
    }
    this.obtenerNombreSolicitante(); // Obtiene el nombre del solicitante
  }

  cargarActividad(id: string) {
    // Carga la información de la actividad desde Firestore
    this.firestoreService.getDoc<any>('actividades', id).subscribe(actividad => {
      this.actividad = actividad; // Asigna la actividad
      if (!this.actividad) {
        console.error('No se encontró la actividad con ID:', id);
      }
    }, error => {
      console.error('Error al cargar la actividad:', error);
    });
  }

  obtenerNombreSolicitante() {
    // Obtiene el nombre del usuario autenticado
    this.authService.stateAuth().subscribe(user => {
      if (user) {
        this.firestoreService.getDoc<any>('usuarios', user.uid).subscribe(userData => {
          if (userData) {
            this.nombreSolicitante = `${userData.nombre} ${userData.apellidoPaterno} ${userData.apellidoMaterno}`; // Concatenar nombres
          }
        });
      }
    });
  }

  postular() {
    // Envía la postulación a la actividad
    this.authService.stateAuth().subscribe(user => {
      if (user) {
        const cantidadParticipantes = this.postulacionForm.value.cantidadParticipantes;
        const cantidadDisponible = this.actividad.cantidadDisponible;

        // Verifica si hay lugares disponibles
        if (cantidadDisponible >= cantidadParticipantes) {
          const postulacion = {
            cantidadParticipantes: cantidadParticipantes,
            solicitante: {
              uid: user.uid,
              nombre: this.nombreSolicitante,
              fechaSolicitud: this.obtenerFechaActual(),
            }
          };

          // Actualiza la cantidad disponible de la actividad
          this.firestoreService.actualizarCantidadDisponible(this.actividad.id, cantidadParticipantes)
            .then(() => {
              // Guarda la postulación en la base de datos
              this.firestoreService.addPostulacion(this.actividad.id, postulacion) // Cambia el argumento de la función
                .then(() => {
                  console.log('Postulación enviada exitosamente');
                  this.mostrarToast('Postulación enviada exitosamente'); // Muestra el mensaje de éxito
                  this.postulacionForm.reset(); // Limpiar el formulario
                  this.disponible = true; // Resetea la disponibilidad
                })
                .catch(error => console.error('Error al enviar la postulación:', error));
            })
            .catch(error => console.error('Error al actualizar cantidad disponible:', error));
        } else {
          console.error('No hay suficientes lugares disponibles.');
          this.disponible = false; // Actualiza la disponibilidad
          this.mostrarToast('No hay suficientes lugares disponibles.'); // Muestra un mensaje de error
        }
      } else {
        console.error('No se encontró el usuario autenticado.');
      }
    });
  }

  // Método para mostrar un toast
  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000, // Duración en milisegundos
      position: 'top', // Posición del toast
    });
    await toast.present(); // Presenta el toast
  }

  obtenerFechaActual(): string {
    // Devuelve la fecha actual formateada
    const fecha = new Date();
    const opciones = { year: 'numeric' as const, month: '2-digit' as const, day: '2-digit' as const, timeZone: 'UTC' };
    const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
    return fechaFormateada.split('/').reverse().join('-'); // Cambia de DD/MM/YYYY a YYYY-MM-DD
  }
}
