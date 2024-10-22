import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
})
export class CalendarioComponent implements OnInit {
  dias: any[] = []; // Almacena los días del mes
  reservas: any[] = []; // Almacena las reservas desde Firebase
  espaciosPublicos: any[] = []; // Lista de espacios públicos
  espacioSeleccionado: string = ''; // Espacio público seleccionado por el usuario
  diaSeleccionado: string = ''; // Día seleccionado por el usuario
  horaSeleccionada: string = ''; // Hora seleccionada por el usuario

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.cargarEspaciosPublicos(); // Carga los espacios públicos al iniciar el componente
  }

  cargarEspaciosPublicos() {
    // Método para cargar los espacios públicos desde Firebase
    this.firestoreService.getEspaciosPublicos().subscribe(espacios => {
      this.espaciosPublicos = espacios;
    });
  }

  onEspacioSeleccionado() {
    if (this.espacioSeleccionado) {
      this.cargarReservas(this.espacioSeleccionado);
      this.generarDiasDelMes(); // Genera los días del mes una vez que se selecciona un espacio público
    }
  }

  cargarReservas(espacioPublicoId: string) {
    // Carga las reservas correspondientes al espacio público seleccionado
    this.firestoreService.getReservas(espacioPublicoId).subscribe(reservas => {
      this.reservas = reservas;
    });
  }

  isReservado(dia: any, hora: string): boolean {
    // Verifica si el día y la hora están reservados
    return this.reservas.some(reserva => 
      reserva.fecha === dia.fecha && 
      reserva.horaInicio <= hora && 
      reserva.horaFin >= hora
    );
  }

  generarDiasDelMes() {
    this.dias = []; // Limpiamos los días previamente cargados
    const fechaActual = new Date();
    const mes = fechaActual.getMonth();
    const año = fechaActual.getFullYear();

    // Obtiene el número de días en el mes
    const numeroDeDias = new Date(año, mes + 1, 0).getDate();

    // Horas disponibles, desde las 08:00 hasta las 02:00
    const horasDisponibles = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', 
      '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', 
      '00:00', '00:30', '01:00', '01:30'
    ];

    for (let dia = 1; dia <= numeroDeDias; dia++) {
      this.dias.push({
        // Formato DD-MM-YYYY
        fecha: `${dia < 10 ? '0' + dia : dia}-${mes + 1 < 10 ? '0' + (mes + 1) : mes + 1}-${año}`, 
        horas: horasDisponibles // Horas disponibles ajustadas
      });
    }
  }

  seleccionarHorario(dia: string, hora: string) {
    // Almacena el día y la hora seleccionados
    this.diaSeleccionado = dia;
    this.horaSeleccionada = hora;
  }

  confirmarReserva() {
    if (this.diaSeleccionado && this.horaSeleccionada) {
      // Confirmar la reserva con el día y hora seleccionados
      const nuevaReserva = {
        fecha: this.diaSeleccionado,
        horaInicio: this.horaSeleccionada,
        espacioPublicoId: this.espacioSeleccionado // ID del espacio público
        // Puedes agregar otros campos como el ID del usuario que reserva.
      };

      this.firestoreService.addFechaReservada(this.espacioSeleccionado, nuevaReserva).then(() => {
        alert('Reserva confirmada');
        // Restablecer selección después de confirmar
        this.diaSeleccionado = '';
        this.horaSeleccionada = '';
        this.cargarReservas(this.espacioSeleccionado); // Recargar reservas para reflejar la nueva
      }).catch(error => {
        console.error('Error al confirmar la reserva:', error);
        alert('Ocurrió un error al confirmar la reserva. Por favor, inténtalo de nuevo.');
      });
    } else {
      alert('Por favor, selecciona un día y una hora antes de confirmar.');
    }
  }
}
