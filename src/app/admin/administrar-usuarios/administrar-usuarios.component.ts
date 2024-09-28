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
        this.firestoreService.getdocs<any>('Usuario').subscribe(users => {
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
}
