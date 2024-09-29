import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-visualizacion-noticias',
  templateUrl: './visualizacion-noticias.component.html',
  styleUrls: ['./visualizacion-noticias.component.scss'],
})
export class VisualizacionNoticiasComponent implements OnInit {
  selectedDate: string = '';
  noticias: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private firestore: FirestoreService
  ) { }

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
}





