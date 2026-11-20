import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Bloquea las rutas privadas si no hay sesión iniciada. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.estaAutenticado() ? true : inject(Router).createUrlTree(['/login']);
};

/** Bloquea las rutas exclusivas del administrador. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.esAdmin() ? true : inject(Router).createUrlTree(['/dashboard']);
};
