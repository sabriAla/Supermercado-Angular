import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService } from '../../servicios/carrito.service';
import { FacturaService, Factura } from '../../servicios/factura.service';
import { AuthService } from '../../servicios/auth.service';
import { mensajeDeError } from '../../utils/errores';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent {

  mensaje = '';
  procesando = false;
  compraOk = false;
  totalComprado = 0;

  constructor(
    public carrito: CarritoService,
    private facturaService: FacturaService,
    private sesion: AuthService,
    private router: Router
  ) { }

  confirmarCompra(): void {
    if (this.carrito.items.length === 0 || this.procesando) return;

    const total = this.carrito.total();
    const factura: Factura = {
      cliente: this.sesion.username,
      total,
      detalles: this.carrito.items.map(i => ({
        productoId: i.productoId,
        nombreProducto: i.nombre,
        precioUnitario: i.precioUnitario,
        cantidad: i.cantidad,
        subtotal: i.cantidad * i.precioUnitario
      }))
    };
    const detallesVenta = this.carrito.items.map(i => ({
      productoId: i.productoId,
      cantidad: i.cantidad
    }));

    this.procesando = true;
    this.mensaje = '';

    this.facturaService.registrarFactura(factura, detallesVenta).subscribe({
      next: () => {
        this.totalComprado = total;
        this.carrito.vaciar();
        this.procesando = false;
        this.compraOk = true;
      },
      error: (err) => {
        this.procesando = false;
        this.mensaje = mensajeDeError(err);
      }
    });
  }

  verFacturas(): void {
    this.router.navigate(['/facturas']);
  }

  seguirComprando(): void {
    this.router.navigate(['/productos']);
  }
}