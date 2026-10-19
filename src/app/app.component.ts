import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './servicios/auth.service';
import { CarritoService } from './servicios/carrito.service';
import { AvisoRegistroService } from './servicios/aviso-registro.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    public sesion: AuthService,
    public carrito: CarritoService,
    public aviso: AvisoRegistroService,
    private router: Router
  ) {}

  isLoggedIn(): boolean {
    return this.sesion.estaLogueado();
  }

  // En la pantalla de login no se muestra el menú
  mostrarNav(): boolean {
    return !this.router.url.startsWith('/login');
  }

  irALogin(modo: 'login' | 'registro'): void {
    this.aviso.cerrar();
    this.router.navigate(['/login'], { queryParams: { modo } });
  }

  logout(): void {
    this.carrito.vaciar();
    this.sesion.logout();
  }
}