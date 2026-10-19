import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { API_URL, USAR_MOCK } from '../config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface RegistroDatos {
  nombreCompleto: string;
  email: string;
  password: string;
}

interface UsuarioMock {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private URL_RESOURCE = `${API_URL}/auth/login`;
  private URL_REGISTRO = `${API_URL}/auth/register`;
  private CLAVE_USUARIOS = 'usuariosMock';

  constructor(private http: HttpClient) { }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    if (USAR_MOCK) return this.loginMock(credentials);

    const nombreCompleto = this.normalizarNombre(credentials.username);
    const password = credentials.password;

    return this.http.post<AuthResponse>(this.URL_RESOURCE, {
      nombreCompleto,
      password
    });
  }

  registrar(datos: RegistroDatos): Observable<void> {
    const nombreCompleto = this.normalizarNombre(datos.nombreCompleto);
    const email = datos.email.trim().toLowerCase();
    const password = datos.password;

    if (USAR_MOCK) {
      const usuarios = this.leerUsuarios();
      const existe = nombreCompleto.toLowerCase() === 'admin' || usuarios.some(u =>
        u.username.toLowerCase() === nombreCompleto.toLowerCase() || u.email === email
      );

      if (existe) {
        return throwError(() => ({ status: 409, error: 'Ya existe una cuenta con ese Gmail o nombre' }));
      }

      usuarios.push({ username: nombreCompleto, email, password });
      localStorage.setItem(this.CLAVE_USUARIOS, JSON.stringify(usuarios));
      return of(void 0);
    }

    return this.http.post<void>(this.URL_REGISTRO, {
      nombreCompleto,
      email,
      password
    });
  }

  normalizarNombre(valor: string): string {
    return (valor ?? '').trim().replace(/\s+/g, ' ');
  }

  private loginMock(credentials: LoginCredentials): Observable<AuthResponse> {
    const ingresado = this.normalizarNombre(credentials.username);

    if (ingresado.toLowerCase() === 'admin') {
      return of({ token: this.tokenDePrueba('admin') });
    }

    const clave = ingresado.toLowerCase();
    const usuario = this.leerUsuarios().find(u =>
      (u.username.toLowerCase() === clave || u.email === clave) && u.password === credentials.password
    );

    if (!usuario) return throwError(() => ({ status: 401 }));
    return of({ token: this.tokenDePrueba(usuario.username) });
  }

  private leerUsuarios(): UsuarioMock[] {
    try {
      return JSON.parse(localStorage.getItem(this.CLAVE_USUARIOS) ?? '[]');
    } catch {
      return [];
    }
  }

  private tokenDePrueba(username: string): string {
    const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
    const rol = username.toLowerCase() === 'admin' ? 'ADMIN' : 'CLIENTE';
    return `${b64({ alg: 'none' })}.${b64({ sub: username, rol })}.mock`;
  }
}
