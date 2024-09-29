import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, Observable } from 'rxjs';

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
    const collection = this.afs.collection(path);
    return collection.doc(id).update(data);
  }

  // Borrar documento
  deleteDoc(path: string, id: string) {
    const collection = this.afs.collection(path);
    return collection.doc(id).delete();
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
      return collection.add(data);  // Esto genera automáticamente el ID único
    }
  }

