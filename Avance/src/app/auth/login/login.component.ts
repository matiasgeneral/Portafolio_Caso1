import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../service/authentication.service';
import { FirestoreService } from 'src/app/service/firestore.service';
import { FcmService } from '../../service/Fcm.Service'; // Importa FcmService
import { ToastController } from '@ionic/angular'; // Importa ToastController

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public loginForm: FormGroup;
  email: string = '';    // Declaración de la variable 'email'
  password: string = ''; // Declaración de la variable 'password'

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthenticationService,
    private firestore: FirestoreService,
    private fcmService: FcmService, // Inyecta FcmService
    private toastController: ToastController // Inyecta ToastController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  public async onSubmit(): Promise<void> {
    try {
      const result = await this.auth.login(this.email, this.password);

      if (result) {
        const user = await this.auth.getCurrentUser(); // Obtiene el usuario actual logueado

        if (user) {
          const uid = user.uid; // Obtén el UID del usuario
          // Solicita permisos para notificaciones y guarda el token
          await this.fcmService.requestPermission();
        }

        await this.presentToast('Inicio de sesión exitoso', 'success');
        // Forzar la recarga de la página para actualizar el menú y la interfaz
        window.location.reload();
      } else {
        await this.presentToast('Inicio de sesión fallido', 'danger');
      }
    } catch (err) {
      console.log(err);
      await this.presentToast('Error al iniciar sesión', 'danger');
    }
  }

  private async presentToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000, // Duración en milisegundos
      color: color,   // Color del toast (puede ser 'success' o 'danger')
      position: 'top' // Posición del toast en la pantalla
    });
    await toast.present();
  }

  // Método para crear datos personales (descomentado si es necesario)
  createPersonalData() {
    const path = 'personalData';
    const data = {
      nombre: 'alejandro',
      apellido: 'villa',
      rut: '18148569-1',
      direccion: 'direccion falsa 123',
      telefono: '963256987',
      correoElectronico: 'ale.villa@duocuc.cl',
      rol: 'admin'
    };
    return this.firestore.createDoc(data, path, this.firestore.getId());
  }
}
