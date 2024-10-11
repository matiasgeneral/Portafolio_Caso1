import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class FirestorageService {

  constructor(private storage: AngularFireStorage) { }

  uploadImage(image: string, path: string, name: string) {
    return this.storage.upload(`${path}/${name}`, image).then(snapshot => snapshot.ref.getDownloadURL());
  }

  deleteImage2(path: string, name: string) {
    return this.storage.ref(`${path}/${name}`).delete();
  }

  deleteImageFromUrl(imageUrl: string) {
    const imageRef = this.storage.refFromURL(imageUrl);  // Aquí usamos refFromURL
    return imageRef.delete();  // Retorna la promesa de borrado
  }
  
}