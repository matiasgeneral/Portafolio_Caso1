import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
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
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import { environment } from 'src/environments/environment.prod';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { HomeComponent } from './home/home.component';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { FormsModule } from '@angular/forms';
import { CoordinadorModule } from './coordinador/coordinador.module';
import { SecretarioModule } from './secretario/secretario.module';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [
    AppComponent, 
    HomeComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireMessagingModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireFunctionsModule, // Añadido para las Cloud Functions
    FormsModule,
    AuthModule,
    HomeModule,
    UserModule,
    AdminModule,
    CoordinadorModule,
    SecretarioModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'es-CL' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }