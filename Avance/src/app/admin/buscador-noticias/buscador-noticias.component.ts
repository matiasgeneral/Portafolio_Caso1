
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-buscador-noticias',
  templateUrl: './buscador-noticias.component.html',
  styleUrls: ['./buscador-noticias.component.scss'],
})
export class BuscadorNoticiasComponent implements OnInit {
  selectedDate: string = '';  // Define la propiedad para almacenar la fecha seleccionada
  noticias: any[] = [];  // Aquí almacenaremos las noticias

  constructor(private firestore: FirestoreService, private router: Router) {}

  ngOnInit() {
    // Obtener todos los usuarios de la colección 'Usuario'
    this.firestore.getdocs<any>('noticias').subscribe((data: any[]) => {
      this.noticias = data;  // Guardar las noticias en la variable 'noticias'
    });
  }

}






