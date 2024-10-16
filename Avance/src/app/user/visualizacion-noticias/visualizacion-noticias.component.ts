import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-visualizacion-noticias',
  templateUrl: './visualizacion-noticias.component.html',
  styleUrls: ['./visualizacion-noticias.component.scss'],
})
export class VisualizacionNoticiasComponent implements OnInit {
  noticias: any[] = []; // Arreglo para almacenar las noticias

  constructor(
    private firestoreService: FirestoreService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarNoticias();
  }

  cargarNoticias() {
    this.firestoreService.getdocs<any>('noticias').subscribe(noticias => {
      this.noticias = noticias;
      console.log('Noticias cargadas:', this.noticias);
    }, error => {
      console.error('Error al cargar noticias:', error);
    });
  }

  formatDate(date: string): string {
    if (date) {
      const [day, month, year] = date.split('/');
      return `${day}/${month}/${year}`;
    }
    return 'Fecha no disponible';
  }

  truncateDetails(details: string, wordLimit: number = 15): string {
    const words = details.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return details;
  }

  verDetalles(noticiaId: string) {
    console.log('Noticia completa:', noticiaId);
    if (noticiaId) {
      this.router.navigate(['/noticia', noticiaId]);
    } else {
      console.error('Noticia no encontrada');
    }
  }
}
