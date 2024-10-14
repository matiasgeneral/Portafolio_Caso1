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
      fechaCreacion: [''], // Añadir campo para fecha de creación
    });
  }

  async onSubmit() {
    if (this.espacioPublicoForm.valid && this.selectedFile) {
      const espacioPublicoData = this.espacioPublicoForm.value;

      // Asignar la fecha de creación en formato día/mes/año
      espacioPublicoData.fechaCreacion = this.getCurrentDate();

      // Formatear fecha a día/mes/año
      // Si se necesita una fecha adicional, asegúrate de tenerla en el formulario
      // espacioPublicoData.fecha = this.formatDate(espacioPublicoData.fecha);

      // Generar el UID del espacio público
      const id = this.firestore.getId();
      espacioPublicoData.id = id; // Añadir el UID a los datos del espacio público

      const filePath = `espacioPublico/${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);

      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(async () => {
            const url = await fileRef.getDownloadURL().toPromise();
            espacioPublicoData.image = url;

            // Crear el espacio público en Firestore con el UID
            await this.createEspacioPublico(espacioPublicoData, id);
            this.showSuccessAlert();
            this.resetForm();
          })
        )
        .subscribe();
    } else {
      console.log('El formulario no es válido o no hay archivo seleccionado');
    }
  }

  // Método para crear un espacio público en Firestore con un UID
  async createEspacioPublico(espacioPublicoData: any, id: string) {
    const path = 'espacioPublico';
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

  resetForm() {
    this.espacioPublicoForm.reset();
    this.selectedFile = null;
  }

  getCurrentDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mes es 0-indexed
    const year = today.getFullYear();
    return `${day}/${month}/${year}`; // Cambiar a formato día/mes/año
  }

  formatDate(dateString: string): string {
    // Asumir que dateString está en formato 'YYYY-MM-DD'
    const parts = dateString.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`; // Formato 'DD/MM/YYYY'
  }
}
