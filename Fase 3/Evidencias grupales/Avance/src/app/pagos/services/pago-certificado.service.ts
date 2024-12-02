import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

/**
 * Interfaz para el registro de certificados
 */
interface RegistroCertificado {
  uid: string; // ID del usuario
  nombreCompleto: string; // Nombre completo del solicitante
  rut: string; // RUT del solicitante
  direccion: string; // Dirección del solicitante
  fechaSolicitud: Date; // Fecha de solicitud del certificado
  fechaPago: Date | null; // Fecha en que se realizó el pago
  pdfDocumento: string; // Documento PDF en base64
  estado: 'pendiente' | 'pagado' | 'cancelado'; // Estado del certificado
  precio: number; // Precio del certificado
  paymentId: string; // ID de referencia del pago MercadoPago
  mercadoPagoData?: any; // Datos adicionales de MercadoPago
}

@Injectable({
  providedIn: 'root',
})
export class PagoCertificadoService {
  private accessToken = environment.mercadoPagoToken;
  private appUrlWithHash = `${environment.appUrl}/#`;

  constructor(
    private firestore: AngularFirestore,
    private http: HttpClient
  ) {}

  /**
   * Inicia el proceso de pago y registra el certificado en Firestore
   * @param usuario Datos del usuario que solicita el certificado
   * @returns URL para redirigir al pago
   */
  async iniciarPago(usuario: any): Promise<string> {
    const datosPago = {
      titulo: 'Certificado de Residencia',
      precio: 1000,
      cantidad: 1,
    };

    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      });

      const appUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:8100'  // Para entorno local
        : 'https://sistema-unidad-terrritorial.web.app';  // Para producción

      const response = await this.http
        .post<any>(
          'https://api.mercadopago.com/checkout/preferences',
          {
            items: [
              {
                title: datosPago.titulo,
                unit_price: datosPago.precio,
                quantity: datosPago.cantidad,
                currency_id: 'CLP',
              },
            ],
            back_urls: {
              failure: `${appUrl}/#/pagos/fallido`,
              pending: `${appUrl}/#/pagos/pendiente`,
              success: `${appUrl}/#/pagos/verificacion`,
            },
            auto_return: 'approved',
          },
          { headers }
        )
        .toPromise();

      if (response?.init_point && response?.id) {
        const registro: RegistroCertificado = {
          uid: usuario.uid,
          nombreCompleto: `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`,
          rut: usuario.rut,
          direccion: usuario.direccion,
          fechaSolicitud: new Date(),
          fechaPago: null,
          pdfDocumento: '',
          estado: 'pendiente',
          precio: datosPago.precio,
          paymentId: response.id,
          mercadoPagoData: response,
        };

        await this.guardarRegistroCertificado(registro);
        return response.init_point;
      } else {
        throw new Error('No se pudo generar el enlace de pago');
      }
    } catch (error) {
      console.error('Error al iniciar el pago:', error);
      throw error;
    }
  }

  /**
   * Guarda el certificado en Firestore
   * @param registro Datos del certificado a guardar
   * @returns Promesa con el resultado de la operación
   */
  private async guardarRegistroCertificado(
    registro: RegistroCertificado
  ): Promise<void> {
    await this.firestore.collection('certificados').add(registro);
  }

  /**
   * Obtiene un certificado por su ID de preferencia
   * @param preferenceId ID de preferencia de MercadoPago
   * @returns Certificado encontrado o null
   */
  async obtenerCertificadoPorPreferenceId(preferenceId: string): Promise<any> {
    const snapshot = await this.firestore
      .collection('certificados')
      .ref.where('paymentId', '==', preferenceId)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...(doc.data() as object),
      };
    }
    return null;
  }

  /**
   * Actualiza el estado de un certificado
   * @param preferenceId ID de preferencia
   * @param estado Estado nuevo ('pendiente', 'pagado', 'cancelado')
   */
  async actualizarEstadoPago(preferenceId: string, estado: 'pendiente' | 'pagado' | 'cancelado'): Promise<void> {
    try {
      const snapshot = await this.firestore
        .collection('certificados')
        .ref.where('paymentId', '==', preferenceId)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        await this.firestore.collection('certificados').doc(doc.id).update({
          estado,
          fechaPago: estado === 'pagado' ? new Date() : null,
        });
        console.log('Estado actualizado en Firestore.');
      } else {
        throw new Error('No se encontró el certificado asociado al preferenceId proporcionado.');
      }
    } catch (error) {
      console.error('Error al actualizar el estado en Firestore:', error);
      throw error;
    }
  }

  /**
   * Verifica si el pago fue exitoso según la URL de retorno
   * @param url URL de retorno de MercadoPago
   */
  verificarPagoExitoso(url: string): boolean {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const collectionStatus = urlParams.get('collection_status');
    return collectionStatus === 'approved';
  }

  /**
   * Actualiza el estado del pago basándose en la URL de retorno
   * @param url URL de retorno de MercadoPago
   */
  async actualizarEstadoPagoDesdeUrl(url: string): Promise<void> {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const paymentId = urlParams.get('payment_id') || urlParams.get('preference_id');
    const collectionStatus = urlParams.get('collection_status');

    if (paymentId) {
      const estado = collectionStatus === 'approved' ? 'pagado' : 'pendiente';
      await this.actualizarEstadoPago(paymentId, estado);
    } else {
      throw new Error('No se pudo encontrar el paymentId o preferenceId en la URL proporcionada.');
    }
  }

  /**
   * Obtiene el estado de un pago según su paymentId
   * @param paymentId ID del pago en Mercado Pago
   * @returns Estado del pago ('pending', 'approved', 'cancelled', etc.) o null si no se encuentra
   */
  async obtenerEstadoPago(paymentId: string): Promise<string | null> {
    try {
      const snapshot = await this.firestore
        .collection('certificados')
        .ref.where('paymentId', '==', paymentId)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data() as RegistroCertificado;
        return data.estado || null;
      } else {
        console.warn(`No se encontró un certificado con el paymentId: ${paymentId}`);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el estado del pago:', error);
      throw new Error('Error al consultar el estado del pago en Firestore.');
    }
  }
}
