import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-visualizacion-noticias',
  templateUrl: './visualizacion-noticias.component.html',
  styleUrls: ['./visualizacion-noticias.component.scss'],
})
export class VisualizacionNoticiasComponent implements OnInit {
  noticias: any[] = []; // Arreglo para almacenar las noticias

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.cargarNoticias();
  }

  cargarNoticias() {
    this.firestoreService.getdocs<any>('noticias').subscribe(noticias => {
      this.noticias = noticias;
      console.log('Noticias cargadas:', this.noticias); // Verifica la estructura de datos aquí
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
