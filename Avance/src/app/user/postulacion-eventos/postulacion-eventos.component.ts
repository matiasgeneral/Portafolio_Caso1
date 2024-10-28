import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private router: Router,
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
    console.log('ID de actividad obtenido:', actividadId); // Log del ID de actividad

    if (actividadId) {
      this.cargarActividad(actividadId); // Carga la información de la actividad
    } else {
      console.error('No se encontró el ID de la actividad.');
    }
    this.obtenerNombreSolicitante(); // Obtiene el nombre del solicitante
  }

  cargarActividad(id: string) {
    // Carga la información de la actividad desde Firestore
    console.log('Cargando actividad con ID:', id); // Log al cargar la actividad
    this.firestoreService.getDoc<any>('actividades', id).subscribe(actividad => {
      console.log('Actividad cargada:', actividad); // Log de la actividad cargada
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
        console.log('Usuario autenticado:', user.uid); // Log del UID del usuario autenticado
        this.firestoreService.getDoc<any>('usuarios', user.uid).subscribe(userData => {
          if (userData) {
            this.nombreSolicitante = `${userData.nombre} ${userData.apellidoPaterno} ${userData.apellidoMaterno}`; // Concatenar nombres
            console.log('Nombre del solicitante:', this.nombreSolicitante); // Log del nombre del solicitante
          } else {
            console.error('No se encontró información del usuario.');
          }
        }, error => {
          console.error('Error al obtener información del usuario:', error);
        });
      } else {
        console.error('No hay usuario autenticado.');
      }
    });
  }

  postular() {
    // Envía la postulación a la actividad
    this.authService.stateAuth().subscribe(user => {
      if (user) {
        const cantidadParticipantes = this.postulacionForm.value.cantidadParticipantes; // Obtiene la cantidad de participantes
        const cantidadDisponible = this.actividad.cantidadDisponible; // Obtiene la cantidad disponible

        console.log('Cantidad de participantes:', cantidadParticipantes); // Log de la cantidad de participantes
        console.log('Cantidad disponible:', cantidadDisponible); // Log de la cantidad disponible

        // Verifica si el usuario ya está inscrito
        if (this.usuarioYaPostulado(user.uid)) {
          this.mostrarToast('Ya estás inscrito en esta actividad.'); // Mensaje de error
          console.log('El usuario ya está inscrito:', user.uid); // Log si el usuario ya está inscrito
          return; // No continuar con la postulación
        }

        // Verifica si hay lugares disponibles
        if (cantidadDisponible >= cantidadParticipantes) {
          const participante = {
            uid: user.uid, // UID del usuario
            nombre: this.nombreSolicitante, // Nombre del solicitante
            fechaInscripcion: this.obtenerFechaActual(), // Fecha de inscripción
            cantidadParticipantes: cantidadParticipantes // Cantidad de acompañantes
          };

          console.log('Participante a agregar:', participante); // Log del participante

          // Actualiza la cantidad disponible de la actividad
          this.firestoreService.actualizarCantidadDisponible(this.actividad.id, cantidadParticipantes)
            .then(() => {
              console.log('Cantidad disponible actualizada exitosamente'); // Log de éxito
              // Agrega el nuevo participante a la lista de participantes en la actividad
              this.firestoreService.agregarParticipante(this.actividad.id, participante)
                .then(() => {
                  console.log('Participante agregado exitosamente');
                  this.mostrarToast('Postulación enviada exitosamente'); // Muestra el mensaje de éxito
                  this.postulacionForm.reset(); // Limpiar el formulario
                  this.disponible = true; // Resetea la disponibilidad
                })
                .catch(error => {
                  console.error('Error al agregar el participante:', error);
                });
            })
            .catch(error => {
              console.error('Error al actualizar cantidad disponible:', error);
            });
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

  // Método para verificar si el usuario ya está postulado
  usuarioYaPostulado(uid: string): boolean {
    console.log('Verificando si el usuario ya está postulado:', uid); // Log de verificación
    if (!this.actividad.participantes) {
      console.warn('No hay participantes en la actividad.'); // Advertencia si no hay participantes
      return false; // Si no hay participantes, el usuario no está inscrito
    }
    return this.actividad.participantes.some((participante: any) => participante.uid === uid);
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

  // Método para regresar a la lista de noticias
  goBack() {
    this.router.navigate(['/visualizacion-eventos']); // Asegúrate de que esta ruta sea correcta
  }
}
