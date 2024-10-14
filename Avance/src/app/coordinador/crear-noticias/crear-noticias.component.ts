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
      newsData.date = this.getCurrentDate(); // Asignar la fecha actual
      const id = this.firestore.getId();
      newsData.id = id;  // Añadir el UID a los datos de la noticia

      const filePath = `noticias/${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);

      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(async () => {
            try {
              const url = await fileRef.getDownloadURL().toPromise();
              newsData.image = url;
              this.createNews(newsData, id);
              this.showSuccessAlert();
              this.resetForm();
            } catch (error) {
              console.error('Error al obtener la URL de la imagen:', error);
              this.showErrorAlert('No se pudo obtener la URL de la imagen.');
            }
          })
        )
        .subscribe(
          () => {},
          (error) => {
            console.error('Error durante la subida:', error);
            this.showErrorAlert('Error al subir la imagen.');
          }
        );
    } else {
      console.log('El formulario no es válido o no hay archivo seleccionado');
    }
  }

  createNews(newsData: any, id: string) {
    const path = 'noticias';
    return this.firestore.createDoc(newsData, path, id);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      this.newsForm.patchValue({ image: file.name });
    } else {
      this.showErrorAlert('Por favor, selecciona un archivo de imagen.');
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

  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
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
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`; // Formato día/mes/año
  }

  formatDate(dateString: string): string {
    const parts = dateString.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`; // Formato 'DD/MM/YYYY'
  }
}
