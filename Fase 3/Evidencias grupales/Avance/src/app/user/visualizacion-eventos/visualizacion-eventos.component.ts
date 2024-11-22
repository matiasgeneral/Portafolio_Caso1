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
      this.eventos = eventos.map(evento => {
        return {
          ...evento,
          fechaEvento: evento.fechaEvento || 'Fecha no disponible', // Verificar que tenga valor
          horaEvento: evento.horaEvento || 'Hora no disponible'
        };
      });
      console.log('Eventos cargados:', this.eventos); // Verifica la estructura de datos aquí
    });
  }

  formatTime(time: string): string {
    return time || 'Hora no disponible';
  }
}
