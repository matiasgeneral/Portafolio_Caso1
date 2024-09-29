import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage'; // Importar AngularFireStorage
import { finalize } from 'rxjs/operators'; // Operador para completar la subida
import { AlertController } from '@ionic/angular'; // Para mostrar alertas

@Component({
  selector: 'app-crear-noticias',
  templateUrl: './crear-noticias.component.html',
  styleUrls: ['./crear-noticias.component.scss'],
})
export class CrearNoticiasComponent implements OnInit {
  newsForm: FormGroup;
  selectedFile: File | null = null; // Almacena el archivo seleccionado

  constructor(
    private firestore: FirestoreService,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage, // Servicio de almacenamiento
    private alertController: AlertController // Controlador de alertas
  ) {
    // Inicializa el formulario con los campos necesarios
    this.newsForm = this.formBuilder.group({
      title: ['', Validators.required],
      details: ['', Validators.required],
      image: ['', Validators.required], // Cambiará cuando tengamos la URL de la imagen
      date: ['', Validators.required],
    });
  }

  ngOnInit() {}

  // Método para manejar el envío del formulario
  async onSubmit() {
    if (this.newsForm.valid && this.selectedFile) {
      const newsData = this.newsForm.value;
      console.log('Datos de la noticia:', newsData);

      // Subir la imagen a Firebase Storage antes de guardar en Firestore
      const filePath = `noticias/${this.selectedFile.name}`; // Ruta en Firebase Storage
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);

      // Esperar a que la imagen se suba y luego obtener la URL de descarga
      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              newsData.image = url; // Guardar la URL de la imagen
              this.createNews(newsData); // Crear la noticia en Firestore
              this.showSuccessAlert(); // Mostrar alerta de éxito
              this.resetForm(); // Reiniciar el formulario después de enviar
            });
          })
        )
        .subscribe();
    } else {
      console.log('El formulario no es válido o no hay archivo seleccionado');
    }
  }

  // Método para crear la noticia en Firestore
  createNews(newsData: any) {
    const path = 'noticias'; // Cambia el path según tu estructura en Firestore
    return this.firestore.createDoc(newsData, path, this.firestore.getId());
  }

  // Método para manejar la selección de la imagen
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; // Guardar el archivo seleccionado
      this.newsForm.patchValue({ image: file.name }); // Solo muestra el nombre del archivo
    }
  }

  // Método para mostrar alerta de éxito
  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'La noticia ha sido creada correctamente.',
      buttons: ['OK']
    });

    await alert.present();
  }

  // Método para reiniciar el formulario
  resetForm() {
    this.newsForm.reset();
    this.selectedFile = null; // Reiniciar archivo seleccionado
  }
}
