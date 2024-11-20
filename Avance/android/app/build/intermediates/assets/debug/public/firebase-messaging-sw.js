// Importa las librerías de Firebase necesarias
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Inicializa Firebase en el Service Worker
firebase.initializeApp({
    apiKey: "AIzaSyBWD_S-ixA0gQn6pWEMQl81Juvj6FlU1F0",
    authDomain: "sistema-unidad-terrritorial.firebaseapp.com",
    projectId: "sistema-unidad-terrritorial",
    storageBucket: "sistema-unidad-terrritorial.appspot.com",
    messagingSenderId: "110154609263",
    appId: "1:110154609263:web:07ffec8194534c5fca539a"
});

const messaging = firebase.messaging();

// Maneja mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Recibió mensaje en segundo plano', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // Se elimina la referencia al ícono ya que no lo estamos usando
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});