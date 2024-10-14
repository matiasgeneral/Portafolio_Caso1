import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-editar-espacios-publicos',
  templateUrl: './editar-espacios-publicos.component.html',
  styleUrls: ['./editar-espacios-publicos.component.scss'],
})
export class EditarEspaciosPublicosComponent implements OnInit {
  id: string | null = null; // Aquí almacenaremos el id del espacio publico
  espaciosPublicosadForm: FormGroup; // Formulario para editar el espacio publico
  selectedFile: File | null = null; // Archivo de imagen seleccionado
  currentImage: string = ''; // Propiedad para almacenar la imagen actual

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: FirestoreService,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private alertController: AlertController
  ) {
    // Inicializar el formulario con los campos necesarios para editar el espacio publico
    this.espaciosPublicosadForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      ubicacion: ['', Validators.required],
      image: [''], // La imagen puede no estar presente inicialmente
    });
  }

  ngOnInit() {
    // Obtener el ID del espacio publico desde los parámetros de la ruta
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
      if (this.id) {
        // Cargar los detalles del espacio publico y rellenar el formulario
        this.firestore.getDoc<any>('espacioPublico', this.id).subscribe((espacioPublico) => {
          if (espacioPublico) {
            // Rellenar el formulario con los datos actuales
            this.espaciosPublicosadForm.patchValue(espacioPublico);
            this.currentImage = espacioPublico.image; // Almacenar la imagen actual
            console.log('Detalles del espacio publico cargados:', espacioPublico);
          } else {
            console.error('Espacio publico no encontrado');
          }
        });
      }
    });
  }

  // Método para manejar la edición del espacio publico
  async onSubmit() {
    if (this.espaciosPublicosadForm.valid) {
      const espacioPublicoData = this.espaciosPublicosadForm.value;

      // Si hay una imagen seleccionada, se sube a Firebase Storage
      if (this.selectedFile) {
        this.uploadImageAndUpdate(espacioPublicoData);
      } else {
        // Si no se cambió la imagen, solo actualizamos el resto de los datos
        espacioPublicoData.image = this.currentImage; // Mantener la imagen actual
        this.updateEspacioPublico(espacioPublicoData);
      }
    } else {
      console.log('El formulario no es válido');
    }
  }

  // Método para actualizar el Espacio Publico en Firestore
  async updateEspacioPublico(espacioPublicoData: any) {
    if (this.id && typeof this.id === 'string') {
      const path = 'espacioPublico'; // Asegúrate de que la colección sea correcta
      try {
        await this.firestore.updateDoc(espacioPublicoData, path, this.id); // Actualizar los datos del espacio publico
        this.showSuccessAlert();
        this.router.navigate(['/buscador-espacios-publicos']); // Navegar a la lista de espacios publicos después de editar
      } catch (error) {
        console.error('Error al actualizar el espacio publico:', error);
      }
    } else {
      console.error('El ID del espacio publico no es válido:', this.id);
    }
  }

  // Método para manejar la selección de imagen
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.espaciosPublicosadForm.patchValue({ image: file.name }); // Esto es solo el nombre del archivo
    }
  }

  // Subir imagen a Firebase y luego actualizar el espacio publico
  uploadImageAndUpdate(espacioPublicoData: any) {
    const filePath = `espacioPublico/${this.selectedFile!.name}`;
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, this.selectedFile!);
    uploadTask
      .snapshotChanges()
      .pipe(
        finalize(async () => {
          try {
            const url = await fileRef.getDownloadURL().toPromise();
            espacioPublicoData.image = url; // Establecer la URL de la imagen en los datos del espacio publico
            this.updateEspacioPublico(espacioPublicoData);
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
      message: 'El espacio publico actualizado correctamente.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Método para regresar a la lista de espacios publicos
  goBack() {
    this.router.navigate(['/buscador-espacios-publicos']); // Asegúrate de que esta ruta sea correcta
  }
}
