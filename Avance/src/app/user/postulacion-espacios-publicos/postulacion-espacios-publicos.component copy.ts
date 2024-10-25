import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular'; // Importa ToastController

@Component({
  selector: 'app-postulacion-espacios-publicos',
  templateUrl: './postulacion-espacios-publicos.component.html',
  styleUrls: ['./postulacion-espacios-publicos.component.scss'],
})
export class PostulacionEspaciosPublicosComponent implements OnInit {
  espacioPublico: any; // Almacena la información del espacio público
  nombreSolicitante: string = ''; // Almacena el nombre del solicitante
  postulacionForm: FormGroup; // Formulario para la postulación
  horasDisponibles: string[] = []; // Almacena las horas disponibles
  minutosDisponibles: string[] = ['00', '30']; // Opciones de minutos disponibles
  disponible: boolean = true; // Indica si la fecha/hora está disponible

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private toastController: ToastController // Inyecta el ToastController
  ) {
    // Inicializa el formulario con validaciones
    this.postulacionForm = this.fb.group({
      fechaUso: ['', [Validators.required, this.validarFechaNoPasada]], // Validación de fecha no pasada
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
    });
  }

  ngOnInit() {
    // Obtiene el ID del espacio público desde la ruta
    const espacioId = this.route.snapshot.paramMap.get('id');
    if (espacioId) {
      this.cargarEspacioPublico(espacioId); // Carga la información del espacio público
    } else {
      console.error('No se encontró el ID del espacio público.');
    }
    this.obtenerNombreSolicitante(); // Obtiene el nombre del solicitante
    this.generarHorasDisponibles(); // Genera las horas disponibles

    // Verifica disponibilidad cuando cambia el formulario
    this.postulacionForm.valueChanges.subscribe(() => {
      this.verificarDisponibilidadAutomatico();
    });
  }

  cargarEspacioPublico(id: string) {
    // Carga la información del espacio público desde Firestore
    this.firestoreService.getDoc<any>('espaciosPublicos', id).subscribe(espacio => {
      this.espacioPublico = espacio; // Asigna el espacio público
      if (!this.espacioPublico) {
        console.error('No se encontró el espacio público con ID:', id);
      }
    }, error => {
      console.error('Error al cargar el espacio público:', error);
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
    // Envía la postulación al espacio público
    this.authService.stateAuth().subscribe(user => {
      if (user) {
        const fechaReservada = {
          fecha: this.postulacionForm.value.fechaUso,
          horaInicio: this.postulacionForm.value.horaInicio,
          horaFin: this.postulacionForm.value.horaFin,
          solicitante: {
            uid: user.uid,
            nombre: this.nombreSolicitante,
            fechaSolicitud: this.obtenerFechaActual(),
          }
        };

        // Verifica disponibilidad antes de agregar la fecha reservada
        this.verificarDisponibilidad(fechaReservada).then(disponible => {
          if (disponible) {
            this.firestoreService.addFechaReservada(this.espacioPublico.id, fechaReservada)
              .then(() => {
                console.log('Postulación enviada exitosamente');
                this.mostrarToast('Postulación enviada exitosamente'); // Muestra el mensaje de éxito
                this.postulacionForm.reset(); // Limpiar el formulario
                this.disponible = true; // Resetea la disponibilidad
              })
              .catch(error => console.error('Error al enviar la postulación:', error));
          } else {
            console.error('La fecha y hora ya están ocupadas.');
            this.disponible = false; // Actualiza la disponibilidad
          }
        });
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

  validarFechaNoPasada(control: any) {
    // Valida que la fecha no sea pasada
    const fechaSeleccionada = new Date(control.value);
    const fechaActual = new Date();
    return fechaSeleccionada >= fechaActual ? null : { fechaPasada: true };
  }

  generarHorasDisponibles() {
    // Genera las horas disponibles de 08:00 a 20:00
    for (let i = 8; i <= 20; i++) {
      this.horasDisponibles.push(`${i < 10 ? '0' + i : i}:00`);
      this.horasDisponibles.push(`${i < 10 ? '0' + i : i}:30`);
    }
  }

  // Método para verificar la disponibilidad de fecha y hora
  verificarDisponibilidad(fechaReservada: any): Promise<boolean> {
    // Verifica si la fecha y hora ya están ocupadas en las reservas del espacio público
    return new Promise<boolean>((resolve) => {
      const reservas = this.espacioPublico.fechasReservadas || []; // Obtiene las reservas
      const fechaSolicitada = fechaReservada.fecha;
      const horaInicioSolicitada = fechaReservada.horaInicio;
      const horaFinSolicitada = fechaReservada.horaFin;

      const ocupada = reservas.some((reserva: any) => {
        return reserva.fecha === fechaSolicitada &&
               (
                 (horaInicioSolicitada >= reserva.horaInicio && horaInicioSolicitada < reserva.horaFin) ||
                 (horaFinSolicitada > reserva.horaInicio && horaFinSolicitada <= reserva.horaFin) ||
                 (horaInicioSolicitada <= reserva.horaInicio && horaFinSolicitada >= reserva.horaFin)
               );
      });

      resolve(!ocupada); // Devuelve true si está disponible, false si está ocupada
    });
  }

  // Método para verificar la disponibilidad automáticamente
  verificarDisponibilidadAutomatico() {
    const fechaReservada = {
      fecha: this.postulacionForm.value.fechaUso,
      horaInicio: this.postulacionForm.value.horaInicio,
      horaFin: this.postulacionForm.value.horaFin,
    };

    // Verifica disponibilidad y actualiza la propiedad 'disponible'
    this.verificarDisponibilidad(fechaReservada).then(disponible => {
      this.disponible = disponible;
    });
  }
}
