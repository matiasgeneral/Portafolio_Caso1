import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/service/firestore.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-editar-actividades',
  templateUrl: './editar-actividades.component.html',
  styleUrls: ['./editar-actividades.component.scss'],
})
export class EditarActividadesComponent implements OnInit {
  id: string | null = null; // Aquí almacenaremos el id de la actividad
  actividadForm: FormGroup; // Formulario para editar la actividad
  selectedFile: File | null = null; // Archivo de imagen seleccionado
  maxParticipants: number = 999; // Máximo de participantes

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: FirestoreService,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private alertController: AlertController
  ) {
    // Inicializar el formulario
    this.actividadForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechaEvento: ['', Validators.required],
      horaEvento: ['', Validators.required],
      cantidadMax: ['', [Validators.required, Validators.max(this.maxParticipants)]],
      image: [''], // La imagen puede no estar presente inicialmente
    });
  }

  ngOnInit() {
    // Obtener el ID de la actividad desde los parámetros de la ruta
    this.route?.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) {
        // Cargar los detalles de la actividad y rellenar el formulario
        this.firestore.getDoc<any>('actividades', this.id).subscribe(actividades => {
          if (actividades) {
            // Verificar si fechaEvento está definido
            if (actividades.fechaEvento) {
              let formattedDate: string | null = null; // Variable para almacenar la fecha formateada

              

              // Asignar la fecha formateada al formulario
              if (formattedDate) {
                actividades.fechaEvento = formattedDate;
              } else {
                console.error('Error al formatear la fecha de evento:', actividades.fechaEvento);
              }
            } else {
              console.error('Fecha de evento no está definida en la actividad:', actividades);
            }

            // Rellenar el formulario con los datos actuales
            this.actividadForm.patchValue(actividades);
            console.log('Detalles de la actividad cargados:', actividades);
          } else {
            console.error('Actividad no encontrada');
          }
        });
      }
    });
  }

  // Método para manejar la edición de la actividad
  async onSubmit() {
    if (this.actividadForm.valid) {
      const actividadData = this.actividadForm.value;

     
      // Si hay una imagen seleccionada, se sube a Firebase Storage
      if (this.selectedFile) {
        this.uploadImageAndUpdate(actividadData);
      } else {
        // Si no se cambió la imagen, solo actualizamos el resto de los datos
        this.updateActividad(actividadData);
      }
    } else {
      console.log('El formulario no es válido');
    }
  }

  // Método para actualizar la actividad en Firestore
  async updateActividad(actividadData: any) {
    if (this.id && typeof this.id === 'string') {
      const path = 'actividades';
      try {
        await this.firestore.updateDoc(actividadData, path, this.id); // Actualizar los datos de la actividad
        this.showSuccessAlert();
        this.router.navigate(['/buscador-actividades']); // Navegar a la lista de actividades después de editar
      } catch (error) {
        console.error('Error al actualizar la actividad:', error);
      }
    } else {
      console.error('El ID de la actividad no es válido:', this.id);
    }
  }

  // Método para manejar la selección de imagen
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.actividadForm.patchValue({ image: file.name });
    }
  }

  // Subir imagen a Firebase y luego actualizar la actividad
  uploadImageAndUpdate(actividadData: any) {
    const filePath = `actividades/${this.selectedFile!.name}`;
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, this.selectedFile!);

    uploadTask
      .snapshotChanges()
      .pipe(
        finalize(async () => {
          try {
            const url = await fileRef.getDownloadURL().toPromise();
            actividadData.image = url;
            this.updateActividad(actividadData);
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
      message: 'La actividad ha sido actualizada correctamente.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Método para regresar a la lista de actividades
  goBack() {
    this.router.navigate(['/buscador-actividades']); // Asegúrate de que esta ruta sea correcta
  }


}
