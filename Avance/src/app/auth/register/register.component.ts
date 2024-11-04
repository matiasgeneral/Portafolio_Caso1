import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InteractionService } from '../../service/interaction.service';
import { AuthenticationService } from '../../service/authentication.service';
import { FirestoreService } from '../../service/firestore.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  signup: FormGroup; // FormGroup para el formulario de registro
  rut: string | null = null; // Para almacenar el RUT del usuario

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private interaction: InteractionService,
    private auth: AuthenticationService,
    private database: FirestoreService,
    private alertController: AlertController // Inyectar AlertController
  ) {
    this.signup = this.fb.group({
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      rut: ['', [Validators.required, this.rutValidator]],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', Validators.required],
      foto: [''], // Campo para la foto
      documento: [''] // Campo para el documento
    });
  }

  async onSubmit() {
    if (this.signup.valid) {
      const { nombre, apellidoPaterno, apellidoMaterno, rut, direccion, telefono, email, password } = this.signup.value;

      if (this.passwordsDontMatch()) {
        this.interaction.presentToast('Las contraseñas no coinciden');
        return;
      }

      this.interaction.openLoading('Registrando usuario...');

      try {
        const path = 'usuarios';

        // Verificar si el RUT ya está registrado
        const rutExists = await this.database.checkRUTExists(rut, path);
        if (rutExists) {
          this.interaction.closeLoading();
          this.interaction.presentToast('El RUT ya se encuentra registrado en el sistema');
          return;
        }

        // Proceder con el registro si el RUT no está registrado
        const result = await this.auth.signup(email, password);
        const uid = result.user ? result.user.uid : null;
        if (!uid) {
          throw new Error('No se pudo obtener el UID del usuario');
        }

        const data = {
          nombre,
          apellidoPaterno,
          apellidoMaterno,
          rut,
          direccion,
          telefono,
          email,
          uid,
          foto: this.signup.value.foto,
          documento: this.signup.value.documento,
          rol: 'Usuario Registrado',
          estado: 'Pendiente'
        };

        await this.database.createDoc(data, path, uid);
        this.interaction.presentToast('Usuario creado con éxito');

        // Mostrar alerta de éxito
        await this.showSuccessAlert();
        
        // Redirigir y refrescar la página
        this.router.navigate(['/home']).then(() => {
          window.location.reload(); // Refresca la página
        });

      } catch (err) {
        console.error('Error durante el registro:', err);
        if ((err as any).code === 'auth/email-already-in-use') {
          this.interaction.presentToast('El correo electrónico ya está en uso, por favor use otro.');
        } else {
          this.interaction.presentToast('Error al crear usuario');
        }
      } finally {
        this.interaction.closeLoading();
      }
    } else {
      this.interaction.presentToast('Complete los campos correctamente');
    }
  }

  // Método para mostrar la alerta de éxito
  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El usuario ha sido registrado correctamente.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Método para verificar si las contraseñas coinciden
  passwordsDontMatch(): boolean {
    return this.signup.get('password')?.value !== this.signup.get('password2')?.value;
  }

  // Método para manejar la selección de la imagen de la foto
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.signup.patchValue({
          foto: e.target.result // Guarda la imagen en el formulario
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Método para manejar la selección de la imagen del documento
  onDocumentSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.signup.patchValue({
          documento: e.target.result // Guarda la imagen en el formulario
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Método para validar el RUT
  rutValidator(control: any) {
    const rut = control.value;
    if (!rut) return null; // Si no hay valor, no hay error
    // Lógica para validar el RUT chileno
    const rutSinPuntos = rut.replace(/\./g, '').replace('-', '');
    const cuerpo = rutSinPuntos.slice(0, -1);
    const dv = rutSinPuntos.slice(-1).toUpperCase();

    const suma = [...cuerpo].reverse().reduce((acc, curr, index) => {
      return acc + (parseInt(curr) * (index % 6 + 2));
    }, 0);

    const calculatedDv = 11 - (suma % 11);
    const dvCalculado = calculatedDv === 10 ? 'K' : calculatedDv === 11 ? '0' : calculatedDv.toString();

    return dv === dvCalculado ? null : { invalidRut: true }; // Devuelve un error si el RUT es inválido
  }
}
