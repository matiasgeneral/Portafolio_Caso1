import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AdministrarUsuariosComponent } from './admin/administrar-usuarios/administrar-usuarios.component';
import { BuscadorUsuariosComponent } from './admin/buscador-usuarios/buscador-usuarios.component';
import { EditarUsuariosComponent } from './admin/editar-usuarios/editar-usuarios.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthModule)
  },
  {
    path: 'pagos',
    loadChildren: () => import('./pagos/pagos.module').then(m => m.PagosModule)
  },
  { path: 'administrar-usuarios/:rut', component: AdministrarUsuariosComponent },
  { path: 'buscador', component: BuscadorUsuariosComponent },
  { path: 'editar-usuarios/:rut', component: EditarUsuariosComponent }
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
