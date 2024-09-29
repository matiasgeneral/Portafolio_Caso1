import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-crear-noticias',
  templateUrl: './crear-noticias.component.html',
  styleUrls: ['./crear-noticias.component.scss'],
})
export class CrearNoticiasComponent implements OnInit {
  newsForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private firestore: FirestoreService,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private alertController: AlertController
  ) {
    this.newsForm = this.formBuilder.group({
      title: ['', Validators.required],
      subtitle: ['', Validators.required],
      details: ['', Validators.required],
      image: ['', Validators.required],
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.newsForm.valid && this.selectedFile) {
      const newsData = this.newsForm.value;

      // Asignar la fecha actual
      newsData.date = this.getCurrentDate();

      // Generar el UID de la noticia
      const id = this.firestore.getId();
      newsData.id = id;  // Añadir el UID a los datos de la noticia

      const filePath = `noticias/${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);

      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(async () => {
            const url = await fileRef.getDownloadURL().toPromise();
            newsData.image = url;

            // Crear la noticia en Firestore con el UID
            this.createNews(newsData, id);
            this.showSuccessAlert();
            this.resetForm();
          })
        )
        .subscribe();
    } else {
      console.log('El formulario no es válido o no hay archivo seleccionado');
    }
  }

  // Método para crear una noticia en Firestore con un UID
  createNews(newsData: any, id: string) {
    const path = 'noticias';
    return this.firestore.createDoc(newsData, path, id);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.newsForm.patchValue({ image: file.name });
    }
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'La noticia ha sido creada correctamente.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  resetForm() {
    this.newsForm.reset();
    this.selectedFile = null;
  }

  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
