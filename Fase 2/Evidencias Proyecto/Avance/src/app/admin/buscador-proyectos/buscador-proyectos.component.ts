import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-buscador-proyectos',
  templateUrl: './buscador-proyectos.component.html',
  styleUrls: ['./buscador-proyectos.component.scss'],
})
export class BuscadorProyectosComponent implements OnInit {
  selectedDate: string = '';
  proyectos: any[] = [];

  constructor(private firestore: FirestoreService, private router: Router) { }

  ngOnInit() {
    this.firestore.getdocs<any>('proyectos').subscribe((data: any[]) => {
      console.log('Datos recibidos de Firestore:', data);
      this.proyectos = data.map(proyecto => {
        // Convertir las fechas de formato 'YYYY-MM-DD' a 'DD/MM/YYYY'
        proyecto.fechaInicio = this.formatDateToDDMMYYYY(proyecto.fechaInicio);
        proyecto.fechaFin = this.formatDateToDDMMYYYY(proyecto.fechaFin);
        proyecto.fechaCreacion = this.formatDateToDDMMYYYY(proyecto.fechaCreacion); // Asegúrate de que la fecha de creación también se convierte
        return proyecto;
      });
      console.log('Proyectos después de map:', this.proyectos);
    });
  }

  administrarProyecto(proyecto: any) {
    this.router.navigate(['/administrar-proyectos', { id: proyecto.id }]);
  }

  // Método para convertir fecha de 'YYYY-MM-DD' a 'DD/MM/YYYY'
  private formatDateToDDMMYYYY(date: string): string {
    const partes = date.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`; // "DD/MM/YYYY"
    }
    return date; // Retornar la fecha original si no se puede convertir
  }
}
