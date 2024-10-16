import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-noticia',
  templateUrl: './noticia.component.html',
  styleUrls: ['./noticia.component.scss'],
})
export class NoticiaComponent implements OnInit {
  noticia: any; // Objeto para almacenar la noticia seleccionada

  constructor(
    private router: Router,
    private firestoreService: FirestoreService,
    private route: ActivatedRoute // Para obtener el ID de la noticia
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id'); // Obtiene el ID de la noticia de la ruta
    if (id) {
      this.firestoreService.getDoc<any>('noticias', id).subscribe(noticia => {
        this.noticia = noticia;
        console.log('Noticia cargada:', this.noticia); // Verifica la estructura de datos aquí
      });
    }
  }

  formatDate(date: string): string {
    if (date) {
      const [day, month, year] = date.split('/'); // Separa la cadena por "/"
      return `${day}/${month}/${year}`; // Devuelve la fecha en el formato DD/MM/YYYY
    }
    return 'Fecha no disponible'; // Mensaje si la fecha no está definida
  }
  // Método para regresar a la lista de noticias
  goBack() {
    this.router.navigate(['/visualizacion-noticias']); // Asegúrate de que esta ruta sea correcta
  }
}
