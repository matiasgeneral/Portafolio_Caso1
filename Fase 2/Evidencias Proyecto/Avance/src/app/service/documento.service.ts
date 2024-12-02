import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';

export interface DocumentoResidencia {
  numeroDocumento: string;
  fechaEmision: any;
  userData: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    direccion: string;
    rut: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private readonly COLLECTION_NAME = 'documentos_residencia';

  constructor(private firestore: AngularFirestore) {}

  async guardarDocumento(documentoData: DocumentoResidencia): Promise<void> {
    try {
      await this.firestore.collection(this.COLLECTION_NAME).doc(documentoData.numeroDocumento).set({
        ...documentoData,
        fechaEmision: new Date(),
      });
    } catch (error) {
      console.error('Error al guardar el documento:', error);
      throw error;
    }
  }

  buscarDocumento(numeroDocumento: string): Observable<DocumentoResidencia | undefined> {
    return this.firestore
      .collection(this.COLLECTION_NAME)
      .doc<DocumentoResidencia>(numeroDocumento)
      .valueChanges()
      .pipe(
        map(doc => {
          if (doc) {
            return {
              ...doc,
              fechaEmision: doc.fechaEmision.toDate()
            };
          }
          return undefined;
        })
      );
  }
}