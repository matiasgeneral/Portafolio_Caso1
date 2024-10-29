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
      rut: ['', [Validators.required, this.rutValidator]], // Validar RUT
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

      // Validar archivos antes de continuar con el registro
      if (!this.filesAreValid(fotoCarnetUrl, documentoResidenciaUrl)) {
        this.interaction.presentToast('Los archivos no cumplen con los requisitos. Asegúrate de que sean de los tipos y tamaños permitidos.');
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

  // Método para validar la subida de archivos
  filesAreValid(fotoCarnetUrl: string, documentoResidenciaUrl: string): boolean {
    const validDocumentTypes = ['application/pdf', 'image/png', 'image/jpeg']; // Tipos de archivo válidos
    const isFotoCarnetValid = typeof fotoCarnetUrl === 'string' && validDocumentTypes.includes(fotoCarnetUrl.split(';')[0]);
    const isDocumentoResidenciaValid = typeof documentoResidenciaUrl === 'string' && validDocumentTypes.includes(documentoResidenciaUrl.split(';')[0]);
    return isFotoCarnetValid && isDocumentoResidenciaValid;
  }

  // Método para verificar si las contraseñas coinciden
  passwordsDontMatch(): boolean {
    return this.signup.get('password')?.value !== this.signup.get('password2')?.value;
  }

  // Método para manejar el cambio de archivos
  onFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    if (file) {
      // Definir tipos de archivo válidos exclusivamente para PDF, PNG y JPG
      const validDocumentTypes = ['application/pdf', 'image/png', 'image/jpeg']; // Solo PDF, PNG y JPG

      const isValidType = validDocumentTypes.includes(file.type);

      // Verificar tipo de archivo
      if (!isValidType) {
        this.interaction.presentToast('El archivo debe ser PDF, PNG o JPG');
        return;
      }

      // Verificar tamaño del archivo (5 MB para foto y 6 MB para documento)
      if (controlName === 'fotoCarnetUrl' && file.size > 5242880) { // 5 MB en bytes
        this.interaction.presentToast('La foto no debe superar los 5 MB');
        return;
      }

      if (controlName === 'documentoResidenciaUrl' && file.size > 6291456) { // 6 MB en bytes
        this.interaction.presentToast('El documento no debe superar los 6 MB');
        return;
      }

      // Lógica para leer y cargar el archivo
      const reader = new FileReader();
      reader.onload = () => {
        // Establecer la URL del archivo en el control correspondiente
        this.signup.patchValue({
          [controlName]: reader.result
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
