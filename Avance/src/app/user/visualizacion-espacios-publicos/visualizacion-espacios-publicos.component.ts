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
    // Actualizado para obtener datos de 'espaciosPublicos'
    this.firestoreService.getdocs<any>('espaciosPublicos').subscribe(espaciosPublicos => {
      this.espaciosPublicos = espaciosPublicos; // Almacenar los espacios públicos obtenidos de Firestore
      console.log('Espacios Públicos cargados:', this.espaciosPublicos); // Verifica la estructura de datos aquí
    });
  }

 
}
