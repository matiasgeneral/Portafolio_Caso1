import { Injectable } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

interface MessagePayload {
  notification: {
    title: string;
    body: string;
  };
  data?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root',
})
export class FcmService {
  private currentMessage = new BehaviorSubject<MessagePayload | null>(null);
  private vapidKey = 'cXlOGwthEKvF6QsJm2QjNcEJIBmzT8R8z8zefDgHwok';
  platform: Platform;

  constructor(private afFunctions: AngularFireFunctions, platform: Platform) {
    this.platform = platform;
    this.setupPlatformSpecificListeners();
  }

  get messages() {
    return this.currentMessage.asObservable();
  }

  private async setupPlatformSpecificListeners() {
    if (Capacitor.isNativePlatform() && this.platform.is('android')) {
      // Si está en una plataforma nativa Android
      console.log('Plataforma Android detectada');
      await this.requestPermission();
    } else if (!Capacitor.isNativePlatform()) {
      // Si está en web
      console.log('Ejecutando en la web, no se registrarán notificaciones push nativas.');
    }
  }

  async requestPermission() {
    if (!Capacitor.isNativePlatform()) {
      // Evitar solicitud de permisos en web
      return;
    }
    try {
      const result = await PushNotifications.requestPermissions();
      if (result.receive === 'granted') {
        await PushNotifications.register();
        this.setupListeners();
        console.log('Permisos concedidos y app registrada para notificaciones');
      } else {
        console.error('Permiso de notificaciones denegado');
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
    }
  }

  private setupListeners() {
    // Registro del token
    PushNotifications.addListener('registration', async (token) => {
      console.log('Token FCM:', token.value);
      try {
        const callable = this.afFunctions.httpsCallable('subscribeToTopic');
        await callable({ token: token.value, topic: 'usuariosLogueados' }).toPromise();
      } catch (error) {
        console.error('Error al suscribir al tema:', error);
      }
    });

    // Notificación recibida con app en primer plano
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notificación recibida:', notification);
      const messagePayload: MessagePayload = {
        notification: {
          title: notification.title || 'Sin título',
          body: notification.body || 'Sin contenido',
        },
        data: notification.data,
      };
      this.currentMessage.next(messagePayload);
    });

    // Usuario tocó la notificación
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Notificación tocada:', notification.notification);
    });

    // Error en las notificaciones
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error en registro de notificaciones:', error);
    });
  }

  async sendNotification(title: string, body: string, topic: string): Promise<void> {
    try {
      if (!title.trim() || !body.trim() || !topic.trim()) {
        throw new Error('El título, el cuerpo y el tema son obligatorios.');
      }

      const callable = this.afFunctions.httpsCallable('sendNotification');
      const response = await callable({
        title,
        body,
        topic,
      }).toPromise();

      console.log('Notificación enviada:', response);
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      throw error;
    }
  }
}
