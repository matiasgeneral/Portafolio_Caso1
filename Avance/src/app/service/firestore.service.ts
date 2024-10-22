import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, Observable } from 'rxjs';
import { WhereFilterOp, arrayUnion } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private afs: AngularFirestore) { }

  // Crear documento
  createDoc(data: any, path: string, id: string) {
    const collection = this.afs.collection(path);
    return collection.doc(id).set(data);
  }

  // Obtener documento por ID
  getDoc<tipo>(path: string, id: string) {
    const collection = this.afs.collection<tipo>(path);
    return collection.doc(id).valueChanges();
  }

  // Actualizar documento
  updateDoc(data: any, path: string, id: string) {
    console.log('El ID que se pasa es:', id); // Verifica si es un string

    // Verificar si el ID es un string
    if (typeof id !== 'string') {
      throw new Error('El ID proporcionado no es un string');
    }

    const collection = this.afs.collection(path);
    return collection.doc(id).update(data);
  }

  // Borrar documento
  deleteDoc(path: string, id: string) {
    const collection = this.afs.collection(path);
    return collection.doc(id).delete();
  }

  // Borrar usuario
  deleteUser2(path: string, uid: string) {
    const collection = this.afs.collection(path);
    return collection.doc(uid).delete();
  }

  // Deshabilitar un documento
  deshabilitarDoc(path: string, id: string) {
    const collection = this.afs.collection(path);
    return collection.doc(id).update({ disabled: true });
  }

  // Listar documentos
  getdocs<tipo>(path: string) {
    const collection = this.afs.collection<tipo>(path);
    return collection.valueChanges();
  }

  // Crear ID de documento único
  getId() {
    return this.afs.createId();
  }

  // Obtener noticias por fecha
  getNoticiasPorFecha(fecha: string): Observable<any[]> {
    const collection = this.afs.collection('noticias', ref => ref.where('date', '==', fecha));
    return collection.valueChanges();
  }

  // Verificar si un RUT ya existe en la colección
  async checkRUTExists(rut: string, path: string): Promise<boolean> {
    const docs = await firstValueFrom(this.getdocs(path));
    return docs.some((user: any) => user.rut === rut);
  }

  // Obtener ventas por UID
  getVenta(uid: string) {
    const collection = this.afs.collection('ventas', ref => ref.where('uidComprador', '==', uid));
    return collection.valueChanges();
  }

  // Método para crear un documento con ID generado automáticamente
  createDocWithAutoId(data: any, path: string) {
    const collection = this.afs.collection(path);
    return collection.add(data); // Esto genera automáticamente el ID único
  }

  // Método exclusivo para actualizar un documento de usuario
  updateUserDoc(rut: string, data: any) {
    if (typeof rut !== 'string' || !rut) {
      return Promise.reject('El RUT debe ser un string válido');
    }

    // Buscar el documento por el campo 'rut'
    return this.afs.collection('usuarios', ref => ref.where('rut', '==', rut))
      .get().toPromise()
      .then(querySnapshot => {
        if (!querySnapshot || querySnapshot.empty) {
          throw new Error('No se encontró ningún usuario con el RUT proporcionado');
        }

        // Obtenemos el ID del documento
        const docId = querySnapshot.docs[0].id;

        // Actualizamos el documento con el ID encontrado
        return this.afs.collection('usuarios').doc(docId).update(data);
      })
      .then(() => {
        console.log('Usuario actualizado correctamente');
      })
      .catch(error => {
        console.error('Error al actualizar el usuario:', error);
        throw error;
      });
  }

  // Obtener rol de usuario por RUT
  getUserRole(rut: string): Promise<string | null> {
    return this.afs.collection('usuarios', ref => ref.where('rut', '==', rut)).get().toPromise()
      .then(querySnapshot => {
        if (querySnapshot && !querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data() as { role?: string };
          return userData.role || null; // Devuelve el rol o null si no existe
        }
        return null; // Si no se encuentra el usuario
      })
      .catch(error => {
        console.error('Error al obtener el rol del usuario:', error);
        throw error;
      });
  }

  // Método para obtener documentos con una condición específica
  getDocsWithCondition<T>(collection: string, field: string, operator: WhereFilterOp, value: any): Observable<T[]> {
    return this.afs.collection<T>(collection, (ref) => ref.where(field, operator, value)).valueChanges();
  }

   // Método para actualizar un espacio público
   async updateEspacioPublico(id: string, newData: any) {
    const path = 'espaciosPublicos'; // Asegúrate que este sea el nombre correcto de tu colección
    await this.updateDoc(newData, path, id);
  }

  // Método para agregar una fecha reservada a un espacio público
  addFechaReservada(id: string, fechaReservada: any) {
    const collection = this.afs.collection('espaciosPublicos'); // Asegúrate que el nombre de la colección sea correcto
    return collection.doc(id).set({
      fechasReservadas: arrayUnion(fechaReservada) // Añade la fecha reservada al array de fechasReservadas
    }, { merge: true }); // merge: true asegura que no se sobrescriban los otros campos
  }

  // Método para obtener los espacios públicos
  getEspaciosPublicos(): Observable<any[]> {
    return this.afs.collection('espaciosPublicos').valueChanges({ idField: 'id' });
  }

  // Método para obtener las reservas de un espacio público en particular
  getReservas(espacioPublicoId: string): Observable<any[]> {
    return this.afs.collection('reservas', ref => ref.where('espacioPublicoId', '==', espacioPublicoId)).valueChanges();
  }
    
  }
  
  

