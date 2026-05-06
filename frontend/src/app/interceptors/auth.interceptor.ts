import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectamos el servicio usando la nueva sintaxis de Angular
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si hay token, clonamos la petición y le pegamos el header
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Si no hay token (como al hacer login), la dejamos pasar normal
  return next(req);
};