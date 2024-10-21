import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-crear-espacios-publicos',
  templateUrl: './crear-espacios-publicos.component.html',
  styleUrls: ['./crear-espacios-publicos.component.scss'],
})
export class CrearEspaciosPublicosComponent implements OnInit {
  espacioPublicoForm!: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private firestore: FirestoreService,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.espacioPublicoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      ubicacion: ['', Validators.required],
      image: ['', Validators.required],
      fechaCreacion: [''], // Este campo se asignará en onSubmit
    });
  }

  async onSubmit() {
    if (this.espacioPublicoForm.valid && this.selectedFile) {
      const espacioPublicoData = { ...this.espacioPublicoForm.value };
      espacioPublicoData.fechaCreacion = this.getCurrentDate(); // Almacena como string

      const id = this.firestore.getId();
      espacioPublicoData.id = id;

      const filePath = `espaciosPublicos/${id}_${this.selectedFile.name}`; // Incluye ID para evitar conflictos
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);

      uploadTask.snapshotChanges()
        .pipe(finalize(async () => {
          try {
            const url = await fileRef.getDownloadURL().toPromise();
            espacioPublicoData.image = url; // Guarda la URL de la imagen
            await this.createEspacioPublico(espacioPublicoData, id);
            this.showSuccessAlert();
            this.resetForm();
          } catch (error) {
            console.error('Error al cargar la imagen o crear el espacio público:', error);
            this.showErrorAlert('Error al crear el espacio público.');
          }
        }))
        .subscribe();
    } else {
      console.log('El formulario no es válido o no hay archivo seleccionado');
      this.showErrorAlert('Por favor, completa todos los campos y selecciona un archivo.');
    }
  }

  async createEspacioPublico(espacioPublicoData: any, id: string) {
    const path = 'espaciosPublicos'; // Nombre correcto de tu colección
    await this.firestore.createDoc(espacioPublicoData, path, id);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.espacioPublicoForm.patchValue({ image: file.name });
    }
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El espacio público ha sido creado correctamente.',
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
    this.espacioPublicoForm.reset();
    this.selectedFile = null;
  }

  getCurrentDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes es 0-indexed
    const year = now.getFullYear();
    return `${day}/${month}/${year}`; // Formato día/mes/año
  }
}
