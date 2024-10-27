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
      this.proyectos = proyectos; // Almacenar los proyectos obtenidos de Firestore
      console.log('Proyectos cargados:', this.proyectos); // Verifica la estructura de datos aquí
    });
  }

  formatDate(date: string): string {
    if (date) {
      const [day, month, year] = date.split('/'); // Separa la cadena por "/"
      return `${day}/${month}/${year}`; // Devuelve la fecha en el formato DD/MM/YYYY
    }
    return 'Fecha no disponible'; // Mensaje si la fecha no está definida
  }
}
