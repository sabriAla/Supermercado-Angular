import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Rol } from '../servicios/auth.service';

export const rolGuard = (...roles: Rol[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.tieneRol(...roles)) {
    return true;
  }

  router.navigate([auth.estaLogueado() ? auth.inicioPorRol() : '/login']);
  return false;
};