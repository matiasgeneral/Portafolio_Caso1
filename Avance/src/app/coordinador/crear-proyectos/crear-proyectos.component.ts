import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import { FcmService } from '../../service/Fcm.Service';

@Component({
  selector: 'app-crear-proyectos',
  templateUrl: './crear-proyectos.component.html',
  styleUrls: ['./crear-proyectos.component.scss'],
})
export class CrearProyectosComponent implements OnInit {
  proyectoForm!: FormGroup;
  selectedFile: File | null = null;
  maxFileSize = 5 * 1024 * 1024; // 5MB en bytes

  constructor(
    private firestore: FirestoreService,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private alertController: AlertController,
    private fcmService: FcmService
  ) {
    this.initForm();
  }

  ngOnInit() {}

  private initForm() {
    this.proyectoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      image: ['', Validators.required],
      documentosRequeridos: this.formBuilder.array([]), // FormArray para documentos
    });
  }

  // Getter para documentosRequeridos como FormArray
  get documentosRequeridos() {
    return this.proyectoForm.get('documentosRequeridos') as FormArray;
  }

  // Agregar un nuevo FormGroup de documento al FormArray
  agregarDocumento() {
    const documentoForm = this.formBuilder.group({
      nombre: ['', Validators.required], // Nombre del documento
    });
    this.documentosRequeridos.push(documentoForm);
  }

  // Eliminar un documento del FormArray
  eliminarDocumento(index: number) {
    this.documentosRequeridos.removeAt(index);
  }

  async onSubmit() {
    if (this.proyectoForm.valid && this.selectedFile) {
      try {
        // Mostrar loading
        const loading = await this.alertController.create({
          message: 'Subiendo proyecto...',
        });
        await loading.present();

        if (!this.validateFile(this.selectedFile)) {
          await loading.dismiss();
          return;
        }

        const proyectoData = this.proyectoForm.value;
        proyectoData.fechaCreacion = this.getCurrentDate();
        proyectoData.fechaInicio = this.formatDate(proyectoData.fechaInicio);
        proyectoData.fechaFin = this.formatDate(proyectoData.fechaFin);
        const id = this.firestore.getId();
        proyectoData.id = id;

        // Subir archivo primero
        try {
          const filePath = `proyectos/${Date.now()}_${this.selectedFile.name}`;
          const fileRef = this.storage.ref(filePath);
          const uploadTask = await this.storage.upload(filePath, this.selectedFile);
          const url = await fileRef.getDownloadURL().toPromise();
          console.log('URL de archivo obtenido:', url);
          proyectoData.image = url;
        } catch (error) {
          console.error('Error en subida de archivo:', error);
          await loading.dismiss();
          this.showErrorAlert('Error al subir el archivo. Por favor, intente nuevamente.');
          return;
        }

        // Crear documento
        try {
          await this.createProyecto(proyectoData, id);
        } catch (error) {
          console.error('Error al crear proyecto:', error);
          await loading.dismiss();
          this.showErrorAlert('Error al crear el proyecto. Por favor, intente nuevamente.');
          return;
        }

        // Todo exitoso
        await loading.dismiss();
        await this.showSuccessAlert();

        // Limpiar y recargar de manera forzada
        this.resetForm();
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        // Esperar un momento y recargar
        setTimeout(() => {
          window.location.href = window.location.href;
        }, 1000);
      } catch (error) {
        console.error('Error general:', error);
        this.showErrorAlert('Error inesperado. Por favor, intente nuevamente.');
      }
    } else {
      this.showErrorAlert('Por favor, complete todos los campos y seleccione un archivo.');
    }
  }

  validateFile(file: File): boolean {
    console.log('Validando archivo:', file);
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!validTypes.includes(file.type)) {
      this.showErrorAlert('Solo se permiten archivos PNG, o JPG/JPEG ');
      return false;
    }

    if (file.size > this.maxFileSize) {
      this.showErrorAlert('El archivo no debe superar los 5MB.');
      return false;
    }

    console.log('Archivo válido');
    return true;
  }

  async createProyecto(proyectoData: any, id: string) {
    try {
      const path = 'proyectos';
      await this.firestore.createDoc(proyectoData, path, id);
      console.log('Documento creado exitosamente');

      // Enviar notificación solo si el documento se creó correctamente
      try {
        await this.fcmService.sendNotification(
          'Nuevo Proyecto',
          `Se ha creado el proyecto: ${proyectoData.titulo}`,
          'usuariosLogueados'
        );
        console.log('Notificación enviada exitosamente');
      } catch (notifError) {
        console.error('Error al enviar notificación:', notifError);
        // No detenemos el proceso si falla la notificación
      }
    } catch (error) {
      console.error('Error en createProyecto:', error);
      throw error;
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (this.validateFile(file)) {
        this.selectedFile = file;
        this.proyectoForm.patchValue({ image: file.name });
      } else {
        event.target.value = '';
        this.selectedFile = null;
        this.proyectoForm.patchValue({ image: '' });
      }
    }
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El proyecto ha sido creado correctamente.',
      buttons: [{
        text: 'OK',
        handler: () => {
          // Forzar recarga después de cerrar el alert
          window.location.reload();
        }
      }]
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
    this.proyectoForm.reset();
    this.selectedFile = null;
    this.documentosRequeridos.clear();
  }

  getCurrentDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
}
