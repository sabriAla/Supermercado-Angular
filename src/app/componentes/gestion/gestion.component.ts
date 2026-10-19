import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductoService, Producto, CATEGORIAS } from '../../servicios/producto.service';
import { mensajeDeError } from '../../utils/errores';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})
export class GestionComponent implements OnInit {

  formulario!: FormGroup;
  productos: Producto[] = [];
  categorias = CATEGORIAS;
  sumar: { [id: number]: number } = {};
  mensaje = '';
  exito = '';
  filtro = '';

  constructor(
    private productoService: ProductoService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.obtenerProductos();
  }

  initializeForm(): void {
    this.formulario = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      categoria: [this.categorias[0], [Validators.required]],
      codigoDeBarras: ['', [Validators.required, Validators.minLength(8)]],
      marca: ['', [Validators.required]],
      descripcion: [''],
      cantidad: [0, [Validators.required, Validators.min(0)]],
      precioUnitario: [null, [Validators.required, Validators.min(1)]],
      imagenUrl: ['']
    });
  }

  obtenerProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (resp) => this.productos = resp,
      error: (err) => this.mensaje = mensajeDeError(err)
    });
  }

  get filtrados(): Producto[] {
    const t = this.filtro.trim().toLowerCase();
    return this.productos.filter(p => `${p.nombre} ${p.marca} ${p.codigoDeBarras}`.toLowerCase().includes(t));
  }

  guardarProducto(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.productoService.nuevoProducto(this.formulario.value).subscribe({
      next: () => {
        this.formulario.reset({ categoria: this.categorias[0], cantidad: 0 });
        this.mensaje = '';
        this.avisar('Producto agregado correctamente');
        this.obtenerProductos();
      },
      error: (err) => this.mensaje = mensajeDeError(err)
    });
  }

  agregarStock(p: Producto): void {
    if (p.id === undefined) return;

    const cantidad = Number(this.sumar[p.id]);
    if (!cantidad || cantidad <= 0) return;

    this.productoService.agregarStock(p.id, cantidad).subscribe({
      next: () => {
        this.mensaje = '';
        this.sumar[p.id!] = 0;
        this.avisar('Stock actualizado correctamente');
        this.obtenerProductos();
      },
      error: (err) => {
        this.mensaje = mensajeDeError(err);
      }
    });
  }

  eliminarProducto(p: Producto): void {
    if (p.id === undefined) return;
    if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;

    this.productoService.eliminarProducto(p.id).subscribe({
      next: () => {
        this.mensaje = '';
        this.avisar(`Producto "${p.nombre}" eliminado`);
        this.obtenerProductos();
      },
      error: (err) => this.mensaje = mensajeDeError(err)
    });
  }

  claseStock(p: Producto): string {
    if (p.cantidad === 0) return 'badge-off';
    return p.cantidad < 5 ? 'badge-warn' : 'badge-ok';
  }

  invalido(campo: string): boolean {
    const c = this.formulario.get(campo);
    return !!c && c.invalid && c.touched;
  }

  private avisar(texto: string): void {
    this.exito = texto;
    setTimeout(() => this.exito = '', 2500);
  }
}
