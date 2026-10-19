import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL, USAR_MOCK } from '../config';

export type Categoria =
  | 'ALMACEN'
  | 'ALIMENTOS_SECOS'
  | 'FRESCOS'
  | 'REFRIGERADOS'
  | 'CONGELADOS'
  | 'BEBIDAS'
  | 'BEBIDAS_ALCOHOLICAS'
  | 'LACTEOS'
  | 'PANADERIA'
  | 'FIAMBRERIA'
  | 'LIMPIEZA_DEL_HOGAR'
  | 'HIGIENE'
  | 'CUIDADO_PERSONAL'
  | 'PERFUMERIA'
  | 'MASCOTAS'
  | 'BEBES'
  | 'BAZAR'
  | 'ELECTRODOMESTICOS'
  | 'COTILLON'
  | 'KIOSCO';

export const CATEGORIAS: Categoria[] = [
  'ALMACEN',
  'ALIMENTOS_SECOS',
  'FRESCOS',
  'REFRIGERADOS',
  'CONGELADOS',
  'BEBIDAS',
  'BEBIDAS_ALCOHOLICAS',
  'LACTEOS',
  'PANADERIA',
  'FIAMBRERIA',
  'LIMPIEZA_DEL_HOGAR',
  'HIGIENE',
  'CUIDADO_PERSONAL',
  'PERFUMERIA',
  'MASCOTAS',
  'BEBES',
  'BAZAR',
  'ELECTRODOMESTICOS',
  'COTILLON',
  'KIOSCO'
];

export interface Producto {
  id?: number;
  nombre: string;
  categoria: Categoria;
  codigoDeBarras: string;
  descripcion: string;
  cantidad: number;
  fechaModificacion?: string;
  marca: string;
  precioUnitario: number;
  imagenUrl?: string;
}

interface ProductoApi {
  id?: number;
  nombre: string;
  categoria: Categoria;
  codigoDeBarras?: string;
  descripcion?: string;
  marca?: string;
  precioUnitario: number;
  imagenUrl?: string;
  stock?: number;
  cantidad?: number;
}

const DATOS_PRUEBA: Producto[] = [
  { id: 1, nombre: 'Leche entera 1L', categoria: 'LACTEOS', codigoDeBarras: '7791234500011', descripcion: 'Leche entera larga vida', cantidad: 48, marca: 'La Serenísima', precioUnitario: 1450 },
  { id: 2, nombre: 'Yogur firme vainilla', categoria: 'LACTEOS', codigoDeBarras: '7791234500028', descripcion: 'Yogur firme 1kg', cantidad: 3, marca: 'Ilolay', precioUnitario: 2100 },
  { id: 3, nombre: 'Coca-Cola 2.25L', categoria: 'BEBIDAS', codigoDeBarras: '7790895000010', descripcion: 'Gaseosa cola', cantidad: 60, marca: 'Coca-Cola', precioUnitario: 3200 },
  { id: 4, nombre: 'Agua mineral 1.5L', categoria: 'BEBIDAS', codigoDeBarras: '7790895000027', descripcion: 'Agua sin gas', cantidad: 120, marca: 'Villavicencio', precioUnitario: 1100 },
  { id: 5, nombre: 'Fideos spaghetti 500g', categoria: 'ALMACEN', codigoDeBarras: '7790070000123', descripcion: 'Fideos secos', cantidad: 0, marca: 'Matarazzo', precioUnitario: 1250 },
  { id: 6, nombre: 'Arroz largo fino 1kg', categoria: 'ALMACEN', codigoDeBarras: '7790070000130', descripcion: 'Arroz largo fino', cantidad: 35, marca: 'Gallo', precioUnitario: 1890 },
  { id: 7, nombre: 'Aceite de girasol 900ml', categoria: 'ALMACEN', codigoDeBarras: '7790070000147', descripcion: 'Aceite de girasol', cantidad: 22, marca: 'Cocinero', precioUnitario: 2750 },
  { id: 8, nombre: 'Bife de chorizo (kg)', categoria: 'FIAMBRERIA', codigoDeBarras: '7790001110001', descripcion: 'Corte vacuno', cantidad: 14, marca: 'Frigorífico Sur', precioUnitario: 11900 },
  { id: 9, nombre: 'Pechuga de pollo (kg)', categoria: 'FRESCOS', codigoDeBarras: '7790001110018', descripcion: 'Pechuga sin hueso', cantidad: 4, marca: 'Granja Tres Arroyos', precioUnitario: 6800 },
  { id: 10, nombre: 'Detergente 750ml', categoria: 'LIMPIEZA_DEL_HOGAR', codigoDeBarras: '7790200000050', descripcion: 'Detergente limón', cantidad: 40, marca: 'Magistral', precioUnitario: 2300 },
  { id: 11, nombre: 'Lavandina 1L', categoria: 'LIMPIEZA_DEL_HOGAR', codigoDeBarras: '7790200000067', descripcion: 'Lavandina tradicional', cantidad: 52, marca: 'Ayudín', precioUnitario: 980 },
  { id: 12, nombre: 'Tomate perita (kg)', categoria: 'FRESCOS', codigoDeBarras: '7790300000010', descripcion: 'Tomate fresco', cantidad: 18, marca: 'Huerta Local', precioUnitario: 2400 },
];

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private URL_RESOURCE = `${API_URL}/api/productos`;

  private mock: Producto[] = structuredClone(DATOS_PRUEBA);

  constructor(private http: HttpClient) { }

  getProductos(): Observable<Producto[]> {
    if (USAR_MOCK) return of(structuredClone(this.mock));
    return this.http.get<ProductoApi[]>(`${this.URL_RESOURCE}/productos`).pipe(
      map(lista => lista.map(p => this.desdeApi(p)))
    );
  }

  nuevoProducto(producto: Producto): Observable<void> {
    if (USAR_MOCK) {
      const id = Math.max(0, ...this.mock.map(p => p.id ?? 0)) + 1;
      this.mock.push({ ...producto, id, fechaModificacion: new Date().toISOString() });
      return of(void 0);
    }
    return this.http.put<void>(`${this.URL_RESOURCE}/agregar`, this.aAgregarDto(producto));
  }

  agregarStock(id: number, cantidad: number): Observable<void> {
    if (USAR_MOCK) {
      const p = this.mock.find(x => x.id === id);
      if (p) {
        p.cantidad += cantidad;
        p.fechaModificacion = new Date().toISOString();
      }
      return of(void 0);
    }

    return this.http.put<void>(
      `${this.URL_RESOURCE}/${id}/stock/ingresar`,
      null,
      { params: { cantidad: String(cantidad) } }
    );
  }

  editarProducto(producto: Producto): Observable<void> {
    if (USAR_MOCK) {
      const i = this.mock.findIndex(x => x.id === producto.id);
      if (i >= 0) {
        this.mock[i] = { ...this.mock[i], ...producto, fechaModificacion: new Date().toISOString() };
      }
      return of(void 0);
    }
    return this.http.put<void>(`${this.URL_RESOURCE}/editar`, this.aEditarDto(producto));
  }

  eliminarProducto(id: number): Observable<void> {
    if (USAR_MOCK) {
      this.mock = this.mock.filter(x => x.id !== id);
      return of(void 0);
    }
    return this.http.delete<void>(`${this.URL_RESOURCE}/eliminar/${id}`);
  }

  descontarStockMock(items: { productoId: number; cantidad: number }[]): void {
    for (const it of items) {
      const p = this.mock.find(x => x.id === it.productoId);
      if (p) p.cantidad = Math.max(0, p.cantidad - it.cantidad);
    }
  }

  private desdeApi(p: ProductoApi): Producto {
    return {
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria,
      codigoDeBarras: p.codigoDeBarras ?? '',
      descripcion: p.descripcion ?? '',
      marca: p.marca ?? '',
      precioUnitario: Number(p.precioUnitario),
      imagenUrl: p.imagenUrl,
      cantidad: p.stock ?? p.cantidad ?? 0
    };
  }

  private aAgregarDto(producto: Producto): ProductoApi {
    return {
      nombre: producto.nombre,
      categoria: producto.categoria,
      codigoDeBarras: producto.codigoDeBarras,
      descripcion: producto.descripcion,
      marca: producto.marca,
      precioUnitario: producto.precioUnitario,
      imagenUrl: producto.imagenUrl || undefined,
      stock: producto.cantidad
    };
  }

  private aEditarDto(producto: Producto): ProductoApi {
    return {
      id: producto.id,
      nombre: producto.nombre,
      categoria: producto.categoria,
      codigoDeBarras: producto.codigoDeBarras,
      descripcion: producto.descripcion,
      marca: producto.marca,
      precioUnitario: producto.precioUnitario,
      imagenUrl: producto.imagenUrl || undefined
    };
  }
}
