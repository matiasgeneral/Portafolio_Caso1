import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-lista-registros-usuarios',
  templateUrl: './lista-registros-usuarios.component.html',
  styleUrls: ['./lista-registros-usuarios.component.scss'],
})
export class ListaRegistrosUsuariosComponent implements OnInit {
  users: any[] = [];  // Lista de usuarios
  loading: boolean = true; // Indicador de carga

  constructor(private firestoreService: FirestoreService, private router: Router, private alertController: AlertController) {}

  ngOnInit() {
    // Obtener solo los usuarios con estado 'pendiente' de la colección 'Usuario'
    this.firestoreService.getDocsWithCondition<any>('Usuario', 'estado', '==', 'Pendiente')
      .subscribe(
        (data: any[]) => {
          this.users = data;  // Guardar los usuarios en la variable 'users'
          this.loading = false; // Desactiva el indicador de carga
        },
        error => {
          console.error('Error al obtener usuarios:', error);
          this.loading = false; // Desactiva el indicador de carga
          this.showErrorAlert(); // Mostrar alerta de error
        }
      );
  }

// Método para ver los detalles de un usuario
verDetalles(usuario: any) {
  console.log('Detalles del usuario:', usuario);
  // Asegúrate de que `usuario.rut` existe antes de navegar
  if (usuario.rut) {
    this.router.navigate(['/gestion-nuevos-usuarios', usuario.rut]); // Redirige a la pantalla de detalles del usuario, pasando su RUT
  } else {
    console.error('RUT de usuario no definido');
  }
  }

  // Método para mostrar una alerta de error
  async showErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'No se pudieron cargar los usuarios. Intenta nuevamente más tarde.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}
