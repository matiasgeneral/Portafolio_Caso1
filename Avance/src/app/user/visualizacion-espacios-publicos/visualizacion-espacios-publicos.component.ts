import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-visualizacion-espacios-publicos',
  templateUrl: './visualizacion-espacios-publicos.component.html',
  styleUrls: ['./visualizacion-espacios-publicos.component.scss'],
})
export class VisualizacionEspaciosPublicosComponent implements OnInit {
  espaciosPublicos: any[] = []; // Arreglo para almacenar los espacios públicos
  
  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.cargarEspaciosPublicos(); // Cargar espacios públicos al iniciar el componente
  }

  cargarEspaciosPublicos() {
    this.firestoreService.getdocs<any>('espacioPublico').subscribe(espaciosPublicos => {
      this.espaciosPublicos = espaciosPublicos; // Almacenar los espacios públicos obtenidos de Firestore
      console.log('Espacios Públicos cargados:', this.espaciosPublicos); // Verifica la estructura de datos aquí
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
