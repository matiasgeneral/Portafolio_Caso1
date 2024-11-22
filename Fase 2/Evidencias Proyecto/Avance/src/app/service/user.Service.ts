import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirestorageService } from './firestorage.service'; // Para borrar imágenes en Firebase Storage

interface UserData {
  uid: string;
  foto?: string;
  documento?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private firestorageService: FirestorageService // Para la eliminación de archivos
  ) { }

  // Eliminar usuario en Firebase Authentication, Firestore y Firebase Storage
  async deleteUser(rut: string) {
      // Paso 1: Obtener el usuario a partir del rut (asumimos que el RUT está vinculado al UID)
      const userDoc = await this.afs.collection('usuarios').doc(rut).ref.get();
      if (!userDoc.exists) {
        throw new Error('Usuario no encontrado en Firestore');
      }
      const userData = userDoc.data() as UserData;
      const uid = userData?.uid; // Asegúrate de tener el UID

      if (!uid) {
        throw new Error('No se encontró el UID del usuario');
      }

      // Paso 2: Eliminar los archivos asociados (imagen y documento) desde Firebase Storage
      if (userData?.foto) {
        await this.firestorageService.deleteImage2(userData.foto, 'foto');
      }
      if (userData?.documento) {
        await this.firestorageService.deleteImage2(userData.documento, 'documento');
      }

      // Paso 3: Eliminar el documento de Firestore
      await this.afs.collection('usuarios').doc(rut).delete();

      // Paso 4: Eliminar al usuario de Firebase Authentication
      const user = await this.afAuth.currentUser; // Verifica que el usuario existe
      if (user) {
        await user.delete();
      }
      console.log(`Usuario ${rut} eliminado correctamente`);

    } catch (error: any) {
      console.error('Error al eliminar el usuario:', error);
      throw error; // Relanzar el error para manejarlo en el componente
    }
  }

