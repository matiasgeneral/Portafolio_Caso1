// src/app/auth/register/register.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../service/authentication.service'; // Ajusta la ruta si es necesario
import { FirestoreService } from '../../service/firestore.service'; // Ajusta la ruta si es necesario
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthenticationService,
    private firestore: FirestoreService,
    private toastController: ToastController
  ) {
    this.registerForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      rut: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('[0-9]{9}')]], // Ajusta según el formato necesario
      correoElectronico: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit() {}

  passwordsDontMatch(): boolean {
    return this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value;
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid || this.passwordsDontMatch()) {
      this.presentToast('Por favor completa el formulario correctamente', 'danger');
      return;
    }

    const { nombre, apellido, rut, direccion, telefono, correoElectronico, password } = this.registerForm.value;
    const data = {
      nombre,
      apellido,
      rut,
      direccion,
      telefono,
      correoElectronico,
    };

    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await this.auth.signup(correoElectronico, password);
      
      // Asegurarse de que userCredential y uid son válidos
      if (!userCredential || !userCredential.user) {
        await this.presentToast('Error al crear el usuario', 'danger');
        return; // Salir si no hay credenciales válidas
      }

      const uid = userCredential.user.uid; // Obtener el ID del usuario

      // Guardar los datos en Firestore
      const path = 'usuarios'; // Ajusta la ruta según tu estructura en Firestore
      await this.firestore.createDoc(data, path, uid); // Usar el UID como ID
      await this.presentToast('Registro exitoso', 'success');
    } catch (error) {
      console.error('Error en el registro: ', error);
      await this.presentToast('Error en el registro', 'danger');
    }
  }
  onFileChange(event: Event, type: string) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      // Maneja el archivo según el tipo
      if (type === 'photoCarnet') {
        // Lógica para manejar la foto del carnet
      } else if (type === 'documentoResidencia') {
        // Lógica para manejar el documento de residencia
      }
    }
  }
  
}
