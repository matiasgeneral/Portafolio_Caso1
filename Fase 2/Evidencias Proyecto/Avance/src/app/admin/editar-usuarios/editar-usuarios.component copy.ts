import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from 'src/app/service/firestore.service';

@Component({
  selector: 'app-editar-usuarios',
  templateUrl: './editar-usuarios.component.html',
  styleUrls: ['./editar-usuarios.component.scss'],
})
export class EditarUsuariosComponent implements OnInit {
  rut: string | null = null; // Aquí almacenaremos el RUT del usuario
  usuarioForm: FormGroup; // FormGroup para el formulario
  roles: string[] = ['Administrador', 'Coordinador', 'Secretario', 'Usuario Registrado'];
  estado: string[] = ['Activo', 'Pendiente'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestoreService: FirestoreService,
    private formBuilder: FormBuilder
  ) {
    // Inicializar el FormGroup
    this.usuarioForm = this.formBuilder.group({
      rut: ['', Validators.required],  
      email: ['', Validators.required],     
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      rol: ['', Validators.required],
      estado: ['', Validators.required],
      foto: [''], // Agregamos el control para la foto
      documento: [''],
    });
  }

  ngOnInit() {
    // Obtener el RUT del usuario desde los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      this.rut = params.get('rut'); // Accede al RUT del usuario
      console.log('RUT del usuario:', this.rut);

      // Aquí puedes hacer una llamada al servicio para obtener la información del usuario
      if (this.rut) {
        this.firestoreService.getdocs<any>('Usuario').subscribe(users => {
          // Filtra el usuario basado en el RUT
          const userDetails = users.find(user => user.rut === this.rut);
          if (userDetails) {
            console.log('Detalles del usuario:', userDetails);
            // Cargar los datos en el formulario
            this.usuarioForm.patchValue(userDetails);
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

  // Método para guardar los cambios en el usuario
  onSubmit() {
    if (this.usuarioForm.valid) {
      const updatedUser = { ...this.usuarioForm.value, rut: this.rut }; // Agregar RUT a los datos actualizados
      if (this.rut) {
        this.firestoreService.updateUserDoc(this.rut, updatedUser).then(() => {
          console.log('Usuario actualizado');
        }).catch(error => {
          console.error('Error al actualizar el usuario:', error);
        });
      } else {
        console.error('RUT es nulo o no es un string');
      }
    }
  }

  // Método para manejar la selección de imagen
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.usuarioForm.patchValue({
          foto: e.target.result // Guarda la imagen en el formulario
        });
      };
      reader.readAsDataURL(file);
    }
  }
}
