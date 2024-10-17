import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../service/authentication.service';
import { FirestoreService } from 'src/app/service/firestore.service';
import { IonicModule } from '@ionic/angular'; // Importa IonicModule


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public loginForm: FormGroup;



  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthenticationService,
    private firestore: FirestoreService
  ) {
    this.loginForm = this.formBuilder.group({
      email: [Validators.required, Validators.email],
      password: [Validators.required, Validators.minLength(8)],
    });
  }

  public async onSubmit(): Promise<void> {
    const result = await this.auth
      .login('ale.villa@duocuc.cl', '123456')
      .catch((err) => console.log(err));

    if (result) {
      console.log(true);
      this.createPersonalData();
    } else {
      console.log(false);
    }
  }
  // Nuevo método para crear datos personales
  createPersonalData( ) {
    const path = 'personalData';
    const data = {
      nombre: 'PERRO',
      apellido: 'perrosky',
      rut: '18148569-1',
      direccion: 'direccion xupalo',
      telefono: '963256987',
      correoElectronico: 'ale.villa@duocuc.cl',
      rol: 'usuario'
    };
    return this.firestore.createDoc(data, path, this.firestore.getId());
  }
}
