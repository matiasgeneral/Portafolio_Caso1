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
  maxParticipants: number = 999;

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
      horaEvento: ['', Validators.required],
      cantidadMax: ['', [Validators.required, Validators.max(this.maxParticipants)]],
      image: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  async onSubmit() {
    if (this.actividadForm.valid && this.selectedFile) {
      const actividadData = this.actividadForm.value;

      // Asignar la fecha de creación en formato día/mes/año
      actividadData.fechaCreacion = this.getCurrentDate();

      // Depuración: Verificar el valor de fechaEvento antes del formato
      console.log('Valor original de fechaEvento:', actividadData.fechaEvento);

      // Formatear fechaEvento a día/mes/año
      actividadData.fechaEvento = this.formatDate(actividadData.fechaEvento);

      // Depuración: Verificar el valor de fechaEvento después del formato
      console.log('Valor formateado de fechaEvento:', actividadData.fechaEvento);

      actividadData.cantidadDisponible = actividadData.cantidadMax;
      const id = this.firestore.getId();
      actividadData.id = id;

      const filePath = `actividad/${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);

      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(async () => {
            const url = await fileRef.getDownloadURL().toPromise();
            actividadData.image = url;

            await this.createActividad(actividadData, id);
            this.showSuccessAlert();
            this.resetForm();
          })
        )
        .subscribe();
    } else {
      console.log('El formulario no es válido o no hay archivo seleccionado');
    }
  }

  async createActividad(actividadData: any, id: string) {
    const path = 'actividades';
    await this.firestore.createDoc(actividadData, path, id);
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
  }

  getCurrentDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Fecha no disponible';
    
    // Verificar el valor y formatear solo si tiene el formato esperado 'YYYY-MM-DD'
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else {
      console.warn('Formato inesperado para fechaEvento:', dateString);
      return 'Fecha no disponible';
    }
  }
}
