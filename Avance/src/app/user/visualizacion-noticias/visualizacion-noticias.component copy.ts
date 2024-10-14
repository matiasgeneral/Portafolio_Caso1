import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-visualizacion-noticias',
  templateUrl: './visualizacion-noticias.component.html',
  styleUrls: ['./visualizacion-noticias.component.scss'],
})
export class VisualizacionNoticiasComponent implements OnInit {
  noticia: any;

  constructor(
    private route: ActivatedRoute,
    private firestore: FirestoreService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.firestore.getDoc<any>('noticias', id).subscribe((data) => {
        this.noticia = data;
        console.log('Noticia obtenida:', this.noticia);
      });
    }
  }
}
