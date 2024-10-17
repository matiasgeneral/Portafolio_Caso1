import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-crear-actividades',
  templateUrl: './crear-actividades.component.html',
  styleUrls: ['./crear-actividades.component.scss'],
})
export class CrearActividadesComponent implements OnInit {
  actividadForm: FormGroup;
  selectedFile: File | null = null;
  maxParticipants: number = 99; // Máximo de participantes
  remainingSpots: number = this.maxParticipants; // Espacios restantes

  constructor(
    private firestore: FirestoreService,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private alertController: AlertController
  ) {
    this.actividadForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechaEvento: ['', Validators.required],
      cantidadMax: ['', [Validators.required, Validators.max(this.maxParticipants)]],
      image: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  async onSubmit() {
    if (this.actividadForm.valid && this.selectedFile) {
      const actividadData = this.actividadForm.value;

      // Asignar la fecha de creación
      actividadData.fechaCreacion = this.getCurrentDate();
      
      // Calcular los espacios restantes
      const participantes = Number(actividadData.cantidadMax);
      this.remainingSpots -= participantes;

      // Verificar si hay suficientes espacios
      if (this.remainingSpots < 0) {
        console.log('No hay suficientes espacios disponibles');
        return;
      }

      // Generar el UID de la actividad
      const id = this.firestore.getId();
      actividadData.id = id; // Añadir el UID a los datos de la actividad

      const filePath = `actividad/${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);

      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(async () => {
            const url = await fileRef.getDownloadURL().toPromise();
            actividadData.image = url;

            // Crear la actividad en Firestore con el UID
            this.createActividad(actividadData, id);
            this.showSuccessAlert();
            this.resetForm();
          })
        )
        .subscribe();
    } else {
      console.log('El formulario no es válido o no hay archivo seleccionado');
    }
  }

  // Método para crear una actividad en Firestore con un UID
  createActividad(actividadData: any, id: string) {
    const path = 'actividad';
    return this.firestore.createDoc(actividadData, path, id);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.actividadForm.patchValue({ image: file.name });
    }
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'La actividad ha sido creada correctamente.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  resetForm() {
    this.actividadForm.reset();
    this.selectedFile = null;
    this.remainingSpots = this.maxParticipants; // Reiniciar los espacios restantes
  }

  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
