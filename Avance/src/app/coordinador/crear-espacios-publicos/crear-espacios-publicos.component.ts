import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import { FcmService } from '../../service/Fcm.Service';

@Component({
  selector: 'app-crear-espacios-publicos',
  templateUrl: './crear-espacios-publicos.component.html',
  styleUrls: ['./crear-espacios-publicos.component.scss'],
})
export class CrearEspaciosPublicosComponent implements OnInit {
  espacioPublicoForm!: FormGroup;
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
    this.espacioPublicoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      ubicacion: ['', Validators.required],
      image: ['', Validators.required],
    });
  }

  async onSubmit() {
    if (this.espacioPublicoForm.valid && this.selectedFile) {
      try {
        // Mostrar loading
        const loading = await this.alertController.create({
          message: 'Subiendo espacio público...',
        });
        await loading.present();

        if (!this.validateFile(this.selectedFile)) {
          await loading.dismiss();
          return;
        }

        const espacioPublicoData = this.espacioPublicoForm.value;
        espacioPublicoData.fechaCreacion = this.getCurrentDate();
        const id = this.firestore.getId();
        espacioPublicoData.id = id;

        // Subir imagen primero
        try {
          const filePath = `espaciosPublicos/${Date.now()}_${this.selectedFile.name}`;
          const fileRef = this.storage.ref(filePath);
          const uploadTask = await this.storage.upload(filePath, this.selectedFile);
          const url = await fileRef.getDownloadURL().toPromise();
          console.log('URL de imagen obtenida:', url);
          espacioPublicoData.image = url;
        } catch (error) {
          console.error('Error en subida de imagen:', error);
          await loading.dismiss();
          this.showErrorAlert('Error al subir la imagen. Por favor, intente nuevamente.');
          return;
        }

        // Crear documento
        try {
          await this.createEspacioPublico(espacioPublicoData, id);
        } catch (error) {
          console.error('Error al crear espacio público:', error);
          await loading.dismiss();
          this.showErrorAlert('Error al crear el espacio público. Por favor, intente nuevamente.');
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
      this.showErrorAlert('Por favor, complete todos los campos y seleccione una imagen.');
    }
  }

  validateFile(file: File): boolean {
    console.log('Validando archivo:', file);
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!validTypes.includes(file.type)) {
      this.showErrorAlert('Solo se permiten archivos PNG o JPG/JPEG.');
      return false;
    }

    if (file.size > this.maxFileSize) {
      this.showErrorAlert('El archivo no debe superar los 5MB.');
      return false;
    }

    console.log('Archivo válido');
    return true;
  }

  async createEspacioPublico(espacioPublicoData: any, id: string) {
    try {
      const path = 'espaciosPublicos';
      await this.firestore.createDoc(espacioPublicoData, path, id);
      console.log('Documento creado exitosamente');

      // Enviar notificación solo si el documento se creó correctamente
      try {
        await this.fcmService.sendNotification(
          'Nuevo Espacio Público',
          `Se ha creado el espacio: ${espacioPublicoData.titulo}`,
          'usuariosLogueados'
        );
        console.log('Notificación enviada exitosamente');
      } catch (notifError) {
        console.error('Error al enviar notificación:', notifError);
        // No detenemos el proceso si falla la notificación
      }
    } catch (error) {
      console.error('Error en createEspacioPublico:', error);
      throw error;
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (this.validateFile(file)) {
        this.selectedFile = file;
        this.espacioPublicoForm.patchValue({ image: file.name });
      } else {
        event.target.value = '';
        this.selectedFile = null;
        this.espacioPublicoForm.patchValue({ image: '' });
      }
    }
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El espacio público ha sido creado correctamente.',
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
    this.espacioPublicoForm.reset();
    this.selectedFile = null;
  }

  getCurrentDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
