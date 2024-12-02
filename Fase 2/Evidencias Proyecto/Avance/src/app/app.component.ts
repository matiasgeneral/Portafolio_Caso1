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
  public appPages: ({ title: string; url: string; icon: string } | { type: string; title: string; url?: string; icon?: string })[] = [];
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
      // Inicio
      { title: 'Home', url: './home', icon: 'home' },
  
      // Sección de Visualización
      { type: 'divider', title: 'VISUALIZACIÓN' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
      { title: 'Espacios públicos', url: './visualizacion-espacios-publicos', icon: 'basketball' },
      { title: 'Actividades', url: './visualizacion-eventos', icon: 'calendar' },
      { title: 'Proyectos', url: './visualizacion-proyectos', icon: 'folder-open' },
  
      // Sección de Creación
      { type: 'divider', title: 'CREACIÓN' },
      { title: 'Crear noticia', url: './crear-noticias', icon: 'create' },
      { title: 'Crear actividades', url: './crear-actividades', icon: 'add-circle' },
      { title: 'Crear Espacios públicos', url: './crear-espacios-publicos', icon: 'add-circle' },
      { title: 'Crear Proyectos', url: './crear-proyectos', icon: 'add-circle' },
  
      // Sección de Búsqueda
      { type: 'divider', title: 'BÚSQUEDA' },
      { title: 'Buscar usuarios', url: './buscador-usuarios', icon: 'people' },
      { title: 'Buscar noticias', url: './buscador-noticias', icon: 'newspaper' },
      { title: 'Buscar actividades', url: './buscador-actividades', icon: 'calendar' },
      { title: 'Buscar espacios públicos', url: './buscador-espacios-publicos', icon: 'location' },
      { title: 'Buscar proyectos', url: './buscador-proyectos', icon: 'folder' },
  
      // Sección de Usuario y Documentos
      { type: 'divider', title: 'PERFIL Y DOCUMENTOS' },
      { title: 'Perfil', url: './perfil', icon: 'person-circle' },
      { title: 'Solicitud Certificado Residencia', url: './solicitud-certificado-residencia', icon: 'document-text' },
      { title: 'Buscar Documento', url: './buscar-documento', icon: 'search' }
    ];
  }

  getCoordinadorPages() {
    return [
      // Inicio
      { title: 'Home', url: './home', icon: 'home' },
  
      // Sección de Visualización
      { type: 'divider', title: 'VISUALIZACIÓN' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
      { title: 'Espacios públicos', url: './visualizacion-espacios-publicos', icon: 'basketball' },
      { title: 'Actividades', url: './visualizacion-eventos', icon: 'calendar' },
      { title: 'Proyectos', url: './visualizacion-proyectos', icon: 'folder-open' },
  
      // Sección de Creación
      { type: 'divider', title: 'CREACIÓN' },
      { title: 'Crear noticia', url: './crear-noticias', icon: 'create' },
      { title: 'Crear actividades', url: './crear-actividades', icon: 'add-circle' },
      { title: 'Crear Espacios públicos', url: './crear-espacios-publicos', icon: 'add-circle' },
      { title: 'Crear Proyectos', url: './crear-proyectos', icon: 'add-circle' },
  
      // Sección de Solicitudes
      { type: 'divider', title: 'Solicitudes' },
      { title: 'Solicitudes de registros usuarios nuevos', url: './lista-registros-usuarios', icon: 'person-add' },
      { title: 'Solicitudes de proyectos', url: './lista-solicitudes-proyectos', icon: 'list' },
     
      // Sección de Búsqueda
      { type: 'divider', title: 'BÚSQUEDA' },
      { title: 'Buscar usuarios', url: './buscador-usuarios', icon: 'people' },
      { title: 'Buscar noticias', url: './buscador-noticias', icon: 'newspaper' },
      { title: 'Buscar actividades', url: './buscador-actividades', icon: 'calendar' },
      { title: 'Buscar espacios públicos', url: './buscador-espacios-publicos', icon: 'location' },
      { title: 'Buscar proyectos', url: './buscador-proyectos', icon: 'folder' },
  
      // Sección de Usuario y Documentos
      { type: 'divider', title: 'PERFIL Y DOCUMENTOS' },
      { title: 'Perfil', url: './perfil', icon: 'person-circle' },
      { title: 'Solicitud Certificado Residencia', url: './solicitud-certificado-residencia', icon: 'document-text' },
      { title: 'Buscar Documento', url: './buscar-documento', icon: 'search' }
    ];
  }

  getSecretaryPages() {
    return [
      // Inicio
      { title: 'Home', url: './home', icon: 'home' },
  
      // Sección de Visualización
      { type: 'divider', title: 'VISUALIZACIÓN' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
      { title: 'Espacios públicos', url: './visualizacion-espacios-publicos', icon: 'basketball' },
      { title: 'Actividades', url: './visualizacion-eventos', icon: 'calendar' },
      { title: 'Proyectos', url: './visualizacion-proyectos', icon: 'folder-open' },

      { type: 'divider', title: 'Solicitudes' },
      { title: 'Solicitudes de registros usuarios nuevos', url: './lista-registros-usuarios', icon: 'person-add' },
      { title: 'Solicitudes de proyectos', url: './lista-solicitudes-proyectos', icon: 'list' },
     
      { type: 'divider', title: 'PERFIL Y DOCUMENTOS' },
      { title: 'Solicitud Certificado Residencia', url: './solicitud-certificado-residencia', icon: 'reader' },
      { title: 'Perfil', url: './perfil', icon: 'person-circle' },
      {title: 'Buscar Documento', url: './buscar-documento', icon: 'search'}
    ];
  }

  getUserRegistradoPages() {
    return [
      { title: 'Home', url: './home', icon: 'home' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
      { title: 'Espacios públicos', url: './visualizacion-espacios-publicos', icon: 'basketball' },
      { title: 'Actividades', url: './visualizacion-eventos', icon: 'star' },
      { title: 'Proyectos', url: './visualizacion-proyectos', icon: 'star' },
      { type: 'divider', title: 'PERFIL Y DOCUMENTOS' },
      { title: 'Solicitud Certificado Residencia', url: './solicitud-certificado-residencia', icon: 'reader' },
      { title: 'Perfil', url: './perfil', icon: 'person-circle' },
      {title: 'Buscar Documento', url: './buscar-documento', icon: 'search'}
    ];
  }

  getUserPendientePages() {
    return [
      { title: 'Home', url: './home', icon: 'home' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
      { title: 'Perfil', url: './perfil', icon: 'person-circle' },
      {title: 'Buscar Documento', url: './buscar-documento', icon: 'search'}
    ];
  }

  getUserPages() {
    return [
      { title: 'Home', url: './home', icon: 'home' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
      {title: 'Buscar Documento', url: './buscar-documento', icon: 'search'}
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

  
}