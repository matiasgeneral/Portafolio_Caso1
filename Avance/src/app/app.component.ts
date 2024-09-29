import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, signOut } from 'firebase/auth';
import { Router } from '@angular/router'; // Importa Router
import { auth } from './firebase-config'; // Asegúrate de ajustar la ruta según tu configuración
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false; // Valor inicial, se actualizará según el estado de autenticación
  public appPages = [
    //ESTOS SON PARA EL USUARIO NO LOGEADO
    { title: 'Home', url: './home', icon: 'home' },
    
    //ESTOS SON PARA EL USUARIO LOGEADO
    { title: 'Solicitud Certificado Residencia', url: './solicitud-certificado-residencia', icon: 'reader' },
    { title: 'Espacios públicos', url: './visualizacion-espacios-publicos', icon: 'basketball' },
    { title: 'Eventos', url: './visualizacion-eventos', icon: 'star' },
    { title: 'Proyectos', url: './visualizacion-proyectos', icon: 'heart' },
    { title: 'Noticias', url: './visualizacion-noticias', icon: 'newspaper' },
    {title: 'crear noticia', url: './crear-noticias', icon: 'newspaper'},
    { title: 'Ver usuarios(administrar)', url: './buscador-usuarios', icon: 'newspaper' },
    {title: 'Buscar noticias(administrar)' , url: './buscador-noticias', icon: 'newspaper'},
   
  ];

  public accountPages = [
    { title: 'Registrar cuenta', url: '/register', icon: 'person-add' },
    { title: 'Iniciar sesion', url: '/login', icon: 'log-in' },
  ];

  public accountMenuOpen = false;

  constructor(private router: Router) {} // Inyecta Router

  ngOnInit() {
    // Monitorea el estado de autenticación del usuario
    onAuthStateChanged(auth, (user) => {
      this.isLoggedIn = !!user; // Si hay un usuario, isLoggedIn será true
      if (this.isLoggedIn) {
        this.router.navigate(['/home']); // Redirige a home si está autenticado
      }
    });
  }

  toggleAccountMenu() {
    // Alterna el estado del menú de cuenta
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  toggleMenu() {
    // Lógica para alternar el menú
    console.log('Menu toggled'); // Puedes reemplazar esta línea con la lógica real que necesitas
  }

  logout() {
    // Cierra la sesión del usuario
    signOut(auth).then(() => {
      this.isLoggedIn = false; // Actualiza el estado de inicio de sesión
      this.router.navigate(['/home']); // Redirige a home después de cerrar sesión
    }).catch((error) => {
      console.error('Error al cerrar sesión:', error);
    });
  }
}
