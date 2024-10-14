import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';


import firebase from 'firebase/compat/app';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private roles: string[] = ['usuario', 'secretario', 'coordinador']; // Roles predeterminados

  constructor(private firestore: AngularFirestore,
    private firestoreService: FirestoreService
  ) {}

  // Método para obtener roles desde Firestore
  getRolesFromFirestore(): Observable<any[]> {
    return this.firestore.collection('roles').valueChanges();
  }

  // Método para obtener roles predeterminados
  getRoles(): Observable<string[]> {
    return of(this.roles); // Retornar los roles predeterminados como Observable
  }

  // Método para verificar si un rol es válido
  async isValidType(type: string): Promise<boolean> {
    const rolesSnapshot = await this.firestore.collection('roles').get().toPromise();
    const roles = rolesSnapshot?.docs.map((doc) => (doc.data() as firebase.firestore.DocumentData)["rol"]) || []; // Cambia 'rol' según tu estructura
    return roles.includes(type);
  }
}
