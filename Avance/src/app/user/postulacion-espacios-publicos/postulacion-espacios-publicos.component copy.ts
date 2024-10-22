import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AuthenticationService } from 'src/app/service/authentication.service'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-postulacion-espacios-publicos',
  templateUrl: './postulacion-espacios-publicos.component.html',
  styleUrls: ['./postulacion-espacios-publicos.component.scss'],
})
export class PostulacionEspaciosPublicosComponent implements OnInit {
  espacioPublico: any;
  nombreSolicitante: string = '';
  postulacionForm: FormGroup; 
  horasDisponibles: string[] = [];
  minutosDisponibles: string[] = ['00', '30'];

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private authService: AuthenticationService,
    private fb: FormBuilder 
  ) {
    this.postulacionForm = this.fb.group({
      fechaUso: ['', [Validators.required, this.validarFechaNoPasada]],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
    });
  }

  ngOnInit() {
    const espacioId = this.route.snapshot.paramMap.get('id');
    if (espacioId) {
      this.cargarEspacioPublico(espacioId);
    } else {
      console.error('No se encontró el ID del espacio público.');
    }
    this.obtenerNombreSolicitante(); 
    this.generarHorasDisponibles();
  }

  cargarEspacioPublico(id: string) {
    this.firestoreService.getDoc<any>('espaciosPublicos', id).subscribe(espacio => {
      this.espacioPublico = espacio; 
      if (!this.espacioPublico) {
        console.error('No se encontró el espacio público con ID:', id);
      }
    }, error => {
      console.error('Error al cargar el espacio público:', error);
    });
  }

  obtenerNombreSolicitante() {
    this.authService.stateAuth().subscribe(user => {
      if (user) {
        this.firestoreService.getDoc<any>('usuarios', user.uid).subscribe(userData => {
          if (userData) {
            this.nombreSolicitante = `${userData.nombre} ${userData.apellidoPaterno} ${userData.apellidoMaterno}`;
          }
        });
      }
    });
  }

  postular() {
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

        // Asegúrate de que la función `addFechaReservada` esté correctamente implementada en tu FirestoreService
        this.firestoreService.addFechaReservada(this.espacioPublico.id, fechaReservada)
          .then(() => {
            console.log('Postulación enviada exitosamente');
            // Limpiar el formulario
            this.postulacionForm.reset();
          })
          .catch(error => console.error('Error al enviar la postulación:', error));
      } else {
        console.error('No se encontró el usuario autenticado.');
      }
    });
  }

  obtenerFechaActual(): string {
    const fecha = new Date();
    const opciones = { year: 'numeric' as const, month: '2-digit' as const, day: '2-digit' as const, timeZone: 'UTC' };
    const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
    return fechaFormateada.split('/').reverse().join('-'); // Cambia de DD/MM/YYYY a YYYY-MM-DD
  }

  validarFechaNoPasada(control: any) {
    const fechaSeleccionada = new Date(control.value);
    const fechaActual = new Date();
    return fechaSeleccionada >= fechaActual ? null : { fechaPasada: true };
  }

  generarHorasDisponibles() {
    for (let i = 8; i <= 20; i++) { // Genera horas desde 08:00 hasta 20:00
      this.horasDisponibles.push(`${i < 10 ? '0' + i : i}:00`);
      this.horasDisponibles.push(`${i < 10 ? '0' + i : i}:30`);
    }
  }
}
