import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-buscador-actividades',
  templateUrl: './buscador-actividades.component.html',
  styleUrls: ['./buscador-actividades.component.scss'],
})
export class BuscadorActividadesComponent  implements OnInit {
  selectedDate: string = '';
  actividades: any[] = [];
  constructor(
    private firestore: FirestoreService, 
    private router: Router
  ) { }

  
    ngOnInit() {
      this.firestore.getdocs<any>('actividades').subscribe((data: any[]) => {
        console.log('Datos recibidos de Firestore:', data);
        this.actividades = data.map(actividad => {
          console.log('Activdades:', actividad);
          return actividad;
        });
        console.log('actividades después de map:', this.actividades);
      });
    }
  
    administrarActividades(actividad: any) {
      // Aquí puedes redirigir a la ruta correspondiente o abrir un modal
      this.router.navigate(['/administrar-actividades', { id: actividad.id }]);
    }

  
  }
  