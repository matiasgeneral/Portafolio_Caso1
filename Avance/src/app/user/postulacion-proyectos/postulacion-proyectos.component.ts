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
    // Limpia el array antes de llenarlo
    documentosArray.clear();
    this.documentosRequeridos.forEach(doc => {
      documentosArray.push(this.fb.group({
        nombre: [doc.nombre, Validators.required], // Asegúrate de asignar el nombre correcto
        file: [null, Validators.required]
      }));
    });
  }

  async onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const filePath = `proyectos/${this.proyecto.id}/documentos/${this.userId}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      task.percentageChanges().subscribe(() => {
        this.loading = true;
      });

      await task.snapshotChanges().pipe(
        finalize(async () => {
          const downloadUrl = await fileRef.getDownloadURL().toPromise();
          const documentosArray = this.postulacionForm.get('documentos') as FormArray;
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

    // Verifica si todos los documentos han sido subidos
    const todosLosDocumentosSubidos = documentosArray.controls.every(doc => doc.get('file')?.value);
  
    // Log para ver qué documentos se han subido
    console.log('Documentos subidos:', documentosArray.controls.map(doc => doc.get('file')?.value));

    if (!todosLosDocumentosSubidos) {
      this.mostrarToast('Por favor, sube todos los documentos requeridos.');
      return;
    }

    this.fechaSolicitud = new Date().toLocaleDateString('es-ES');
    console.log('Fecha de solicitud:', this.fechaSolicitud);

    if (!this.proyecto) {
      console.error('El proyecto no está definido.');
      this.mostrarToast('El proyecto no está definido.');
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

      this.mostrarToast('Postulación enviada exitosamente.');

      // Reiniciar el formulario
      this.resetForm();

    } catch (error) {
      console.error('Error al enviar la postulación:', error);
      this.mostrarToast('Ocurrió un error al enviar la postulación.');
    }
  }

  resetForm() {
    // Limpiar el formulario de postulación
    this.postulacionForm.reset();
    // Volver a inicializar el array de documentos
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

 // Método para regresar   
 goBack() {
  this.router.navigate(['/visualizacion-proyectos']); // Asegúrate de que esta ruta sea correcta
}
}
