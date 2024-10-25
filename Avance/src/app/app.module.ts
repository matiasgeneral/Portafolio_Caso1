import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';


import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment.prod';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { HomeComponent } from './home/home.component';
import { UserModule } from './user/user.module'; // Ensure this path is correct and the module is properly defined
import { AdminModule } from './admin/admin.module';
import { FormsModule } from '@angular/forms';
import { CoordinadorModule } from './coordinador/coordinador.module';
import { SecretarioModule } from './secretario/secretario.module';





@NgModule({
  declarations: [AppComponent, HomeComponent,

  ],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    HomeModule,
    UserModule, // Ensure this module is correctly defined and imported
    AdminModule,
    CoordinadorModule,
    SecretarioModule,

  ],

  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, { provide: LOCALE_ID, useValue: 'es-CL' },
  { provide: LocationStrategy, useClass: HashLocationStrategy },
  provideAnimations(), // * Agregue provideAnimations para proporcionar transiciones y animaciones suaves
  provideHttpClient(withInterceptorsFromDi()),],
  bootstrap: [AppComponent],
})
export class AppModule { }




