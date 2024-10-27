import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-buscador-proyectos',
  templateUrl: './buscador-proyectos.component.html',
  styleUrls: ['./buscador-proyectos.component.scss'],
})
export class BuscadorProyectosComponent  implements OnInit {
  selectedDate: string = '';
  proyectos: any[] = [];

  constructor(private firestore: FirestoreService, private router: Router) { }

  ngOnInit() {
    this.firestore.getdocs<any>('proyectos').subscribe((data: any[]) => {
      console.log('Datos recibidos de Firestore:', data);
      this.proyectos = data.map(proyecto => {
        console.log('Noticia:', proyecto);
        return proyecto;
      });
      console.log('Proyectos después de map:', this.proyectos);
    });
  }

  administrarProyecto(proyecto: any) {
    // Aquí puedes redirigir a la ruta correspondiente o abrir un modal
    this.router.navigate(['/administrar-proyectos', { id: proyecto.id }]);
  }

}