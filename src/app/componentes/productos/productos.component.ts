import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService, Producto, CATEGORIAS } from '../../servicios/producto.service';
import { CarritoService } from '../../servicios/carrito.service';
import { AuthService } from '../../servicios/auth.service';
import { mensajeDeError } from '../../utils/errores';
import { AvisoRegistroService } from '../../servicios/aviso-registro.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  productos: Producto[] = [];
  busqueda = '';
  categoria = 'TODAS';
  orden = 'nombre';
  mensaje = '';
  aviso = '';
  cargando = true;

  // Edición (solo administrador)
  editando: Producto | null = null;
  formEdicion!: FormGroup;
  categoriasEdicion = CATEGORIAS;

  private readonly emojis: Record<string, string> = {
    ALMACEN: '🥫',
    ALIMENTOS_SECOS: '🍝',
    FRESCOS: '🥦',
    REFRIGERADOS: '🧊',
    CONGELADOS: '❄️',
    BEBIDAS: '🥤',
    BEBIDAS_ALCOHOLICAS: '🍷',
    LACTEOS: '🥛',
    PANADERIA: '🥖',
    FIAMBRERIA: '🥩',
    LIMPIEZA_DEL_HOGAR: '🧼',
    HIGIENE: '🧻',
    CUIDADO_PERSONAL: '🧴',
    PERFUMERIA: '🌸',
    MASCOTAS: '🐾',
    BEBES: '🍼',
    BAZAR: '🍽️',
    ELECTRODOMESTICOS: '🔌',
    COTILLON: '🎉',
    KIOSCO: '🍫'
  };

  constructor(
  private productoService: ProductoService,
  public carrito: CarritoService,
  public sesion: AuthService,
  private fb: FormBuilder,
  private avisoRegistro: AvisoRegistroService
) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (resp) => { this.productos = resp; this.cargando = false; },
      error: (err) => { this.mensaje = mensajeDeError(err); this.cargando = false; }
    });
  }

  abrirEdicion(p: Producto): void {
    this.editando = p;
    this.formEdicion = this.fb.group({
      nombre: [p.nombre, [Validators.required, Validators.minLength(3)]],
      marca: [p.marca, [Validators.required]],
      categoria: [p.categoria, [Validators.required]],
      codigoDeBarras: [p.codigoDeBarras, [Validators.required, Validators.minLength(8)]],
      precioUnitario: [p.precioUnitario, [Validators.required, Validators.min(1)]],
      descripcion: [p.descripcion],
      imagenUrl: [p.imagenUrl ?? '']
    });
  }

  cerrarEdicion(): void {
    this.editando = null;
  }

  guardarEdicion(): void {
    if (!this.editando) return;
    if (this.formEdicion.invalid) {
      this.formEdicion.markAllAsTouched();
      return;
    }

    const actualizado: Producto = {
      ...this.editando,
      ...this.formEdicion.value
    };

    this.productoService.editarProducto(actualizado).subscribe({
      next: () => {
        this.mensaje = '';
        this.cerrarEdicion();
        this.mostrarAviso(`${actualizado.nombre} actualizado`);
        this.cargarProductos();
      },
      error: (err) => { this.mensaje = mensajeDeError(err); this.cerrarEdicion(); }
    });
  }

  invalidoEdicion(campo: string): boolean {
    const c = this.formEdicion?.get(campo);
    return !!c && c.invalid && c.touched;
  }

  get categorias(): string[] {
    return ['TODAS', ...new Set(this.productos.map(p => p.categoria))];
  }

  get filtrados(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();

    const lista = this.productos.filter(p =>
      (this.categoria === 'TODAS' || p.categoria === this.categoria) &&
      (`${p.nombre} ${p.marca} ${p.codigoDeBarras}`.toLowerCase().includes(texto))
    );

    switch (this.orden) {
      case 'precioAsc': return lista.sort((a, b) => a.precioUnitario - b.precioUnitario);
      case 'precioDesc': return lista.sort((a, b) => b.precioUnitario - a.precioUnitario);
      default: return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
  }

  emoji(p: Producto): string {
    return this.emojis[p.categoria] ?? '🛒';
  }

  textoCategoria(c: string): string {
    const t = c.replace(/_/g, ' ').toLowerCase();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  claseStock(p: Producto): string {
    if (p.cantidad === 0) return 'badge-off';
    return p.cantidad < 5 ? 'badge-warn' : 'badge-ok';
  }

  textoStock(p: Producto): string {
    if (p.cantidad === 0) return 'Agotado';
    return p.cantidad < 5 ? `Últimas ${p.cantidad}` : 'En stock';
  }

  sinMasStock(p: Producto): boolean {
    return p.cantidad === 0 || this.carrito.cantidadEnCarrito(p.id) >= p.cantidad;
  }

  agregar(p: Producto): void {
  if (!this.sesion.estaLogueado()) {
    this.avisoRegistro.mostrar('Para agregar productos al carrito necesitás iniciar sesión o registrarte.');
    return;
  }

  if (this.carrito.agregar(p)) {
    this.mostrarAviso(`${p.nombre} agregado al carrito`);
  }
}

  private mostrarAviso(texto: string): void {
    this.aviso = texto;
    setTimeout(() => this.aviso = '', 1800);
  }
}