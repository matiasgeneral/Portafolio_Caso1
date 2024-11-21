import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private accessToken = 'APP_USR-5657629847525687-112112-5766f9f1263f255506ceba16a2705a64-689743348';
  
  constructor(private http: HttpClient) {}

  async crearEnlacePago(producto: {
    titulo: string,
    precio: number,
    cantidad: number
  }) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    });

    const preference = {
      items: [{
        title: producto.titulo,
        unit_price: producto.precio,
        quantity: producto.cantidad,
        currency_id: 'CLP'
      }],
      back_urls: {
        success: 'http://localhost:8100/pagos/exitoso',
        failure: 'http://localhost:8100/pagos/fallido',
        pending: 'http://localhost:8100/pagos/pendiente'
      },
      auto_return: "approved"
    };

    try {
      const response = await this.http.post(
        'https://api.mercadopago.com/checkout/preferences',
        preference,
        { headers }
      ).toPromise();

      if (response && typeof response === 'object' && 'init_point' in response) {
        return (response as { init_point: string }).init_point;
      } else {
        throw new Error('Invalid response from MercadoPago');
      }
    } catch (error) {
      console.error('Error en MercadoPago:', error);
      throw error;
    }
  }
}