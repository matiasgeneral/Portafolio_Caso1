import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-buscador-noticias',
  templateUrl: './buscador-noticias.component.html',
  styleUrls: ['./buscador-noticias.component.scss'],
})
export class BuscadorNoticiasComponent implements OnInit {
  selectedDate: string = '';
  noticias: any[] = [];

  constructor(private firestore: FirestoreService, private router: Router) {}

  ngOnInit() {
    this.firestore.getdocs<any>('noticias').subscribe((data: any[]) => {
      console.log('Datos recibidos de Firestore:', data);
      this.noticias = data.map(noticia => {
        console.log('Noticia:', noticia);
        return noticia;
      });
      console.log('Noticias después de map:', this.noticias);
    });
  }

  administrarNoticia(noticia: any) {
    // Aquí puedes redirigir a la ruta correspondiente o abrir un modal
    this.router.navigate(['/administrar-noticias', { id: noticia.id }]);
  }

  verNoticia(noticia: any) {
    // Aquí puedes redirigir a la ruta correspondiente o abrir un modal
    this.router.navigate(['/visualizacion-noticias', { id: noticia.id }]);
  }
}
