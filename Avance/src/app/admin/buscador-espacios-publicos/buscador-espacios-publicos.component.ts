import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-buscador-espacios-publicos',
  templateUrl: './buscador-espacios-publicos.component.html',
  styleUrls: ['./buscador-espacios-publicos.component.scss'],
})
export class BuscadorEspaciosPublicosComponent  implements OnInit {
  selectedDate: string = '';
  espacioPublicos: any[] = [];
  constructor(
    private firestore: FirestoreService, 
    private router: Router
  ) { }

  
    ngOnInit() {
      this.firestore.getdocs<any>('espacioPublico').subscribe((data: any[]) => {
        console.log('Datos recibidos de Firestore:', data);
        this.espacioPublicos = data.map(espacioPublico => {
          console.log('espacioPublico:', espacioPublico);
          return espacioPublico;
        });
        console.log('espacios Publicos después de map:', this.espacioPublicos);
      });
    }
  
    administrarEspacioPublicos(espacioPublico: any) {
      // Aquí puedes redirigir a la ruta correspondiente o abrir un modal
      this.router.navigate(['/administrar-espacios-publicos', { id: espacioPublico.id }]);
    }

  
  }
  