import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InteractionService } from '../../service/interaction.service';
import { AuthenticationService } from '../../service/authentication.service'; 
import { FirestoreService } from '../../service/firestore.service'; 

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  signup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private interaction: InteractionService,
    private auth: AuthenticationService,
    private database: FirestoreService
  ) {
    this.signup = this.fb.group({
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      rut: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]], // Validar que tenga 9 dígitos
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', Validators.required],
      fotoCarnetUrl: [''],
      documentoResidenciaUrl: ['']
    });
  }

  async onSubmit() {
    if (this.signup.valid) {
      const { nombre, apellidoPaterno, apellidoMaterno, rut, direccion, telefono, email, password, password2, fotoCarnetUrl, documentoResidenciaUrl } = this.signup.value;

      if (this.passwordsDontMatch()) {
        this.interaction.presentToast('Las contraseñas no coinciden');
        return;
      }

      this.interaction.openLoading('Registrando usuario...');

      try {
        const path = 'Usuario';
        
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
          foto: fotoCarnetUrl,
          documento: documentoResidenciaUrl,
          rol: 'Usuario Registrado',
          estado: 'Pendiente' // Agregar estado pendiente para que el administrador lo apruebe
        };

        await this.database.createDoc(data, path, uid);
        this.interaction.presentToast('Usuario creado con éxito');
        this.router.navigate(['/home']);

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

  // Método para verificar si las contraseñas coinciden
  passwordsDontMatch(): boolean {
    return this.signup.get('password')?.value !== this.signup.get('password2')?.value;
  }

  // Método para manejar el cambio de archivos
  onFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    if (file) {
      // Aquí puedes implementar la lógica para subir el archivo a Firebase Storage y obtener la URL
      const reader = new FileReader();
      reader.onload = () => {
        // Por ejemplo, puedes establecer la URL del archivo en el control correspondiente
        this.signup.patchValue({
          [controlName]: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  }
}
