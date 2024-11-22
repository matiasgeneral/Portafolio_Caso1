import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private accessToken = environment.mercadoPagoToken;
  
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
        success: `${environment.appUrl}/pagos/exitoso`,
        failure: `${environment.appUrl}/pagos/fallido`,
        pending: `${environment.appUrl}/pagos/pendiente`
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
