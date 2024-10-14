import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from 'src/app/service/firestore.service';
import { InteractionService } from 'src/app/service/interaction.service';

@Component({
  selector: 'app-editar-usuarios',
  templateUrl: './editar-usuarios.component.html',
  styleUrls: ['./editar-usuarios.component.scss'],
})
export class EditarUsuariosComponent implements OnInit {
  editarUsuarioForm: FormGroup;
  rut: string | null = null;
  userDetails: any;
  roles: string[] = ['Administrador', 'Coordinador', 'Secretario', 'Usuario Registrado'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private interactionService: InteractionService
  ) {
    this.editarUsuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      rol: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.rut = params.get('rut');
      console.log('RUT del usuario:', this.rut);

      if (this.rut) {
        this.firestoreService.getdocs<any>('Usuario').subscribe(users => {
          this.userDetails = users.find(user => user.rut === this.rut);
          if (this.userDetails) {
            console.log('Detalles del usuario:', this.userDetails);
            // Cargar los datos del usuario en el formulario
            this.editarUsuarioForm.setValue({
              nombre: this.userDetails.nombre || '',
              apellidoPaterno: this.userDetails.apellidoPaterno || '',
              apellidoMaterno: this.userDetails.apellidoMaterno || '',
              rol: this.userDetails.rol || '',
            });
          } else {
            console.error('Usuario no encontrado');
          }
        }, error => {
          console.error('Error al obtener los usuarios:', error);
        });
      }
    });
  }

  async onEditUser() {
    if (this.editarUsuarioForm.valid) {
      const updatedUser = {
        ...this.userDetails,
        ...this.editarUsuarioForm.value,
      };

      // Utilizar uid para actualizar
      const rut = this.userDetails.rut;

      if (rut) {
        this.interactionService.openLoading('Actualizando usuario...');
        try {
          await this.firestoreService.updateDoc('Usuario', rut, updatedUser);
          this.interactionService.presentToast('Usuario editado con éxito');
          this.router.navigate(['/buscador-usuarios']);
        } catch (error) {
          console.error('Error al editar usuario:', error);
          this.interactionService.presentToast('Error al editar usuario');
        } finally {
          this.interactionService.closeLoading();
        }
      } else {
        console.error('El UID del usuario es null');
        this.interactionService.presentToast('Error: UID del usuario no encontrado');
      }
    }
  }

  goBack() {
    this.router.navigate(['/buscador-usuarios']);
  }
}
