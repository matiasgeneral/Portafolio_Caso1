import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-visualizacion-eventos',
  templateUrl: './visualizacion-eventos.component.html',
  styleUrls: ['./visualizacion-eventos.component.scss'],
})
export class VisualizacionEventosComponent implements OnInit {
  eventos: any[] = []; // Arreglo para almacenar los eventos

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.cargarEventos(); // Cargar eventos al iniciar el componente
  }

  cargarEventos() {
    this.firestoreService.getdocs<any>('actividades').subscribe(eventos => {
      this.eventos = eventos; // Almacenar los eventos obtenidos de Firestore
      console.log('Eventos cargados:', this.eventos); // Verifica la estructura de datos aquí
    });
  }

  formatDate(date: string): string {
    if (date) {
      const [day, month, year] = date.split('/'); // Separa la cadena por "/"
      return `${day}/${month}/${year}`; // Devuelve la fecha en el formato DD/MM/YYYY
    }
    return 'Fecha no disponible'; // Mensaje si la fecha no está definida
  }

  formatTime(time: string): string {
    if (time) {
      return time; // Devuelve la hora en formato HH:MM
    }
    return 'Hora no disponible'; // Mensaje si la hora no está definida
  }
}
