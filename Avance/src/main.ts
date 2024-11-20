import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));


  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registrado con scope:', registration.scope);
      }).catch((err) => {
        console.error('Error registrando el Service Worker:', err);
      });
  }