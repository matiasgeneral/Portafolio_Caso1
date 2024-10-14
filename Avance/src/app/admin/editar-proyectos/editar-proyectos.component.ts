import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  id: string | null = null; // Aquí almacenaremos el id de la actividad
  proyectoForm: FormGroup; // Formulario para editar la actividad
  selectedFile: File | null = null; // Archivo de imagen seleccionado
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: FirestoreService,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private alertController: AlertController
  ) {
    // Inicializar el formulario con los mismos campos del formulario de crear actividad
    this.proyectoForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      image: [''], // La imagen puede no estar presente inicialmente
    });
  }

  ngOnInit() {
    // Obtener el ID de la actividad desde los parámetros de la ruta
    this.route?.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) {

        // Cargar los detalles del proyecto y rellenar el formulario
        this.firestore.getDoc<any>('proyecto', this.id).subscribe(proyecto => {
          if (proyecto) {
            // Verificar si fechaEvento está definido
            if (proyecto.fechaInicio && proyecto.fechaFin) {
              // Asegurarse de que la fecha es un string y tiene un formato correcto
              if (typeof proyecto.fechaInicio && proyecto.fechaFin === 'string') {
                proyecto.fechaInicio = this.formatDateToDDMMYYYY(proyecto.fechaInicio);
                proyecto.fechaFin = this.formatDateToDDMMYYYY(proyecto.fechaFin);
              } else if (proyecto.fechaInicio && proyecto.fechaFin instanceof Date) {
                proyecto.fechaInicio = this.formatDateToDDMMYYYY(proyecto.fechaInicio); // Usar el método para formatear la fecha
                proyecto.fechaFin = this.formatDateToDDMMYYYY(proyecto.fechaFin); // Usar el método para formatear la fecha
              } else {
                console.error('Formato de fecha no válido:', proyecto.fechaInicio && proyecto.fechaFin);

              }
            } else {
              console.error('Fecha de evento no está definida en el proyecto:', proyecto);
            }

            // Rellenar el formulario con los datos actuales
            this.proyectoForm.patchValue(proyecto);
            console.log('Detalles de la actividad cargados:', proyecto);
          } else {
            console.error('Actividad no encontrada');
          }
        });
      }
    });
  }

  // Método para manejar la edición de la actividad
  async onSubmit() {
    if (this.proyectoForm.valid) {
      const proyectoData = this.proyectoForm.value;

      // Formatear la fecha al guardar
      proyectoData.fechaInicio = this.formatDateToDDMMYYYY(proyectoData.fechaInicio);
      proyectoData.fechaFin = this.formatDateToDDMMYYYY(proyectoData.fechaFin);
      // Si hay una imagen seleccionada, se sube a Firebase Storage
      if (this.selectedFile) {
        this.uploadImageAndUpdate(proyectoData);
      } else {
        // Si no se cambió la imagen, solo actualizamos el resto de los datos
        this.updateProyecto(proyectoData);
      }
    } else {
      console.log('El formulario no es válido');
    }
  }

    // Método para actualizar la actividad en Firestore
    async updateProyecto(proyectoData: any) {
      if (this.id && typeof this.id === 'string') {
        const path = 'proyecto';
        try {
          await this.firestore.updateDoc(proyectoData, path, this.id); // Actualizar los datos de la actividad
          this.showSuccessAlert();
          this.router.navigate(['/buscador-proyectos']); // Navegar a la lista de actividades después de editar
        } catch (error) {
          console.error('Error al actualizar el proyecto:', error);
        }
      } else {
        console.error('El ID del proyecto no es válido:', this.id);
      }
    }
      // Método para manejar la selección de imagen
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.proyectoForm.patchValue({ image: file.name });
    }
  }

    // Subir imagen a Firebase y luego actualizar la actividad
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

// Método para regresar a la lista de actividades
goBack() {
  this.router.navigate(['/buscador-proyectos']); // Asegúrate de que esta ruta sea correcta
}


// Método para formatear fecha a 'dd/mm/yyyy' en formato UTC
private formatDateToDDMMYYYY(date: string | Date): string {
const d = new Date(date);
const day = String(d.getUTCDate()).padStart(2, '0');
const month = String(d.getUTCMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
const year = d.getUTCFullYear();
return `${day}/${month}/${year}`;
}

}


