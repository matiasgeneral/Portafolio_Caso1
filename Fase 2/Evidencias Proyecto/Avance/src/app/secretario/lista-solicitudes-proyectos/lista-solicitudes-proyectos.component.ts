import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-solicitudes-proyectos',
  templateUrl: './lista-solicitudes-proyectos.component.html',
  styleUrls: ['./lista-solicitudes-proyectos.component.scss'],
})
export class ListaSolicitudesProyectosComponent implements OnInit {
  proyectos: any[] = [];

  constructor(private firestoreService: FirestoreService, private router: Router) {}

  ngOnInit() {
    this.cargarProyectos();
  }

  cargarProyectos() {
    this.firestoreService.getdocs<any>('proyectos').subscribe((proyectos) => {
      this.proyectos = proyectos.map(proyecto => ({
        ...proyecto,
        fechaCreacion: this.formatDate(proyecto.fechaCreacion),
        fechaInicio: this.formatDate(proyecto.fechaInicio),
        fechaFin: this.formatDate(proyecto.fechaFin),
        cantidadParticipantes: proyecto.postulantes ? proyecto.postulantes.length : 0
      }));
    });
  }

  formatDate(date: string): string {
    if (date && date.includes('-')) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    } else if (date && date.includes('/')) {
      return date;
    }
    return 'Fecha no disponible';
  }

  verParticipantes(proyectoId: string) {
    this.router.navigate(['/ver-participantes', proyectoId]);
  }
}
