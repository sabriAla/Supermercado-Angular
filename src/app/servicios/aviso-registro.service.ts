import { Injectable } from '@angular/core';

const MENSAJE_POR_DEFECTO = 'Para hacer esto necesitás iniciar sesión o registrarte.';

@Injectable({ providedIn: 'root' })
export class AvisoRegistroService {

  visible = false;
  mensaje = MENSAJE_POR_DEFECTO;

  mostrar(mensaje?: string): void {
    this.mensaje = mensaje ?? MENSAJE_POR_DEFECTO;
    this.visible = true;
  }

  cerrar(): void {
    this.visible = false;
  }
}