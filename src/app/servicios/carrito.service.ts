import { Injectable } from '@angular/core';
import { Producto } from './producto.service';

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  marca: string;
  precioUnitario: number;
  cantidad: number;
  stock: number;          
}

@Injectable({ providedIn: 'root' })
export class CarritoService {

  items: ItemCarrito[] = [];

  agregar(p: Producto): boolean {
    if (p.id === undefined || p.cantidad <= 0) return false;

    const existente = this.items.find(i => i.productoId === p.id);
    if (existente) {
      if (existente.cantidad >= p.cantidad) return false;
      existente.cantidad++;
      existente.stock = p.cantidad;
      return true;
    }

    this.items.push({
      productoId: p.id,
      nombre: p.nombre,
      marca: p.marca,
      precioUnitario: p.precioUnitario,
      cantidad: 1,
      stock: p.cantidad
    });
    return true;
  }

  sumar(item: ItemCarrito): void {
    if (item.cantidad < item.stock) item.cantidad++;
  }

  restar(item: ItemCarrito): void {
    item.cantidad--;
    if (item.cantidad <= 0) this.quitar(item);
  }

  quitar(item: ItemCarrito): void {
    this.items = this.items.filter(i => i !== item);
  }

  vaciar(): void {
    this.items = [];
  }

  cantidadEnCarrito(productoId?: number): number {
    return this.items.find(i => i.productoId === productoId)?.cantidad ?? 0;
  }

  cantidadTotal(): number {
    return this.items.reduce((s, i) => s + i.cantidad, 0);
  }

  total(): number {
    return this.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);
  }
}