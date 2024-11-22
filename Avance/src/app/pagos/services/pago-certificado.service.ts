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
  paymentId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoCertificadoService {
  private accessToken = environment.mercadoPagoToken;

  constructor(
    private firestore: AngularFirestore,
    private http: HttpClient
  ) {}

  /**
   * Inicia el proceso de pago y registro del certificado
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
          paymentId: response.id
        };

        await this.guardarRegistroCertificado(registro);
        return response.init_point;
      } 
      throw new Error('Error al crear el enlace de pago');
    } catch (error) {
      console.error('Error en el proceso de iniciar pago:', error);
      throw error;
    }
  }

  /**
   * Guarda el certificado en Firestore
   */
  private async guardarRegistroCertificado(registro: RegistroCertificado) {
    return this.firestore.collection('certificados').add(registro);
  }

  /**
   * Obtiene un certificado por su ID de preferencia
   */
  async obtenerCertificadoPorPreferenceId(preferenceId: string) {
    const snapshot = await this.firestore
      .collection('certificados')
      .ref.where('paymentId', '==', preferenceId)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data() as RegistroCertificado
      };
    }
    return null;
  }

  /**
   * Actualiza el certificado con el PDF y marca como pagado
   */
  async actualizarCertificadoConPDF(certificadoId: string, pdfBase64: string) {
    return this.firestore
      .collection('certificados')
      .doc(certificadoId)
      .update({
        pdfDocumento: pdfBase64,
        estado: 'pagado',
        fechaPago: new Date()
      });
  }

  /**
   * Verifica si el pago fue exitoso basado en la URL de retorno
   */
  verificarPagoExitoso(url: string): boolean {
    return url.includes('congrats/approved');
  }

  /**
   * Actualiza el estado del pago en Firestore usando la URL de retorno
   */
  async actualizarEstadoPagoDesdeUrl(url: string) {
    if (this.verificarPagoExitoso(url)) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const paymentId = urlParams.get('preference-id') || urlParams.get('preference_id');

      if (paymentId) {
        await this.actualizarEstadoPago(paymentId, 'pagado');
      } else {
        throw new Error('No se pudo encontrar el paymentId en la URL proporcionada');
      }
    }
  }

  /**
   * Actualiza el estado del pago en Firestore
   */
  async actualizarEstadoPago(paymentId: string, estado: 'pendiente' | 'pagado' | 'cancelado') {
    const snapshot = await this.firestore
      .collection('certificados')
      .ref.where('paymentId', '==', paymentId)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await this.firestore.collection('certificados').doc(doc.id).update({
        estado,
        fechaPago: estado === 'pagado' ? new Date() : null
      });
    } else {
      throw new Error('No se encontró el certificado con el paymentId proporcionado');
    }
  }
}
