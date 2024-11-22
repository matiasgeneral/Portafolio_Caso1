// src/app/pagos/services/pago-certificado.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface RegistroCertificado {
  uid: string;
  nombreCompleto: string;
  rut: string;
  direccion: string;
  fechaSolicitud: Date;
  fechaPago: Date | null;
  pdfDocumento: string;
  estado: 'pendiente' | 'pagado' | 'cancelado';
  precio: number;
  paymentId?: string; // ID del pago de Mercado Pago
  mercadoPagoData?: any; // Datos recibidos de Mercado Pago
}

interface MercadoPagoStatus {
  status: string;
  auto_return: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoCertificadoService {
  private accessToken = environment.mercadoPagoToken; // Reemplazar con tu Access Token de Mercado Pago

  constructor(
    private firestore: AngularFirestore,
    private http: HttpClient
  ) {}

  /**
   * Inicia el proceso de pago y registro del certificado (sin generar el PDF)
   * @param usuario Datos del usuario solicitante
   */
  async iniciarPago(usuario: any) {
    const datosPago = {
      titulo: "Certificado de Residencia",
      precio: 1000,
      cantidad: 1
    };

    try {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      });

      const response = await this.http.post<any>(
        'https://api.mercadopago.com/checkout/preferences',
        {
          items: [{
            title: datosPago.titulo,
            unit_price: datosPago.precio,
            quantity: datosPago.cantidad,
            currency_id: 'CLP'
          }],
          back_urls: {
            success: `${environment.appUrl}/pagos/verificacion`,
            failure: `${environment.appUrl}/pagos/fallido`,
            pending: `${environment.appUrl}/pagos/pendiente`
          },
          auto_return: "approved"
        },
        { headers }
      ).toPromise();

      if (response && response.init_point && response.id) {
        // Registro del certificado
        const registro: RegistroCertificado = {
          uid: usuario.uid,
          nombreCompleto: `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`,
          rut: usuario.rut,
          direccion: usuario.direccion,
          fechaSolicitud: new Date(),
          fechaPago: null,
          pdfDocumento: '',
          estado: 'pendiente',
          precio: 1000,
          paymentId: response.id,
          mercadoPagoData: response // Guardar todos los datos recibidos de Mercado Pago
        };

        await this.guardarRegistroCertificado(registro);
        return response.init_point;
      } else {
        throw new Error('Error al crear el enlace de pago: estructura de respuesta no esperada');
      }
    } catch (error) {
      console.error('Error en el proceso de iniciar pago:', error);
      throw error;
    }
  }

  /**
   * Guarda el registro del certificado
   * @param registro Datos del certificado a guardar
   */
  private async guardarRegistroCertificado(registro: RegistroCertificado) {
    return this.firestore.collection('certificados').add(registro);
  }

  /**
   * Verificar el estado del pago en Mercado Pago
   * @param paymentId ID del pago generado por Mercado Pago
   */
  async verificarEstadoPago(paymentId: string): Promise<MercadoPagoStatus> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`
    });

    try {
      const response = await this.http.get<any>(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers }
      ).toPromise();

      console.log('Respuesta completa de Mercado Pago al verificar estado:', response);

      if (!response || !response.status) {
        throw new Error('No se pudo obtener el estado del pago');
      }
      return { status: response.status, auto_return: response.auto_return };
    } catch (error) {
      console.error('Error al verificar el estado del pago:', error);
      throw error;
    }
  }

  /**
   * Manejar notificación de Mercado Pago
   * @param paymentId ID del pago de Mercado Pago
   */
  async manejarNotificacionPago(paymentId: string) {
    try {
      const pagoStatus = await this.verificarEstadoPago(paymentId);

      if (pagoStatus.auto_return === 'approved') {
        const certificados = await this.obtenerCertificadoPorPaymentId(paymentId);
        if (certificados.length > 0) {
          await this.actualizarEstadoPago(certificados[0].id, 'pagado');
          // Generar el PDF del certificado aquí
          await this.actualizarDocumentoCertificado(certificados[0].id, { pdfDocumento: 'URL_DEL_PDF_GENERADO' });
        }
      }
    } catch (error) {
      console.error('Error al manejar la notificación de pago:', error);
    }
  }

  /**
   * Obtener certificado por ID del pago
   * @param paymentId ID del pago de Mercado Pago
   */
  async obtenerCertificadoPorPaymentId(paymentId: string) {
    try {
      const snapshot = await this.firestore.collection('certificados', ref => ref.where('paymentId', '==', paymentId)).get().toPromise();
      if (snapshot && !snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }));
      } else {
        throw new Error('No se pudo obtener el certificado: no se encontraron documentos con el paymentId proporcionado');
      }
    } catch (error) {
      console.error('Error al obtener el certificado por paymentId:', error);
      throw error;
    }
  }

  /**
   * Actualiza estado del pago
   * @param certificadoId ID del certificado
   * @param estado Nuevo estado
   */
  async actualizarEstadoPago(certificadoId: string, estado: 'pagado' | 'cancelado') {
    return this.firestore
      .collection('certificados')
      .doc(certificadoId)
      .update({
        estado,
        fechaPago: estado === 'pagado' ? new Date() : null
      });
  }

  /**
   * Actualizar el documento del certificado
   * @param certificadoId ID del certificado
   * @param data Datos a actualizar (por ejemplo, PDF generado)
   */
  async actualizarDocumentoCertificado(certificadoId: string, data: any) {
    try {
      return this.firestore.collection('certificados').doc(certificadoId).update(data);
    } catch (error) {
      console.error('Error al actualizar el documento del certificado:', error);
      throw error;
    }
  }
  async actualizarEstadoPagoPorPreferenceId(preferenceId: string, estado: 'pagado' | 'cancelado') {
    try {
      const snapshot = await this.firestore.collection('certificados', ref => ref.where('paymentId', '==', preferenceId)).get().toPromise();
      if (!snapshot || snapshot.empty) {
        throw new Error('No se encontró el certificado asociado al paymentId proporcionado.');
      }
  
      const certificadoId = snapshot.docs[0].id;
      return this.firestore
        .collection('certificados')
        .doc(certificadoId)
        .update({
          estado,
          fechaPago: estado === 'pagado' ? new Date() : null
        });
    } catch (error) {
      console.error('Error al actualizar el estado del pago:', error);
      throw error;
    }
  }
}
