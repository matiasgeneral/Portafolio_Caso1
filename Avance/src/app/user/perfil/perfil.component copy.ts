import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AuthenticationService } from 'src/app/service/authentication.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  usuario: any; // Almacena los datos personales del usuario
  postulacionesEspacios: any[] = []; // Lista de postulaciones a espacios públicos del usuario
  postulacionesActividades: any[] = []; // Lista de postulaciones a actividades del usuario

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    this.cargarPerfilUsuario();
    this.cargarPostulacionesUsuario();
    this.cargarPostulacionesActividades(); // Cargar postulaciones a actividades
  }

  // Cargar datos del usuario autenticado
  cargarPerfilUsuario() {
    this.authService.stateAuth().subscribe(user => {
      if (user) {
        this.firestoreService.getDoc<any>('usuarios', user.uid).subscribe(usuarioData => {
          this.usuario = usuarioData;
          console.log('Datos del usuario:', this.usuario);
        });
      }
    });
  }

  // Cargar postulaciones de espacios públicos del usuario
  cargarPostulacionesUsuario() {
    this.authService.stateAuth().subscribe(user => {
      if (user) {
        this.firestoreService.getPostulacionesUsuario(user.uid).subscribe(postulaciones => {
          // Filtrar solo las postulaciones del usuario autenticado
          this.postulacionesEspacios = postulaciones.filter((post: any) => 
            post.fechasReservadas &&
            post.fechasReservadas.some((reserva: any) => reserva.solicitante.uid === user.uid)
          ).map((post: any) => {
            const primeraReserva = post.fechasReservadas.find((reserva: any) => reserva.solicitante.uid === user.uid);
            return {
              ...post,
              fechaReservada: this.formatDate(primeraReserva.fecha), // Formatear la fecha reservada
              horaInicio: primeraReserva.horaInicio,
              horaFin: primeraReserva.horaFin,
              fechaSolicitud: this.formatDate(primeraReserva.solicitante.fechaSolicitud), // Formatear la fecha de solicitud
              image: post.image // Asegúrate de tener la URL de la imagen aquí
            };
          });
          console.log('Postulaciones a espacios públicos del usuario autenticado:', this.postulacionesEspacios);
        }, error => {
          console.error('Error al cargar postulaciones de espacios públicos:', error);
        });
      }
    });
  }

  // Cargar postulaciones a actividades del usuario
  cargarPostulacionesActividades() {
    this.authService.stateAuth().subscribe(user => {
      if (user) {
        this.firestoreService.getActividades().subscribe(actividades => {
          this.postulacionesActividades = actividades.filter((actividad: any) =>
            Array.isArray(actividad.participantes) && 
            actividad.participantes.some((participante: any) => participante.uid === user.uid)
          ).map((actividad: any) => {
            const participante = actividad.participantes.find((p: any) => p.uid === user.uid);
            
            // Log para depuración
            console.log('Actividad cargada:', actividad);
            console.log('Fecha de evento original:', actividad.fechaEvento);

            return {
              ...actividad,
              fechaInscripcion: this.formatDate(participante?.fechaInscripcion), // Formatear fecha de inscripción
              fechaEvento: this.formatDate(actividad.fechaEvento), // Formatear fecha de evento
              cantidadParticipantes: participante?.cantidadParticipantes
            };
          });
          console.log('Postulaciones a actividades del usuario autenticado:', this.postulacionesActividades);
        }, error => {
          console.error('Error al cargar postulaciones de actividades:', error);
        });
      }
    });
  }

  // Función para formatear fechas de 'DD/MM/YYYY' a 'DD/MM/YYYY'
  formatDate(date: string): string {
    if (date) {
      // Verificar si la fecha está en formato DD/MM/YYYY
      const partes = date.split('/');
      if (partes.length === 3) {
        const [day, month, year] = partes; // Asignar correctamente para el formato DD/MM/YYYY
        return `${day}/${month}/${year}`; // Devuelve en el mismo formato, si es necesario
      }
      // Si la fecha está en formato YYYY-MM-DD
      const partesAlternativas = date.split('-');
      if (partesAlternativas.length === 3) {
        const [yearAlt, monthAlt, dayAlt] = partesAlternativas;
        return `${dayAlt}/${monthAlt}/${yearAlt}`; // Formatear a DD/MM/YYYY
      }
      console.error('Formato de fecha incorrecto:', date);
      return 'Fecha no disponible';
    }
    return 'Fecha no disponible';
  }
}
