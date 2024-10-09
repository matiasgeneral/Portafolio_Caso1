import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-crear-proyectos',
  templateUrl: './crear-proyectos.component.html',
  styleUrls: ['./crear-proyectos.component.scss'],
})
export class CrearProyectosComponent implements OnInit {
  proyectoForm!: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private firestore: FirestoreService,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.proyectoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      image: ['', Validators.required], // Si decides mantener esto, asegúrate de sincronizar con `selectedFile`
      fechaCreacion: [''], // Campo para la fecha de creación
    });
  }

  async onSubmit() {
    if (this.proyectoForm.valid && this.selectedFile) {
      const proyectoData = this.proyectoForm.value;

      // Asignar la fecha de creación en formato día/mes/año (fecha actual)
      proyectoData.fechaCreacion = this.getCurrentDate();
      
      //Asignar la fecha de inicio y fin en formato día/mes/año
      proyectoData.fechaInicio = this.formatDate(proyectoData.fechaInicio);
      proyectoData.fechaFin = this.formatDate(proyectoData.fechaFin);

      // Generar el UID del proyecto
      const id = this.firestore.getId();
      proyectoData.id = id; // Añadir el UID a los datos del proyecto

      const filePath = `proyecto/${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);

      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(async () => {
            const url = await fileRef.getDownloadURL().toPromise();
            proyectoData.image = url;

            // Crear el proyecto en Firestore con el UID
            await this.createProyecto(proyectoData, id);
            this.showSuccessAlert();
            this.resetForm();
          })
        )
        .subscribe();
    } else {
      console.log('El formulario no es válido o no hay archivo seleccionado');
    }
  }

  async createProyecto(proyectoData: any, id: string) {
    const path = 'proyecto';
    await this.firestore.createDoc(proyectoData, path, id);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.proyectoForm.patchValue({ image: file.name });
    }
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El proyecto ha sido creado correctamente.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  resetForm() {
    this.proyectoForm.reset();
    this.selectedFile = null;
    this.proyectoForm.markAsPristine(); // Restablecer el estado del formulario
    this.proyectoForm.markAsUntouched(); // Marcar campos como no tocados
  }

  getCurrentDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mes es 0-indexed
    const year = today.getFullYear();
    return `${day}/${month}/${year}`; // Formato día/mes/año
  }

  formatDate(dateString: string): string {
    // Asumir que dateString está en formato 'YYYY-MM-DD'
    const parts = dateString.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`; // Formato 'DD/MM/YYYY'
  }
}
