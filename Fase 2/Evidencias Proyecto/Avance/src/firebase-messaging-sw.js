// firebase-messaging-sw.js
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

  const notificationTitle = payload.notification?.title || 'Nueva Notificación';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva actualización.',
    icon: '/assets/icons/notification-icon.png', // Cambia a la ruta de tu ícono
    data: payload.data || {}, // Incluye datos adicionales como URLs
  };

  try {
    // Muestra la notificación al usuario
    self.registration.showNotification(notificationTitle, notificationOptions);
  } catch (err) {
    console.error('Error al mostrar la notificación:', err);
  }
});

// Maneja clics en las notificaciones
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notificación clickeada', event.notification);

  // Cierra la notificación
  event.notification.close();

  // Redirige al usuario a la URL especificada en el payload
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const targetUrl = event.notification.data?.url || '/';
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
