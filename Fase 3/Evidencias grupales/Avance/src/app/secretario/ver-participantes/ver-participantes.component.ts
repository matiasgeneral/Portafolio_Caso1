import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/service/firestore.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-ver-participantes',
  templateUrl: './ver-participantes.component.html',
  styleUrls: ['./ver-participantes.component.scss'],
})
export class VerParticipantesComponent implements OnInit {
  proyecto: any;
  participantes: any[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const proyectoId = this.route.snapshot.paramMap.get('id');
    if (proyectoId) {
      this.cargarProyecto(proyectoId);
    } else {
      console.error('No se encontró el ID del proyecto');
    }
  }

  cargarProyecto(id: string) {
    this.firestoreService.getDoc<any>('proyectos', id).subscribe(proyecto => {
      this.proyecto = proyecto;
      this.cargarParticipantes();
    });
  }

  cargarParticipantes() {
    this.participantes = [];
  
    if (this.proyecto && this.proyecto.postulantes) {
      this.proyecto.postulantes.forEach((postulante: any) => {
        this.firestoreService.getDoc<any>('usuarios', postulante.uid).subscribe(usuario => {
          if (usuario) {
            const participanteConDatos = {
              ...postulante,
              rut: usuario.rut,
              email: usuario.email,
              telefono: usuario.telefono
            };
            this.participantes.push(participanteConDatos);
          }
        });
      });
    }
  }

  async confirmarEliminacion(uid: string, index: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar a este participante?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarParticipante(uid, index);
          }
        }
      ]
    });
    await alert.present();
  }

  eliminarParticipante(uid: string, index: number) {
    // Remover del array localmente
    this.participantes.splice(index, 1);

    // Filtrar la lista de postulantes en el proyecto para eliminar el UID específico
    const nuevosPostulantes = this.proyecto.postulantes.filter((postulante: any) => postulante.uid !== uid);
    
    // Actualizar el documento en Firestore
    this.firestoreService.updateDoc({ postulantes: nuevosPostulantes }, 'proyectos', this.proyecto.id)
      .then(() => {
        this.presentToast('Participante eliminado correctamente');
      })
      .catch(error => {
        console.error('Error al eliminar participante en Firestore:', error);
        this.presentToast('Error al eliminar participante');
      });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'success'
    });
    toast.present();
  }

  goBack() {
    this.router.navigate(['/lista-solicitudes-proyectos']);
  }
}
