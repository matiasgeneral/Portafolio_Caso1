// pago-certificado.service.ts

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MercadoPagoService } from './mercadopago.service';

interface Usuario {
  uid: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rut: string;
  direccion: string;
  documento: string;
  foto: string;
  email: string;
  telefono: string;
  estado: 'pendiente' | 'activo';
  rol: string;
}

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
}

@Injectable({
  providedIn: 'root'
})
export class PagoCertificadoService {
  constructor(
    private firestore: AngularFirestore,
    private mercadoPagoService: MercadoPagoService
  ) {}

  /**
   * Procesa pago y registro del certificado
   * @param usuario Datos del usuario solicitante
   * @param pdfBase64 Certificado en formato Base64
   */
  async procesarPagoYRegistro(usuario: Usuario, pdfBase64: string) {
    const datosPago = {
      titulo: "Certificado de Residencia",
      precio: 1000,
      cantidad: 1
    };

    try {
      const urlPago = await this.mercadoPagoService.crearEnlacePago(datosPago);
      
      // Registro del certificado
      const registro: RegistroCertificado = {
        uid: usuario.uid,
        nombreCompleto: `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`,
        rut: usuario.rut,
        direccion: usuario.direccion,
        fechaSolicitud: new Date(),
        fechaPago: null,
        pdfDocumento: pdfBase64,
        estado: 'pendiente',
        precio: 1000
      };

      await this.guardarRegistroCertificado(registro);
      return urlPago;
    } catch (error) {
      console.error('Error en el proceso:', error);
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
}