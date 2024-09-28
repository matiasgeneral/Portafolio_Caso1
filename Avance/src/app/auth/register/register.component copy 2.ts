import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../service/authentication.service';
import { FirestoreService } from 'src/app/service/firestore.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { InteractionService } from 'src/app/service/interaction.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  public signup: FormGroup;

  constructor(
    private database: FirestoreService,
    private fb: FormBuilder,
    private auth: AuthenticationService,
    private interaction: InteractionService,
    private router: Router
  ) {
    this.signup = this.fb.group({
      nombre: [null, Validators.required],
      apellido: [null, Validators.required],
      rut: [null, Validators.required],
      direccion: [null, Validators.required],
      telefono: [null, Validators.required],
      email: [null, Validators.required],
      password: [null, [Validators.required]],
      password2: [null, [Validators.required]],
      fotoCarnetUrl: [null],
      documentoResidenciaUrl: [null]
    });
  }

  ngOnInit(): void {}

  onFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.signup.patchValue({
          [controlName]: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  passwordsDontMatch(): boolean {
    const password = this.signup.get('password')?.value;
    const password2 = this.signup.get('password2')?.value;
    return password !== password2; // Retorna true si las contraseñas no coinciden
  }

  async onSubmit() {
    if (this.signup.valid) {
      const { nombre, apellido, rut, direccion, telefono, email, password, password2, fotoCarnetUrl, documentoResidenciaUrl } = this.signup.value;
  
      if (password.length >= 8) {
        if (password === password2) {
          this.interaction.openLoading('Registrando usuario...');
          try {
            const result = await this.auth.signup(email, password);
            this.interaction.closeLoading();
  
            if (result && result.user) {
              const path = 'Usuario';
              const data = {
                nombre: nombre,
                apellido: apellido,
                rut: rut,
                direccion: direccion,
                telefono: telefono,
                email: email,
                uid: result.user.uid,
                foto: fotoCarnetUrl,
                documento: documentoResidenciaUrl,
                tipo: 'usuario'
              };
  
              await this.database.createDoc(data, path, result.user.uid);
              this.interaction.presentToast('Usuario creado');
              this.router.navigate(['/login']);
            } else {
              this.interaction.presentToast('Error al registrar usuario, intente nuevamente');
            }
          } catch (err) {
            this.interaction.closeLoading();
            this.interaction.presentToast('Error al crear usuario');
            console.error(err);
          }
        } else {
          this.interaction.presentToast('Las contraseñas no coinciden');
        }
      } else {
        this.interaction.presentToast('La contraseña debe tener al menos 8 caracteres');
      }
    } else {
      this.interaction.presentToast('Complete los campos');
    }
  }
}
