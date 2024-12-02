import * as functions from 'firebase-functions/v2';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

admin.initializeApp();

// Configurar CORS para aceptar solo tus dominios
const corsHandler = cors({
  origin: ['https://sistema-unidad-terrritorial.web.app', 'https://sistema-unidad-terrritorial.firebaseapp.com'], // Dominios permitidos
  methods: ['GET', 'POST'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados necesarios
  credentials: true, // Habilitar envío de cookies si es necesario
});

interface TopicData {
  token: string;
  topic: string;
}

interface NotificationData {
  title: string;
  body: string;
  topic: string;
  url?: string; // URL opcional para redirección
}

// Suscribirse a un tema
export const subscribeToTopic = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).send('Método no permitido.');
    }

    try {
      const { token, topic }: TopicData = req.body;

      if (!token || !topic) {
        return res.status(400).send('El token y el topic son requeridos.');
      }

      const response = await admin.messaging().subscribeToTopic(token, topic);
      console.log(`Token ${token} suscrito al topic ${topic}:`, response);
      res.status(200).send({ message: `Suscripción exitosa al topic ${topic}` });
    } catch (error) {
      console.error('Error al suscribir al topic:', error);
      res.status(500).send('Error al suscribir al topic');
    }
  });
});

// Desuscribirse de un tema
export const unsubscribeFromTopic = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).send('Método no permitido.');
    }

    try {
      const { token, topic }: TopicData = req.body;

      if (!token || !topic) {
        return res.status(400).send('El token y el topic son requeridos.');
      }

      const response = await admin.messaging().unsubscribeFromTopic(token, topic);
      console.log(`Token ${token} desuscrito del topic ${topic}:`, response);
      res.status(200).send({ message: `Desuscripción exitosa del topic ${topic}` });
    } catch (error) {
      console.error('Error al desuscribir del topic:', error);
      res.status(500).send('Error al desuscribir del topic');
    }
  });
});

// Enviar notificación
export const sendNotification = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).send('Método no permitido.');
    }

    try {
      const { title, body, topic, url }: NotificationData = req.body;

      if (!title || !body || !topic) {
        return res.status(400).send('El título, cuerpo y topic son requeridos.');
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: {
          url: url || '/', // URL opcional para redirección
        },
        android: {
          priority: 'high' as const,
          notification: {
            channelId: 'default',
            sound: 'default',
          },
        },
        webpush: {
          headers: {
            Urgency: 'high',
          },
          notification: {
            requireInteraction: true,
          },
          fcm_options: {
            link: url || '/',
          },
        },
        topic,
      };

      const response = await admin.messaging().send(message);
      console.log('Notificación enviada exitosamente:', response);
      res.status(200).send({ message: 'Notificación enviada exitosamente', response });
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      res.status(500).send('Error al enviar la notificación');
    }
  });
});

// Función para manejar la creación de noticias en Firestore
export const notifyNewNews = onDocumentCreated('noticias/{newsId}', async (event) => {
  const newsData = event.data?.data();
  if (!newsData?.title) {
    console.error('No se encontró el título de la noticia.');
    return;
  }

  const message = {
    notification: {
      title: 'Nueva Noticia disponible',
      body: `Se ha publicado una nueva noticia: ${newsData.title}`,
    },
    data: {
      url: './visualizacion-noticias', // Ruta correspondiente a Noticias
    },
    android: {
      priority: 'high' as const,
      notification: {
        channelId: 'default',
        sound: 'default',
      },
    },
    webpush: {
      headers: {
        Urgency: 'high',
      },
      notification: {
        requireInteraction: true,
      },
    },
    topic: 'usuariosLogueados',
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notificación enviada exitosamente:', response);
  } catch (error) {
    console.error('Error al enviar la notificación:', error);
  }
});

// Función para manejar la creación de actividades en Firestore
export const notifyNewActivity = onDocumentCreated('actividades/{activityId}', async (event) => {
  const activityData = event.data?.data();
  if (!activityData?.titulo) {
    console.error('No se encontró el título de la actividad.');
    return;
  }

  const message = {
    notification: {
      title: 'Nueva Actividad disponible',
      body: `Se ha publicado una nueva actividad: ${activityData.titulo}`,
    },
    data: {
      url: './visualizacion-eventos', // Ruta correspondiente a Actividades
    },
    android: {
      priority: 'high' as const,
      notification: {
        channelId: 'default',
        sound: 'default',
      },
    },
    webpush: {
      headers: {
        Urgency: 'high',
      },
      notification: {
        requireInteraction: true,
      },
    },
    topic: 'usuariosLogueados',
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notificación enviada exitosamente:', response);
  } catch (error) {
    console.error('Error al enviar la notificación:', error);
  }
});

// Función para manejar la creación de espacios públicos en Firestore
export const notifyNewSpace = onDocumentCreated('espaciosPublicos/{spaceId}', async (event) => {
  const spaceData = event.data?.data();
  if (!spaceData?.titulo) {
    console.error('No se encontró el título del espacio público.');
    return;
  }

  const message = {
    notification: {
      title: 'Nuevo Espacio Público disponible',
      body: `Se ha publicado un nuevo espacio público: ${spaceData.titulo}`,
    },
    data: {
      url: './visualizacion-espacios-publicos', // Ruta correspondiente a Espacios Públicos
    },
    android: {
      priority: 'high' as const,
      notification: {
        channelId: 'default',
        sound: 'default',
      },
    },
    webpush: {
      headers: {
        Urgency: 'high',
      },
      notification: {
        requireInteraction: true,
      },
    },
    topic: 'usuariosLogueados',
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notificación enviada exitosamente:', response);
  } catch (error) {
    console.error('Error al enviar la notificación:', error);
  }
});

// Función para manejar la creación de proyectos en Firestore
export const notifyNewProject = onDocumentCreated('proyectos/{projectId}', async (event) => {
  const projectData = event.data?.data();
  if (!projectData?.titulo) {
    console.error('No se encontró el título del proyecto.');
    return;
  }

  const message = {
    notification: {
      title: 'Nuevo Proyecto disponible',
      body: `Se ha publicado un nuevo proyecto: ${projectData.titulo}`,
    },
    data: {
      url: './visualizacion-proyectos', // Ruta correspondiente a Proyectos
    },
    android: {
      priority: 'high' as const,
      notification: {
        channelId: 'default',
        sound: 'default',
      },
    },
    webpush: {
      headers: {
        Urgency: 'high',
      },
      notification: {
        requireInteraction: true,
      },
    },
    topic: 'usuariosLogueados',
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notificación enviada exitosamente:', response);
  } catch (error) {
    console.error('Error al enviar la notificación:', error);
  }
});
