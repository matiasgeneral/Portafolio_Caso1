import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-editar-noticias',
  templateUrl: './editar-noticias.component.html',
  styleUrls: ['./editar-noticias.component.scss'],
})
export class EditarNoticiasComponent implements OnInit {
  id: string | null = null; // Aquí almacenaremos el id de la noticia
  noticiaForm: FormGroup; // Formulario para editar la noticia
  selectedFile: File | null = null; // Archivo de imagen seleccionado
  currentImage: string | undefined; // Para almacenar la URL de la imagen actual

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: FirestoreService,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private alertController: AlertController
  ) {
    // Inicializar el formulario con los campos necesarios para editar la noticia
    this.noticiaForm = this.formBuilder.group({
      title: ['', Validators.required],
      subtitle: ['', Validators.required],
      date: ['', Validators.required],
      details: ['', Validators.required],
      image: [''], // La imagen puede no estar presente inicialmente
    });
  }

  ngOnInit() {
    // Obtener el ID de la noticia desde los parámetros de la ruta
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
      if (this.id) {
        // Cargar los detalles de la noticia y rellenar el formulario
        this.firestore.getDoc<any>('noticias', this.id).subscribe((noticias) => {
          if (noticias) {
            // Rellenar el formulario con los datos actuales
            this.noticiaForm.patchValue(noticias);
            this.currentImage = noticias.image; // Almacenar la imagen actual
            console.log('Detalles de la noticia cargados:', noticias);
          } else {
            console.error('Noticia no encontrada');
          }
        });
      }
    });
  }

  // Método para manejar la edición de la noticia
  async onSubmit() {
    if (this.noticiaForm.valid) {
      const noticiaData = this.noticiaForm.value;

      // Si hay una imagen seleccionada, se sube a Firebase Storage
      if (this.selectedFile) {
        this.uploadImageAndUpdate(noticiaData);
      } else {
        // Si no se cambió la imagen, solo actualizamos el resto de los datos
        noticiaData.image = this.currentImage; // Mantener la imagen actual
        this.updateNoticia(noticiaData);
      }
    } else {
      console.log('El formulario no es válido');
    }
  }

  // Método para actualizar la noticia en Firestore
  async updateNoticia(noticiaData: any) {
    if (this.id && typeof this.id === 'string') {
      const path = 'noticias'; // Asegúrate que la colección sea correcta
      try {
        await this.firestore.updateDoc(noticiaData, path, this.id); // Actualizar los datos de la noticia
        this.showSuccessAlert();
        this.router.navigate(['/buscador-noticias']); // Navegar a la lista de noticias después de editar
      } catch (error) {
        console.error('Error al actualizar la noticia:', error);
      }
    } else {
      console.error('El ID de la noticia no es válido:', this.id);
    }
  }

  // Método para manejar la selección de imagen
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.noticiaForm.patchValue({ image: file.name }); // Esto es solo el nombre del archivo
    }
  }

  // Subir imagen a Firebase y luego actualizar la noticia
  uploadImageAndUpdate(noticiaData: any) {
    const filePath = `noticia/${this.selectedFile!.name}`;
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, this.selectedFile!);

    uploadTask
      .snapshotChanges()
      .pipe(
        finalize(async () => {
          try {
            const url = await fileRef.getDownloadURL().toPromise();
            noticiaData.image = url; // Establecer la URL de la imagen en los datos de la noticia
            this.updateNoticia(noticiaData);
          } catch (error) {
            console.error('Error al obtener la URL de la imagen:', error);
          }
        })
      )
      .subscribe();
  }

  // Mostrar alerta de éxito
  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'La noticia ha sido actualizada correctamente.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Método para regresar a la lista de noticias
  goBack() {
    this.router.navigate(['/buscador-noticias']); // Asegúrate de que esta ruta sea correcta
  }
}
