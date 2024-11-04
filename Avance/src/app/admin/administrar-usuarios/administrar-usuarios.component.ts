import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-administrar-usuarios',
  templateUrl: './administrar-usuarios.component.html',
  styleUrls: ['./administrar-usuarios.component.scss'],
})
export class AdministrarUsuariosComponent implements OnInit {
  rut: string | null = null; // Aquí almacenaremos el RUT del usuario
  userDetails: any; // Variable para almacenar los detalles del usuario

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit() {
    // Obtener el RUT del usuario desde los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      this.rut = params.get('rut'); // Accede al RUT del usuario
      console.log('RUT del usuario:', this.rut);

      // Aquí puedes hacer una llamada al servicio para obtener la información del usuario
      if (this.rut) {
        this.firestoreService.getdocs<any>('usuarios').subscribe(users => {
          // Filtra el usuario basado en el RUT
          this.userDetails = users.find(user => user.rut === this.rut);
          if (this.userDetails) {
            console.log('Detalles del usuario:', this.userDetails);
          } else {
            console.error('Usuario no encontrado');
          }
        }, error => {
          console.error('Error al obtener los usuarios:', error);
        });
      }
    });
  }

  // Método para regresar a la lista de usuarios
  goBack() {
    this.router.navigate(['/buscador-usuarios']); // Asegúrate de que esta ruta sea correcta
  }
  
  // Método para borrar el usuario, restringido a Administradores activos
  deleteUser2() {
    if (
      this.userDetails &&
      this.userDetails.rol === 'Administrador' &&
      this.userDetails.estado === 'Activo' &&
      this.rut
    ) {
      this.firestoreService.deleteDoc('Usuario', this.rut).then(() => {
        console.log('Usuario Borrado');
        this.goBack(); // Regresa a la lista de usuarios después de borrar
      }).catch(error => {
        console.error('Error al borrar la noticia:', error);
      });
    } else {
      console.warn('Acceso denegado. Solo los administradores activos pueden eliminar usuarios.');
    }
  }

  // Método para ver los detalles de un usuario y luego editar
  verDetalles(usuarios: any) {
    console.log('Detalles del usuario:', usuarios);
    // Asegúrate de que `usuario.rut` existe antes de navegar
    if (usuarios.rut) {
      this.router.navigate(['/editar-usuarios', usuarios.rut]); // Redirige a la pantalla de detalles del usuario, pasando su RUT
    } else {
      console.error('RUT de usuario no definido');
    }
  }
}
