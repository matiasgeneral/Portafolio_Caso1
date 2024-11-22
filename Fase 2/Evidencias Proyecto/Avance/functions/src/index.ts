import * as functions from 'firebase-functions/v2';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

admin.initializeApp();

// Configurar CORS
const corsHandler = cors({ origin: true });

interface TopicData {
  token: string;
  topic: string;
}

interface NotificationData {
  title: string;
  body: string;
  topic: string;
}

export const subscribeToTopic = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { token, topic } = req.body;

      if (!token || !topic) {
        res.status(400).send('El token y el topic son requeridos.');
        return;
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

export const unsubscribeFromTopic = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { token, topic } = req.body;

      if (!token || !topic) {
        res.status(400).send('El token y el topic son requeridos.');
        return;
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

export const sendNotification = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { title, body, topic } = req.body;

      if (!title || !body || !topic) {
        res.status(400).send('El título, cuerpo y topic son requeridos.');
        return;
      }

      const message = {
        notification: {
          title: title,
          body: body,
        },
        android: {
          priority: "high" as const,
          notification: {
            channelId: 'default',
            sound: 'default'
          }
        },
        webpush: {
          headers: {
            Urgency: "high"
          },
          notification: {
            requireInteraction: true
          },
          fcm_options: {
            link: "/"
          }
        },
        topic: topic
      };

      console.log('Preparando para enviar la notificación:', message);

      const response = await admin.messaging().send(message);
      console.log('Notificación enviada exitosamente:', response);
      res.status(200).send({ message: 'Notificación enviada exitosamente', response });
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      res.status(500).send('Error al enviar la notificación');
    }
  });
});

export const notifyNewNews = onDocumentCreated('noticias/{newsId}', async (event) => {
  const newsId = event.params.newsId;
  console.log(`Se ha creado una nueva noticia con ID: ${newsId}`);

  try {
    const newsData = event.data;

    if (!newsData) {
      console.error(`No se encontró data en el documento de noticias con ID: ${newsId}`);
      return;
    }

    const title = newsData.data().title;
    if (!title) {
      console.error(`El campo "title" está ausente en la noticia con ID: ${newsId}`);
      return;
    }

    const message = {
      notification: {
        title: 'Nueva Noticia disponible',
        body: `Se ha publicado una nueva noticia: ${title}`,
      },
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'default',
          sound: 'default'
        }
      },
      webpush: {
        headers: {
          Urgency: "high"
        },
        notification: {
          requireInteraction: true
        }
      },
      topic: 'usuariosLogueados',
    };

    const response = await admin.messaging().send(message);
    console.log(`Notificación enviada exitosamente con ID: ${response}`);
  } catch (error) {
    console.error(`Error al enviar la notificación para la noticia con ID: ${newsId}`, error);
  }
});

export const notifyNewActivity = onDocumentCreated('actividades/{activityId}', async (event) => {
  try {
    console.log(`Activación de trigger para actividad con ID: ${event.params.activityId}`);
    
    const activityData = event.data?.data();
    console.log('Datos de la actividad:', activityData);
    
    if (!activityData?.titulo) {
      console.error('No se encontró título en la actividad');
      return;
    }

    const message = {
      notification: {
        title: 'Nueva Actividad disponible',
        body: `Se ha publicado una nueva actividad: ${activityData.titulo}`,
      },
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'default',
          sound: 'default'
        }
      },
      webpush: {
        headers: {
          Urgency: "high"
        },
        notification: {
          requireInteraction: true
        }
      },
      topic: 'usuariosLogueados',
    };

    const response = await admin.messaging().send(message);
    console.log('Notificación de actividad enviada:', response);
  } catch (error) {
    console.error('Error en notificación de actividad:', error);
  }
});

export const notifyNewSpace = onDocumentCreated('espaciosPublicos/{spaceId}', async (event) => {
  try {
    const spaceData = event.data?.data();
    if (!spaceData?.titulo) {
      console.error('No se encontró título en el espacio público');
      return;
    }

    const message = {
      notification: {
        title: 'Nuevo Espacio Público disponible',
        body: `Se ha publicado un nuevo espacio público: ${spaceData.titulo}`,
      },
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'default',
          sound: 'default'
        }
      },
      webpush: {
        headers: {
          Urgency: "high"
        },
        notification: {
          requireInteraction: true
        }
      },
      topic: 'usuariosLogueados',
    };

    const response = await admin.messaging().send(message);
    console.log('Notificación de espacio público enviada:', response);
  } catch (error) {
    console.error('Error en notificación de espacio público:', error);
  }
});

export const notifyNewProject = onDocumentCreated('proyectos/{projectId}', async (event) => {
  try {
    console.log(`Activación de trigger para proyecto con ID: ${event.params.projectId}`);
    
    const projectData = event.data?.data();
    console.log('Datos del proyecto:', projectData);
    
    if (!projectData?.titulo) {
      console.error('No se encontró título en el proyecto');
      return;
    }

    const message = {
      notification: {
        title: 'Nuevo Proyecto disponible',
        body: `Se ha publicado un nuevo proyecto: ${projectData.titulo}`,
      },
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'default',
          sound: 'default'
        }
      },
      webpush: {
        headers: {
          Urgency: "high"
        },
        notification: {
          requireInteraction: true
        }
      },
      topic: 'usuariosLogueados',
    };

    const response = await admin.messaging().send(message);
    console.log('Notificación de proyecto enviada:', response);
  } catch (error) {
    console.error('Error en notificación de proyecto:', error);
  }
});
