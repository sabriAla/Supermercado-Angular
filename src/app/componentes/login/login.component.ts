import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoginService } from '../../servicios/login.service';
import { AuthService } from '../../servicios/auth.service';
import { USAR_MOCK } from '../../config';
import { mensajeDeError } from '../../utils/errores';

// Nombre y apellido, solo letras
const NOMBRE_COMPLETO = /^\s*[A-Za-zÁÉÍÓÚÜáéíóúüÑñ'-]+(\s+[A-Za-zÁÉÍÓÚÜáéíóúüÑñ'-]+)+\s*$/;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  modo: 'login' | 'registro' = 'login';
  formLogin!: FormGroup;
  formRegistro!: FormGroup;
  mensajeError = '';
  mensajeOk = '';
  modoDemo = USAR_MOCK;

  constructor(
    private loginService: LoginService,
    private sesion: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (this.sesion.estaLogueado()) {
      this.router.navigate([this.sesion.inicioPorRol()]);
    }

    this.formLogin = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });

    this.formRegistro = this.formBuilder.group({
      nombreCompleto: ['', [Validators.required, Validators.pattern(NOMBRE_COMPLETO)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.route.queryParamMap.subscribe(params => {
      this.cambiarModo(params.get('modo') === 'registro' ? 'registro' : 'login');
    });
  }

  cambiarModo(modo: 'login' | 'registro'): void {
    this.modo = modo;
    this.mensajeError = '';
    this.mensajeOk = '';
  }

  onLogin(): void {
    if (this.formLogin.invalid) return;

    const username = this.loginService.normalizarNombre(this.formLogin.value.username);
    const password = this.formLogin.value.password;

    this.loginService.login({ username, password }).subscribe({
      next: (resp) => {
        this.sesion.guardarSesion(resp.token);
        this.router.navigate([this.sesion.inicioPorRol()]);
      },
      error: (err) => {
        console.error('Error de autenticación:', err);
        if (err.status === 0) {
          this.mensajeError = 'No se pudo conectar con el servidor';
          return;
        }
        if (username.includes('@')) {
          this.mensajeError = 'El login no usa el email. Ingresá el nombre completo con el que te registraste.';
          return;
        }
        this.mensajeError = 'Usuario o contraseña incorrectos. El usuario es tu nombre y apellido (no el Gmail).';
      }
    });
  }

  onRegistro(): void {
    if (this.formRegistro.invalid) {
      this.formRegistro.markAllAsTouched();
      return;
    }

    this.loginService.registrar(this.formRegistro.value).subscribe({
      next: () => {
        const username = this.loginService.normalizarNombre(this.formRegistro.value.nombreCompleto);
        this.formRegistro.reset();
        this.cambiarModo('login');
        this.formLogin.patchValue({ username, password: '' });
        this.mensajeOk = `¡Cuenta creada! Tu usuario es "${username}" (nombre y apellido, no el email). Ahora iniciá sesión.`;
      },
      error: (err) => this.mensajeError = mensajeDeError(err)
    });
  }

  invalido(campo: string): boolean {
    const c = this.formRegistro.get(campo);
    return !!c && c.invalid && c.touched;
  }
}
