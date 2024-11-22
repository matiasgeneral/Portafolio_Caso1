import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buscador-usuarios',
  templateUrl: './buscador-usuarios.component.html',
  styleUrls: ['./buscador-usuarios.component.scss'],
})
export class BuscadorUsuariosComponent implements OnInit {
  users: any[] = [];  // Lista de usuarios

  constructor(private firestoreService: FirestoreService, private router: Router) {}

  ngOnInit() {
    // Obtener todos los usuarios de la colección 'Usuario'
    this.firestoreService.getdocs<any>('usuarios').subscribe((data: any[]) => {
      this.users = data;  // Guardar los usuarios en la variable 'users'
    });
  }

// Método para ver los detalles de un usuario
verDetalles(usuarios: any) {
  console.log('Detalles del usuario:', usuarios);
  // Asegúrate de que `usuario.rut` existe antes de navegar
  if (usuarios.rut) {
    this.router.navigate(['/administrar-usuarios', usuarios.rut]); // Redirige a la pantalla de detalles del usuario, pasando su RUT
  } else {
    console.error('RUT de usuario no definido');
  }
  }
  verPostulaciones(usuario: any) {
    console.log('Detalles del usuario:', usuario);
    // Asegúrate de que `usuario.rut` existe antes de navegar
    if (usuario && usuario.uid) {
        // Redirige a la pantalla de detalles del usuario, pasando su RUT
        this.router.navigate(['/postulaciones', usuario.uid]); 
    } else {
        console.error('RUT de usuario no definido o usuario inválido');
    }
}

}






