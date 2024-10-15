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
      if (this.isLoggedIn) {
        if (user) {
          await this.loadUserRole(user.uid); // Carga el rol del usuario
        }
        this.setupPagesByRole(); // Configura las páginas según el rol
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
      const userDoc = await getDoc(doc(db, 'Usuario', uid)); // Cambiar 'users' a 'Usuario'
      if (userDoc.exists()) {
        const userData = userDoc.data(); // Obtener todos los datos del usuario
        this.userRole = userData["rol"]; // Asigna el rol del usuario a la variable
        // Imprimir los datos del usuario
        console.log('Datos del usuario:', userData); // Imprime todos los datos del usuario
      } else {
        console.log('No se encontró el documento del usuario'); // Mensaje original
      }
    } catch (error) {
      console.error('Error al cargar el rol del usuario:', error);
    }
  }

  setupPagesByRole() {
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

  resetMenu() {
    this.userRole = ''; // Limpia el rol del usuario
    this.appPages = this.getUserPages(); // Resetea las opciones a las predeterminadas
  }

  getAdminPages() {
    return [
      { title: 'Crear noticia', url: './crear-noticias', icon: 'newspaper' },
      { title: 'Crear actividades', url: './crear-actividades', icon: 'heart' },
      { title: 'Crear Espacios públicos', url: './crear-espacios-publicos', icon: 'flower' },
      { title: 'Crear Proyectos', url: './crear-proyectos', icon: 'star' },
      { title: ' ', url: '', icon: 'star' },

      { title: 'Buscar usuarios (administrar)', url: './buscador-usuarios', icon: 'id-card' },
      { title: 'Buscar noticias (administrar)', url: './buscador-noticias', icon: 'file-tray-full' },
      { title: 'Buscador actividades (administrar)', url: './buscador-actividades', icon: 'search' },
      { title: 'Buscador espacios públicos (administrar)', url: './buscador-espacios-publicos', icon: 'search' },
      { title: 'Buscador de proyectos (administrar)', url: './buscador-proyectos', icon: 'search' },
      { title: ' ', url: '', icon: 'star' },

    ];
  }

  getCoordinadorPages() {
    return [
      { title: 'Crear noticia', url: './crear-noticias', icon: 'newspaper' },
      { title: 'Crear actividades', url: './crear-actividades', icon: 'heart' },
      { title: 'Crear Espacios públicos', url: './crear-espacios-publicos', icon: 'flower' },
      { title: 'Crear Proyectos', url: './crear-proyectos', icon: 'star' },
      { title: ' ', url: '', icon: 'star' },

      { title: 'Buscar usuarios (administrar)', url: './buscador-usuarios', icon: 'id-card' },
      { title: 'Buscar noticias (administrar)', url: './buscador-noticias', icon: 'file-tray-full' },
      { title: 'Buscador actividades (administrar)', url: './buscador-actividades', icon: 'search' },
      { title: 'Buscador espacios públicos (administrar)', url: './buscador-espacios-publicos', icon: 'search' },
      { title: 'Buscador de proyectos (administrar)', url: './buscador-proyectos', icon: 'search' },
      { title: ' ', url: '', icon: 'star' },


      // Agregar otras páginas específicas para Coordinador
    ];
  }

  getSecretaryPages() {
    return [
      { title: 'Home', url: './home', icon: 'home' },
      // Agregar otras páginas específicas para Secretario
    ];
  }

  getUserRegistradoPages() {
    return [
      { title: 'Home', url: './home', icon: 'home' },
      { title: 'Solicitud Certificado Residencia', url: './solicitud-certificado-residencia', icon: 'reader' },
      { title: 'Espacios públicos', url: './visualizacion-espacios-publicos', icon: 'basketball' },
      { title: 'Eventos', url: './visualizacion-eventos', icon: 'star' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },

      // Agregar otras páginas específicas para Usuario Registrado
    ];
  }

  getUserPages() {
    return [
      { title: 'Home', url: './home', icon: 'home' },
      { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
      // Agregar otras páginas específicas para usuarios no registrados
    ];
  }

  toggleAccountMenu() {
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  toggleMenu() {
    console.log('Menu toggled'); 
  }

  logout() {
    signOut(auth).then(() => {
      this.isLoggedIn = false; 
      this.resetMenu(); // Resetear menú al cerrar sesión
      this.router.navigate(['/home']); 
    }).catch((error) => {
      console.error('Error al cerrar sesión:', error);
    });
  }
}
