import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirestoreService } from './firestore.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private authFirebase: AngularFireAuth,
    private firestoreService: FirestoreService
  ) {}

  // Método para iniciar sesión
  login(email: string, password: string) {
    return this.authFirebase.signInWithEmailAndPassword(email, password);
  }

  // Método para cerrar sesión
  logout() {
    return this.authFirebase.signOut();
  }

  // Método para registrar un nuevo usuario
  signup(email: string, password: string) {
    return this.authFirebase.createUserWithEmailAndPassword(email, password);
  }

  // Método para obtener el estado de autenticación
  stateAuth() {
    return this.authFirebase.authState;
  }

  // Obtener el rol del usuario autenticado desde Firestore
  async getUserRole(uid: string): Promise<string | null> {
    try {
      const userDoc = await firstValueFrom(
        this.firestoreService.getDoc<any>('usuarios', uid)
      );
      return userDoc?.tipo || null; // Devuelve el rol o null si no existe
    } catch (error) {
      console.error('Error obteniendo el rol del usuario:', error);
      return null;
    }
  }

  // Actualizar el rol de un usuario en Firestore
  async updateUserRole(uid: string, newRole: string): Promise<void> {
    try {
      await this.firestoreService.updateDoc(
        { tipo: newRole }, // Actualiza el campo 'tipo' con el nuevo rol
        'usuarios',
        uid
      );
      console.log('Rol de usuario actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando el rol del usuario:', error);
    }
  }


  // AuthenticationService
async getCurrentUser(): Promise<any> {
  const user = await this.authFirebase.currentUser; // Obtiene el usuario actual
  if (user) {
    const uid = user.uid;
    const userData = await this.firestoreService.getDoc<any>('usuarios', uid).toPromise(); // Obtener datos del usuario de Firestore
    return { uid, ...userData }; // Retorna el UID junto con los datos del usuario
  }
  return null; // Si no hay usuario autenticado
}

}
