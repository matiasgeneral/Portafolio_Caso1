import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-editar-proyectos',
  templateUrl: './editar-proyectos.component.html',
  styleUrls: ['./editar-proyectos.component.scss'],
})
export class EditarProyectosComponent implements OnInit {
  id: string | null = null; // Almacena el ID del proyecto
  proyectoForm: FormGroup; // Formulario para editar el proyecto
  selectedFile: File | null = null; // Archivo de imagen seleccionado

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: FirestoreService,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private alertController: AlertController
  ) {
    // Inicializar el formulario
    this.proyectoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      image: [''], // La imagen puede no estar presente inicialmente
      documentosRequeridos: this.formBuilder.array([]), // FormArray para documentos
    });
  }

  // Getter para acceder al FormArray de documentosRequeridos
  get documentosRequeridos(): FormArray {
    return this.proyectoForm.get('documentosRequeridos') as FormArray;
  }

  ngOnInit() {
    // Obtener el ID del proyecto desde los parámetros de la ruta
    this.route?.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) {
        // Cargar los detalles del proyecto
        this.firestore.getDoc<any>('proyectos', this.id).subscribe(proyecto => {
          if (proyecto) {
            // Convertir fechas al formato ISO 'YYYY-MM-DD' para el formulario
            proyecto.fechaInicio = this.convertirFechaAFormatoISO(proyecto.fechaInicio);
            proyecto.fechaFin = this.convertirFechaAFormatoISO(proyecto.fechaFin);
            
            this.proyectoForm.patchValue(proyecto);
            // Rellenar el FormArray de documentosRequeridos
            proyecto.documentosRequeridos.forEach((doc: any) => {
              this.agregarDocumento(doc.nombre);
            });
          } else {
            console.error('Proyecto no encontrado');
          }
        });
      }
    });
  }

  // Agregar un nuevo FormGroup de documento al FormArray
  agregarDocumento(nombre: string = '') {
    const documentoForm = this.formBuilder.group({
      nombre: [nombre, Validators.required], // Nombre del documento
    });
    this.documentosRequeridos.push(documentoForm);
  }

  // Eliminar un documento del FormArray
  eliminarDocumento(index: number) {
    this.documentosRequeridos.removeAt(index);
  }

  // Manejar la edición del proyecto
  async onSubmit() {
    if (this.proyectoForm.valid) {
      const proyectoData = this.proyectoForm.value;

      // Las fechas ya están en formato ISO al cargar
      // Subir imagen si se ha seleccionado
      if (this.selectedFile) {
        this.uploadImageAndUpdate(proyectoData);
      } else {
        this.updateProyecto(proyectoData);
      }
    } else {
      console.log('El formulario no es válido');
    }
  }

  // Actualizar el proyecto en Firestore
  async updateProyecto(proyectoData: any) {
    if (this.id && typeof this.id === 'string') {
      const path = 'proyectos'; // Ruta correcta
      try {
        await this.firestore.updateDoc(proyectoData, path, this.id); // Actualizar datos del proyecto
        this.showSuccessAlert();
        this.router.navigate(['/buscador-proyectos']); // Navegar a la lista de proyectos después de editar
      } catch (error) {
        console.error('Error al actualizar el proyecto:', error);
      }
    } else {
      console.error('El ID del proyecto no es válido:', this.id);
    }
  }

  // Manejar la selección de imagen
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.proyectoForm.patchValue({ image: file.name });
    }
  }

  // Subir imagen a Firebase y luego actualizar el proyecto
  uploadImageAndUpdate(proyectoData: any) {
    const filePath = `proyecto/${this.selectedFile!.name}`;
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, this.selectedFile!);

    uploadTask
      .snapshotChanges()
      .pipe(
        finalize(async () => {
          try {
            const url = await fileRef.getDownloadURL().toPromise();
            proyectoData.image = url;
            this.updateProyecto(proyectoData);
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
      message: 'El proyecto ha sido actualizado correctamente.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Método para convertir fecha de 'DD/MM/YYYY' a 'YYYY-MM-DD'
  private convertirFechaAFormatoISO(fecha: string): string {
    const partes = fecha.split('/');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1]}-${partes[0]}`; // "YYYY-MM-DD"
    }
    return fecha; // Retornar la fecha original si no se puede convertir
  }

  // Método para formatear fecha a 'dd/mm/yyyy'
  private formatDateToDDMMYYYY(date: string | Date): string {
    const d = new Date(date);
    if (!isNaN(d.getTime())) { // Verificar que la fecha es válida
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }
    return ''; // Retornar una cadena vacía si la fecha es inválida
  }

  // Regresar a la lista de proyectos
  goBack() {
    this.router.navigate(['/buscador-proyectos']); // Asegúrate de que esta ruta sea correcta
  }
}
