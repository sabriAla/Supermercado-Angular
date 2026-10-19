import { HttpInterceptorFn } from '@angular/common/http';

const RUTAS_PUBLICAS = ['/auth/login', '/auth/register', '/api/usuario/registro'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const esPublica = RUTAS_PUBLICAS.some(ruta => req.url.includes(ruta));
  const token = localStorage.getItem('token');

  if (token && !esPublica) {
    return next(req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    }));
  }

  return next(req);
};
