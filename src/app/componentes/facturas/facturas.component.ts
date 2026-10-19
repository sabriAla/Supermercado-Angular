import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacturaService, Factura } from '../../servicios/factura.service';
import { AuthService } from '../../servicios/auth.service';
import { mensajeDeError } from '../../utils/errores';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit {

  facturas: Factura[] = [];
  abierta: number | null = null;
  mensaje = '';
  esAdmin = false;

  constructor(
    private facturaService: FacturaService,
    private sesion: AuthService
  ) { }

  ngOnInit(): void {
    this.esAdmin = this.sesion.esAdmin();

    this.facturaService.getFacturas().subscribe({
      next: (resp) => {
        this.facturas = [...resp].reverse();
      },
      error: (err) => this.mensaje = mensajeDeError(err)
    });
  }

  get totalFacturado(): number {
    return this.facturas.reduce((s, f) => s + f.total, 0);
  }

  alternar(f: Factura): void {
    this.abierta = this.abierta === f.id ? null : (f.id ?? null);
  }

  unidades(f: Factura): number {
    return (f.detalles ?? []).reduce((s, d) => s + d.cantidad, 0);
  }
}