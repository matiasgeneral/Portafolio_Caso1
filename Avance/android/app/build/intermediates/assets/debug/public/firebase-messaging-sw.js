importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBWD_S-ixA0gQn6pWEMQl81Juvj6FlU1F0",
    authDomain: "sistema-unidad-terrritorial.firebaseapp.com",
    projectId: "sistema-unidad-terrritorial",
    storageBucket: "sistema-unidad-terrritorial.appspot.com",
    messagingSenderId: "110154609263",
    appId: "1:110154609263:web:07ffec8194534c5fca539a"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Recibió mensaje en segundo plano', payload);
  try {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      data: payload.data || {},
      requireInteraction: true
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  } catch (error) {
    console.error('Error mostrando notificación:', error);
  }
});