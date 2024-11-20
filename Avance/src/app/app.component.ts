import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, signOut } from 'firebase/auth';
import { Router } from '@angular/router';
import { auth } from './firebase-config';
import { Title } from '@angular/platform-browser';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { FcmService } from './service/Fcm.Service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  userRole: string = '';
  userStatus: string = '';
  public appPages: { title: string; url: string; icon: string }[] = [];
  public accountPages = [
    { title: 'Registrar cuenta', url: '/register', icon: 'person-add' },
    { title: 'Iniciar sesión', url: '/login', icon: 'log-in' },
  ];
  public accountMenuOpen = false;

  constructor(
    private router: Router, 
    private fcmService: FcmService
  ) { }

  ngOnInit() {
    // Inicializar FCM antes de monitorear la autenticación
    this.initializeFCM();
    
    // Monitorea el estado de autenticación del usuario
    onAuthStateChanged(auth, async (user) => {
      this.isLoggedIn = !!user;
      if (this.isLoggedIn && user) {
        await this.loadUserRole(user.uid);
        this.setupPagesByRole();
        this.router.navigate(['/home']);
      } else {
        this.resetMenu();
      }
    });
  }

  private async initializeFCM() {
    try {
      await this.fcmService.requestPermission();
      console.log('FCM inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar FCM:', error);
    }
  }

  async loadUserRole(uid: string) {
    const db = getFirestore();
    console.log('UID del usuario:', uid);
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.userRole = userData["rol"];
        this.userStatus = userData["estado"];
        console.log('Datos del usuario:', userData);
      } else {
        console.log('No se encontró el documento del usuario'); 
      }
    } catch (error) {
      console.error('Error al cargar el rol del usuario:', error);
    }
  }

  setupPagesByRole() {
    if (this.userStatus === 'Pendiente') {
      this.appPages = this.getUserPendientePages();
    } else {
      switch (this.userRole) {
        case 'Administrador':
          this.appPages = this.getAdminPages();
          break;
        case 'Coordinador':
          this.appPages = this.getCoordinadorPages();
          break;
        case 'Secretario':
          this.appPages = this.getSecretaryPages();
          break;
        case 'Usuario Registrado':
          this.appPages = this.getUserRegistradoPages();
          break;
        default:
          this.appPages = this.getUserPages();
          break;
      }
    }
  }

  resetMenu() {
    this.userRole = '';
    this.appPages = this.getUserPages();
  }

  getAdminPages() {
    return [
      { title: 'Home', url: './home', icon: 'home' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
      { title: 'Espacios públicos', url: './visualizacion-espacios-publicos', icon: 'basketball' },
      { title: 'Actividades', url: './visualizacion-eventos', icon: 'star' },
      { title: 'Proyectos', url: './visualizacion-proyectos', icon: 'star' },
      { title: 'Solicitud Certificado Residencia', url: './solicitud-certificado-residencia', icon: 'reader' },
      { title: 'Crear noticia', url: './crear-noticias', icon: 'newspaper' },
      { title: 'Crear actividades', url: './crear-actividades', icon: 'heart' },
      { title: 'Crear Espacios públicos', url: './crear-espacios-publicos', icon: 'flower' },
      { title: 'Crear Proyectos', url: './crear-proyectos', icon: 'star' },
      { title: 'Buscar usuarios', url: './buscador-usuarios', icon: 'id-card' },
      { title: 'Buscar noticias', url: './buscador-noticias', icon: 'file-tray-full' },
      { title: 'Buscar actividades', url: './buscador-actividades', icon: 'search' },
      { title: 'Buscar espacios públicos', url: './buscador-espacios-publicos', icon: 'search' },
      { title: 'Buscar proyectos', url: './buscador-proyectos', icon: 'search' },
      { title: 'Perfil', url: './perfil', icon: 'person-circle' },
    ];
  }

  getCoordinadorPages() {
    return [
      { title: 'Home', url: './home', icon: 'home' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
      { title: 'Espacios públicos', url: './visualizacion-espacios-publicos', icon: 'basketball' },
      { title: 'Actividades', url: './visualizacion-eventos', icon: 'star' },
      { title: 'Proyectos', url: './visualizacion-proyectos', icon: 'star' },
      { title: 'Crear noticia', url: './crear-noticias', icon: 'newspaper' },
      { title: 'Crear actividades', url: './crear-actividades', icon: 'heart' },
      { title: 'Crear Espacios públicos', url: './crear-espacios-publicos', icon: 'flower' },
      { title: 'Crear Proyectos', url: './crear-proyectos', icon: 'star' },
      { title: 'Buscar usuarios', url: './buscador-usuarios', icon: 'id-card' },
      { title: 'Buscar noticias', url: './buscador-noticias', icon: 'file-tray-full' },
      { title: 'Buscar actividades', url: './buscador-actividades', icon: 'search' },
      { title: 'Buscar espacios públicos', url: './buscador-espacios-publicos', icon: 'search' },
      { title: 'Buscar proyectos', url: './buscador-proyectos', icon: 'search' },
      { title: 'Perfil', url: './perfil', icon: 'person-circle' },
    ];
  }

  getSecretaryPages() {
    return [
      { title: 'Home', url: './home', icon: 'home' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
      { title: 'Espacios públicos', url: './visualizacion-espacios-publicos', icon: 'basketball' },
      { title: 'Actividades', url: './visualizacion-eventos', icon: 'star' },
      { title: 'Proyectos', url: './visualizacion-proyectos', icon: 'star' },
      { title: 'Solicitudes de registros usuarios nuevos', url: './lista-registros-usuarios', icon: 'person-add' },
      { title: 'Solicitudes de espacios públicos', url: './lista-solicitudes-espacios-publicos', icon: 'list' },
      { title: 'Solicitudes de proyectos', url: './lista-solicitudes-proyectos', icon: 'list' },
      { title: 'Solicitud Certificado Residencia', url: './solicitud-certificado-residencia', icon: 'reader' },
      { title: 'Perfil', url: './perfil', icon: 'person-circle' },
    ];
  }

  getUserRegistradoPages() {
    return [
      { title: 'Home', url: './home', icon: 'home' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
      { title: 'Espacios públicos', url: './visualizacion-espacios-publicos', icon: 'basketball' },
      { title: 'Actividades', url: './visualizacion-eventos', icon: 'star' },
      { title: 'Proyectos', url: './visualizacion-proyectos', icon: 'star' },
      { title: 'Solicitud Certificado Residencia', url: './solicitud-certificado-residencia', icon: 'reader' },
      { title: 'Perfil', url: './perfil', icon: 'person-circle' },
    ];
  }

  getUserPendientePages() {
    return [
      { title: 'Home', url: './home', icon: 'home' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
      { title: 'Perfil', url: './perfil', icon: 'person-circle' },
    ];
  }

  getUserPages() {
    return [
      { title: 'Home', url: './home', icon: 'home' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
    ];
  }

  toggleAccountMenu() {
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  logout() {
    signOut(auth).then(() => {
      this.isLoggedIn = false;
      this.router.navigate(['/login']);
      this.resetMenu();
    }).catch((error) => {
      console.error('Error al cerrar sesión:', error);
    });
  }

  async processPayment() {
    try {
      const paymentResponse = await this.fcmService.transbankPayment(
        1000,
        'buyOrder123',
        'sessionId456',
        'https://tusitio.com/return'
      );
      console.log('Respuesta de Transbank:', paymentResponse);
      window.location.href = paymentResponse.url;
    } catch (error) {
      console.error('Error al procesar el pago:', error);
    }
  }
}