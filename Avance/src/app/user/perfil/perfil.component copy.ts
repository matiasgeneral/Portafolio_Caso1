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
  postulacionesProyectos: any[] = []; // Lista de postulaciones a proyectos del usuario
  usuarioId: string = ''; // Almacena el UID del usuario

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    // Suscribirse al estado de autenticación una vez y almacenar el UID
    this.authService.stateAuth().subscribe(user => {
      if (user) {
        this.usuarioId = user.uid;
        this.cargarPerfilUsuario();
        this.cargarPostulacionesUsuario(); // Cargar postulaciones a espacios públicos
        this.cargarPostulacionesActividades(); // Cargar postulaciones a actividades
        this.cargarPostulacionesProyectos(); // Cargar postulaciones a proyectos
      }
    });
  }

  // Cargar datos del usuario autenticado
  cargarPerfilUsuario() {
    this.firestoreService.getDoc<any>('usuarios', this.usuarioId).subscribe(usuarioData => {
      this.usuario = usuarioData;
      console.log('Datos del usuario:', this.usuario);
    });
  }

  // Cargar postulaciones de espacios públicos del usuario
  cargarPostulacionesUsuario() {
    this.firestoreService.getPostulacionesUsuario(this.usuarioId).subscribe(postulaciones => {
      // Filtrar solo las postulaciones del usuario autenticado
      this.postulacionesEspacios = postulaciones.filter((post: any) => 
        post.fechasReservadas &&
        post.fechasReservadas.some((reserva: any) => reserva.solicitante.uid === this.usuarioId)
      ).map((post: any) => {
        const primeraReserva = post.fechasReservadas.find((reserva: any) => reserva.solicitante.uid === this.usuarioId);
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

  // Cargar postulaciones a actividades del usuario
  cargarPostulacionesActividades() {
    this.firestoreService.getActividades().subscribe(actividades => {
      this.postulacionesActividades = actividades.filter((actividad: any) =>
        Array.isArray(actividad.participantes) && 
        actividad.participantes.some((participante: any) => participante.uid === this.usuarioId)
      ).map((actividad: any) => {
        const participante = actividad.participantes.find((p: any) => p.uid === this.usuarioId);
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

  // Cargar postulaciones a proyectos del usuario
  cargarPostulacionesProyectos() {
    this.firestoreService.getProyectos().subscribe(proyectos => {
      this.postulacionesProyectos = proyectos.filter((proyecto: any) =>
        Array.isArray(proyecto.postulantes) && 
        proyecto.postulantes.some((postulante: any) => postulante.uid === this.usuarioId)
      ).map((proyecto: any) => {
        const postulante = proyecto.postulantes.find((p: any) => p.uid === this.usuarioId);
        return {
          ...proyecto,
          fechaSolicitud: this.formatDate(postulante?.fechaSolicitud), // Formatear fecha de solicitud
          documentosSubidos: postulante?.documentosSubidos // Obtener los documentos subidos
        };
      });
      console.log('Postulaciones a proyectos del usuario autenticado:', this.postulacionesProyectos);
    }, error => {
      console.error('Error al cargar postulaciones de proyectos:', error);
    });
    
  }
  onDownload(url: string) {
    // Seguimiento de la descarga
    console.log(`Descargando desde: ${url}`);
  }
  
    
  
  // Función para formatear fechas de 'DD/MM/YYYY' a 'DD/MM/YYYY'
  formatDate(date: string): string {
    if (date) {
      // Verificar si la fecha está en formato DD/MM/YYYY
      const partes = date.split('/');
      if (partes.length === 3) {
        return date; // Devuelve en el mismo formato
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

