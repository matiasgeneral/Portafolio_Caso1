import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-visualizacion-proyectos',
  templateUrl: './visualizacion-proyectos.component.html',
  styleUrls: ['./visualizacion-proyectos.component.scss'],
})
export class VisualizacionProyectosComponent implements OnInit {
  proyectos: any[] = []; // Arreglo para almacenar los proyectos

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.cargarProyectos(); // Cargar proyectos al iniciar el componente
  }

  cargarProyectos() {
    this.firestoreService.getdocs<any>('proyectos').subscribe((proyectos) => {
      // Convertir fechas al formato DD/MM/YYYY antes de asignar
      this.proyectos = proyectos.map(proyecto => ({
        ...proyecto,
        fechaCreacion: this.formatDate(proyecto.fechaCreacion),
        fechaInicio: this.formatDate(proyecto.fechaInicio),
        fechaFin: this.formatDate(proyecto.fechaFin)
      }));
      console.log('Proyectos cargados:', this.proyectos); // Verifica la estructura de datos aquí
    });
  }

  formatDate(date: string): string {
    // Validar si la fecha está en formato YYYY-MM-DD y convertirla
    if (date && date.includes('-')) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`; // Convertir a DD/MM/YYYY
    } else if (date && date.includes('/')) {
      // Si la fecha ya está en formato DD/MM/YYYY, retornarla tal cual
      return date;
    }
    return 'Fecha no disponible'; // Mensaje si la fecha no está definida
  }
}
