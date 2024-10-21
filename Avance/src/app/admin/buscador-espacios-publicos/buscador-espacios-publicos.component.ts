import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';

interface EspacioPublico {
  id?: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  image: string;
  fechaCreacion: string; // Debe ser un string para coincidir con el formato
}

@Component({
  selector: 'app-buscador-espacios-publicos',
  templateUrl: './buscador-espacios-publicos.component.html',
  styleUrls: ['./buscador-espacios-publicos.component.scss'],
})
export class BuscadorEspaciosPublicosComponent implements OnInit {
  selectedDate: string = '';
  espaciosPublicos: EspacioPublico[] = []; // Asegúrate de que el tipo coincida

  constructor(
    private firestore: FirestoreService, 
    private router: Router
  ) { }

  ngOnInit() {
    this.firestore.getdocs<EspacioPublico>('espaciosPublicos').subscribe((data: EspacioPublico[]) => {
      console.log('Datos recibidos de Firestore:', data);
      this.espaciosPublicos = data.map(espacioPublico => {
        console.log('espacioPublico:', espacioPublico);
        espacioPublico.fechaCreacion = this.formatDate(espacioPublico.fechaCreacion); // Formatear la fecha
        return espacioPublico;
      });
      console.log('espacios Publicos después de map:', this.espaciosPublicos);
    });
  }

  administrarEspacioPublicos(espacioPublico: EspacioPublico) {
    // Aquí puedes redirigir a la ruta correspondiente o abrir un modal
    this.router.navigate(['/administrar-espacios-publicos', { id: espacioPublico.id }]);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) {
      return 'Fecha no disponible'; // Manejo de fecha no disponible
    }
    
    // Asumir que dateString está en formato 'DD/MM/YYYY'
    const parts = dateString.split('/');
    return `${parts[0]}/${parts[1]}/${parts[2]}`; // Retorna en formato 'DD/MM/YYYY'
  }
}
