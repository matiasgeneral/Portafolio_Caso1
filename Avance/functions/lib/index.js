"use strict";
// functions/src/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyNewNews = exports.sendNotification = exports.helloWorld = exports.unsubscribeFromTopic = exports.subscribeToTopic = void 0;
const functions = require("firebase-functions/v2");
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

// Inicializamos la aplicación de administrador de Firebase
admin.initializeApp();

/**
 * Función para suscribir un token a un topic específico.
 */
exports.subscribeToTopic = functions.https.onCall(async (request) => {
    const { token, topic } = request.data;
    if (!token || !topic) {
        throw new functions.https.HttpsError('invalid-argument', 'El token y el topic son requeridos.');
    }
    try {
        const response = await admin.messaging().subscribeToTopic(token, topic);
        console.log(`Token ${token} suscrito al topic ${topic}:`, response);
        return { message: `Suscripción exitosa al topic ${topic}` };
    }
    catch (error) {
        console.error('Error al suscribir al topic:', error);
        throw new functions.https.HttpsError('unknown', 'Error al suscribir al topic', error);
    }
});

/**
 * Función para desuscribir un token de un topic específico.
 */
exports.unsubscribeFromTopic = functions.https.onCall(async (request) => {
    const { token, topic } = request.data;
    if (!token || !topic) {
        throw new functions.https.HttpsError('invalid-argument', 'El token y el topic son requeridos.');
    }
    try {
        const response = await admin.messaging().unsubscribeFromTopic(token, topic);
        console.log(`Token ${token} desuscrito del topic ${topic}:`, response);
        return { message: `Desuscripción exitosa del topic ${topic}` };
    }
    catch (error) {
        console.error('Error al desuscribir del topic:', error);
        throw new functions.https.HttpsError('unknown', 'Error al desuscribir del topic', error);
    }
});

/**
 * Función de ejemplo: Responde con un saludo.
 */
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("¡Hola desde Firebase!");
});

/**
 * Función para enviar una notificación a un topic específico.
 */
exports.sendNotification = functions.https.onCall(async (request) => {
    const { title, body, topic } = request.data;
    if (!title || !body || !topic) {
        throw new functions.https.HttpsError('invalid-argument', 'El título, cuerpo y topic son requeridos.');
    }
    try {
        const message = {
            notification: {
                title: title,
                body: body,
            },
            topic: topic,
        };
        console.log('Preparando para enviar la notificación:', message);
        const response = await admin.messaging().send(message);
        console.log('Notificación enviada exitosamente:', response);
        return { message: 'Notificación enviada exitosamente', response };
    }
    catch (error) {
        console.error('Error al enviar la notificación:', error);
        throw new functions.https.HttpsError('unknown', 'Error al enviar la notificación', error);
    }
});

/**
 * Función para Notificar la Creación de Nuevas Noticias.
 */
exports.notifyNewNews = (0, firestore_1.onDocumentCreated)('noticias/{newsId}', async (event) => {
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
        const notificationTitle = 'Nueva Noticia Disponible';
        const notificationBody = `Se ha publicado una nueva noticia: ${title}`;
        const topic = 'usuariosLogueados';
        const message = {
            notification: {
                title: notificationTitle,
                body: notificationBody,
            },
            topic: topic,
        };
        console.log(`Preparando para enviar la notificación a topic "${topic}" para la noticia "${title}"`);
        const response = await admin.messaging().send(message);
        console.log(`Notificación enviada exitosamente con ID: ${response}`);
    }
    catch (error) {
        console.error(`Error al enviar la notificación para la noticia con ID: ${newsId}`, error);
    }
});
