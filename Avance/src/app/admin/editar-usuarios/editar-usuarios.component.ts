import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from '../../service/firestore.service';
import { InteractionService } from '../../service/interaction.service';
import { AuthenticationService } from '../../service/authentication.service';
import { firstValueFrom } from 'rxjs';

// Interfaz para definir la estructura del usuario
interface Usuario {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipo: string; // Rol del usuario
}

@Component({
  selector: 'app-editar-usuarios',
  templateUrl: './editar-usuarios.component.html',
  styleUrls: ['./editar-usuarios.component.scss'],
})
export class EditarUsuariosComponent implements OnInit {
  editarUsuarioForm: FormGroup;
  currentUserRole: string | null = null; // Rol del usuario que está editando
  selectedUserId: string = ''; // Asigna un valor por defecto
  userData: Usuario | null = null; // Datos del usuario que se editarán
  roles: string[] = []; // Lista de roles disponibles para selección

  constructor(
    private fb: FormBuilder,
    private firestore: FirestoreService,
    private interaction: InteractionService,
    private authService: AuthenticationService
  ) {
    this.editarUsuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      rol: ['', Validators.required] // Rol a editar
    });
  }

  ngOnInit() {
    this.loadCurrentUserRole(); // Cargar el rol del usuario actual
    this.getDoc(); // Cargar datos del usuario a editar
  }

  // Cargar el rol del usuario actual (quien está haciendo la edición)
  async loadCurrentUserRole() {
    const currentUser = await firstValueFrom(this.authService.stateAuth());

    if (currentUser && currentUser.uid) {
      this.firestore.getDoc<Usuario>('Usuario', currentUser.uid).subscribe(userDoc => {
        if (userDoc) {
          this.currentUserRole = userDoc.tipo; // Acceder sin corchetes
          this.setAvailableRoles();
        }
      });
    }
  }

  // Filtrar los roles disponibles según el rol del usuario que edita
  setAvailableRoles() {
    if (this.currentUserRole === 'administrador') {
      this.roles = ['usuario', 'secretario', 'coordinador', 'administrador'];
    } else if (this.currentUserRole === 'coordinador') {
      this.roles = ['usuario', 'secretario'];
    } else {
      this.roles = ['usuario']; // Si es secretario o usuario, solo puede asignar el rol de 'usuario'
    }
  }

  // Cargar datos del usuario seleccionado para editar
  async getDoc() {
    this.firestore.getDoc<Usuario>('Usuario', this.selectedUserId).subscribe(userDoc => {
      if (userDoc) {
        this.userData = userDoc; // Almacena los datos del usuario
        this.editarUsuarioForm.patchValue({
          nombre: userDoc.nombre, // Acceder sin corchetes
          apellidoPaterno: userDoc.apellidoPaterno,
          apellidoMaterno: userDoc.apellidoMaterno,
          rol: userDoc.tipo // Rol actual del usuario
        });
      }
    });
  }

  // Guardar cambios en el usuario editado
  async onEditUser() {
    if (this.editarUsuarioForm.valid) {
      const { nombre, apellidoPaterno, apellidoMaterno, rol } = this.editarUsuarioForm.value;

      try {
        // Actualizar en Firestore
        await this.firestore.updateDoc({ nombre, apellidoPaterno, apellidoMaterno, tipo: rol }, 'Usuario', this.selectedUserId);
        this.interaction.presentToast('Usuario actualizado con éxito');
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        this.interaction.presentToast('Error al actualizar usuario');
      }
    } else {
      this.interaction.presentToast('Complete todos los campos correctamente');
    }
  }
}
