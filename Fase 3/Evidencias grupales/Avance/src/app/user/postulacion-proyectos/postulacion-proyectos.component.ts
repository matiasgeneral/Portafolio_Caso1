import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-postulacion-proyectos',
  templateUrl: './postulacion-proyectos.component.html',
  styleUrls: ['./postulacion-proyectos.component.scss'],
})
export class PostulacionProyectosComponent implements OnInit {
  proyecto: any;
  nombreSolicitante: string = '';
  postulacionForm: FormGroup;
  documentosRequeridos: any[] = [];
  loading = false;
  userId = '';
  fechaSolicitud: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private toastController: ToastController,
    private storage: AngularFireStorage
  ) {
    this.postulacionForm = this.fb.group({
      documentos: this.fb.array([], Validators.required)
    });
  }

  ngOnInit() {
    const proyectoId = this.route.snapshot.paramMap.get('id');
    if (proyectoId) {
      this.cargarProyecto(proyectoId);
    } else {
      console.error('No se encontró el ID del proyecto.');
    }
    this.obtenerNombreSolicitante();
  }

  cargarProyecto(id: string) {
    this.firestoreService.getDoc<any>('proyectos', id).subscribe(proyectoData => {
      if (proyectoData) {
        this.proyecto = proyectoData;
        this.documentosRequeridos = proyectoData.documentosRequeridos;
        this.populateDocumentosForm();
      } else {
        console.error('No se encontró el proyecto con ID:', id);
      }
    });
  }

  obtenerNombreSolicitante() {
    this.authService.stateAuth().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.firestoreService.getDoc<any>('usuarios', this.userId).subscribe(userData => {
          if (userData) {
            this.nombreSolicitante = `${userData.nombre} ${userData.apellidoPaterno} ${userData.apellidoMaterno}`;
          } else {
            console.error('No se encontró información del usuario.');
          }
        });
      } else {
        console.error('No hay usuario autenticado.');
      }
    });
  }

  populateDocumentosForm() {
    const documentosArray = this.postulacionForm.get('documentos') as FormArray;
    documentosArray.clear();
    this.documentosRequeridos.forEach(doc => {
      documentosArray.push(this.fb.group({
        nombre: [doc.nombre, Validators.required],
        file: [null, Validators.required]
      }));
    });
  }

  async onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    const maxSizeMB = 6; // Límite de tamaño de archivo de 6 MB
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Limpiar el campo del archivo antes de validar
    const documentosArray = this.postulacionForm.get('documentos') as FormArray;
    documentosArray.at(index).patchValue({ file: null });

    if (file) {
      // Validar el tipo de archivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.mostrarToast('Solo se permiten archivos PDF, JPG o PNG.');
        return;
      }

      // Validar el tamaño del archivo
      if (file.size > maxSizeBytes) {
        this.mostrarToast(`El archivo debe ser menor a ${maxSizeMB} MB.`);
        return;
      }

      const filePath = `proyectos/${this.proyecto.id}/documentos/${this.userId}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      task.percentageChanges().subscribe(() => {
        this.loading = true;
      });

      await task.snapshotChanges().pipe(
        finalize(async () => {
          const downloadUrl = await fileRef.getDownloadURL().toPromise();
          documentosArray.at(index).patchValue({ file: downloadUrl });
          this.loading = false;
        })
      ).toPromise();
    }
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
    });
    await toast.present();
  }

  async postular() {
    const documentosArray = this.postulacionForm.get('documentos') as FormArray;

    // Validación de documentos subidos
    const todosLosDocumentosSubidos = documentosArray.controls.every(doc => {
      const file = doc.get('file')?.value;
      return file != null; // Comprobamos que el archivo no sea null
    });

    if (!todosLosDocumentosSubidos) {
      this.mostrarToast('Por favor, sube todos los documentos requeridos.');
      return;
    }

    this.fechaSolicitud = new Date().toLocaleDateString('es-ES');

    if (!this.proyecto) {
      console.error('El proyecto no está definido.');
      this.mostrarToast('El proyecto no está definido.');
      return;
    }

    // Verificar si el usuario ya postuló al proyecto
    const yaPostulo = this.proyecto.postulantes?.some((postulante: any) => postulante.uid === this.userId);
    if (yaPostulo) {
      this.mostrarToast('Ya has postulado a este proyecto anteriormente.');
      return;
    }

    const postulante = {
      uid: this.userId,
      nombre: this.nombreSolicitante,
      fechaSolicitud: this.fechaSolicitud,
      documentosSubidos: this.postulacionForm.value.documentos.map((doc: any, index: number) => ({
        documentoId: `doc_${index + 1}`,
        nombre: this.documentosRequeridos[index].nombre,
        url: doc.file
      }))
    };

    try {
      await this.firestoreService.updateDoc({
        postulantes: firebase.firestore.FieldValue.arrayUnion(postulante)
      }, 'proyectos', this.proyecto.id);

      // Mostrar mensaje de éxito
      const toast = await this.toastController.create({
        message: 'Postulación enviada exitosamente. será dirigido a la pagina anterior',
        duration: 2000,
        position: 'middle',
      });
      await toast.present();

      // Redirigir a la página anterior después de 2 segundos
      setTimeout(() => {
        this.goBack();
      }, 1000);

      this.resetForm();

    } catch (error) {
      console.error('Error al enviar la postulación:', error);
      this.mostrarToast('Ocurrió un error al enviar la postulación.');
    }
  }

  resetForm() {
    this.postulacionForm.reset();
    this.populateDocumentosForm();
  }

  get documentosArray() {
    return this.postulacionForm.get('documentos') as FormArray;
  }

  formatDate(date: string): string {
    if (date && date.includes('-')) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    } else if (date && date.includes('/')) {
      return date;
    }
    return 'Fecha no disponible';
  }

  obtenerFechaActual(): string {
    const fecha = new Date();
    const opciones = { year: 'numeric' as const, month: '2-digit' as const, day: '2-digit' as const, timeZone: 'UTC' };
    const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
    return fechaFormateada.split('/').reverse().join('-');
  }

  goBack() {
    this.router.navigate(['/visualizacion-proyectos']);
  }
}
