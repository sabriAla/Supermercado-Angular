import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL, USAR_MOCK } from '../config';
import { ProductoService } from './producto.service';

export interface DetalleFactura {
  id?: number;
  facturaId?: number;
  productoId: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Factura {
  id?: number;
  fecha?: string;
  cliente: string;
  total: number;
  detalles: DetalleFactura[];
}

export interface FacturaAgregar {
  detalles: { productoId: number; cantidad: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class FacturaService {

  private URL_RESOURCE = `${API_URL}/api/facturacion`;

  private mock: Factura[] = [];

  constructor(private http: HttpClient, private productoService: ProductoService) { }

  getFacturas(): Observable<Factura[]> {
    if (USAR_MOCK) return of(structuredClone(this.mock));
    return this.http.get<Factura[]>(`${this.URL_RESOURCE}/facturas`).pipe(
      map(lista => (lista ?? []).map(f => ({
        ...f,
        total: Number(f.total ?? 0),
        detalles: f.detalles ?? []
      })))
    );
  }

  registrarFactura(factura: Factura, detallesVenta?: FacturaAgregar['detalles']): Observable<void> {
    if (USAR_MOCK) {
      const id = this.mock.length + 1;
      this.mock.push({
        ...factura,
        id,
        fecha: new Date().toISOString()
      });
      this.productoService.descontarStockMock(factura.detalles);
      return of(void 0);
    }

    const payload: FacturaAgregar = {
      detalles: (detallesVenta ?? factura.detalles).map(d => ({
        productoId: d.productoId,
        cantidad: d.cantidad
      }))
    };

    return this.http.put<void>(`${this.URL_RESOURCE}/agregar`, payload);
  }
}
