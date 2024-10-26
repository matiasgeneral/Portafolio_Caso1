import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, signOut } from 'firebase/auth';
import { Router } from '@angular/router';
import { auth } from './firebase-config';
import { Title } from '@angular/platform-browser';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  userRole: string = ''; // Variable para almacenar el rol del usuario
  userStatus: string = ''; // Variable para almacenar el estado del usuario
  public appPages: { title: string; url: string; icon: string }[] = [];

  public accountPages = [
    { title: 'Registrar cuenta', url: '/register', icon: 'person-add' },
    { title: 'Iniciar sesión', url: '/login', icon: 'log-in' },
  ];

  public accountMenuOpen = false;

  constructor(private router: Router) { }

  ngOnInit() {
    // Monitorea el estado de autenticación del usuario
    onAuthStateChanged(auth, async (user) => {
      this.isLoggedIn = !!user; // Si hay un usuario, isLoggedIn será true
      if (this.isLoggedIn && user) {
        await this.loadUserRole(user.uid); // Carga el rol y estado del usuario
        this.setupPagesByRole(); // Configura las páginas según el rol y estado
        this.router.navigate(['/home']); // Redirige a home si está autenticado
      } else {
        this.resetMenu(); // Resetea el menú si el usuario no está autenticado
      }
    });
  }

  async loadUserRole(uid: string) {
    const db = getFirestore();
    console.log('UID del usuario:', uid); // Imprime el UID para verificar
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', uid)); // Cargar el documento del usuario
      if (userDoc.exists()) {
        const userData = userDoc.data(); // Obtener los datos del usuario
        this.userRole = userData["rol"]; // Asigna el rol del usuario a la variable
        this.userStatus = userData["estado"]; // Asigna el estado del usuario (activo o pendiente)
        console.log('Datos del usuario:', userData); // Imprime los datos del usuario para verificar
      } else {
        console.log('No se encontró el documento del usuario'); 
      }
    } catch (error) {
      console.error('Error al cargar el rol del usuario:', error);
    }
  }

  setupPagesByRole() {
    // Si el usuario está pendiente, mostrar solo el menú básico
    if (this.userStatus === 'Pendiente') {
      this.appPages = this.getUserPages(); // Mostrar opciones limitadas
    } else {
      // Configura las páginas según el rol del usuario
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
          this.appPages = this.getUserPages(); // Para usuarios no registrados o roles desconocidos
          break;
      }
    }
  }

  resetMenu() {
    this.userRole = ''; // Limpia el rol del usuario
    this.appPages = this.getUserPages(); // Resetea las opciones a las predeterminadas
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
      {title: 'Perfil', url: './perfil', icon: 'person-circle'},
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
      {title: 'Perfil', url: './perfil', icon: 'person-circle'},
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
      {title: 'Perfil', url: './perfil', icon: 'person-circle'},
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
      {title: 'Perfil', url: './perfil', icon: 'person-circle'},
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
      this.resetMenu(); // Resetea el menú al salir
    }).catch((error) => {
      console.error('Error al cerrar sesión:', error);
    });
  }
}
