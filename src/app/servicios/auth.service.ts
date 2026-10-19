import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export type Rol = 'ADMIN' | 'CLIENTE';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private router: Router) { }

  guardarSesion(token: string): void {
    localStorage.setItem('token', token);

    const datos = this.leerToken(token);
    const username = datos?.sub ? String(datos.sub) : '';

    const rolToken = datos?.rol ? String(datos.rol).replace('ROLE_', '').toUpperCase() : '';
    const esAdmin = rolToken ? rolToken.startsWith('ADMIN') : username.toLowerCase() === 'admin';

    localStorage.setItem('rol', esAdmin ? 'ADMIN' : 'CLIENTE');
    localStorage.setItem('username', username);
  }

  estaLogueado(): boolean {
    return !!localStorage.getItem('token');
  }

  get rol(): Rol | null {
    return localStorage.getItem('rol') as Rol | null;
  }

  get username(): string {
    return localStorage.getItem('username') ?? '';
  }

  tieneRol(...roles: Rol[]): boolean {
    const actual = this.rol;
    return !!actual && roles.includes(actual);
  }

  esAdmin(): boolean {
    return this.tieneRol('ADMIN');
  }

  inicioPorRol(): string {
    return this.rol ? '/productos' : '/login';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
    this.router.navigate(['/productos']);
  }

  private leerToken(token: string): any {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

}