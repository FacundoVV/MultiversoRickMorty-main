import { Injectable, inject } from '@angular/core';
// Herramientas de navegación y rutas de Angular
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
// Servicio de autenticación para consultar el estado del usuario
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  // Inyectamos las herramientas necesarias
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Este método decide si el usuario puede entrar a una página o no.
   * Se ejecuta ANTES de que la ruta cambie.
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    
    return this.authService.currentUser$.pipe(
      // take(1) es vital: toma el primer valor que emita Firebase y cierra la conexión
      take(1),
      // tap nos sirve para ver en la consola qué está pasando sin alterar los datos
      tap(user => {
        if (!user) {
          console.warn('AuthGuard: Acceso denegado. No hay usuario detectado.');
        } else {
          console.log('AuthGuard: Acceso concedido para:', user.email);
        }
      }),
      // map transforma el usuario en un permiso (true) o en una orden de mudanza (UrlTree)
      map(user => {
        // SI EL USUARIO EXISTE:
        // Angular recibe 'true' y permite que la página cargue.
        if (user) {
          return true;
        }
        
        // SI NO HAY USUARIO:
        // Creamos una ruta de redirección al login.
        // Guardamos 'returnUrl' para que, tras loguearse, el sistema sepa a dónde quería ir el usuario.
        return this.router.createUrlTree(['/login'], { 
          queryParams: { returnUrl: state.url } 
        });
      })
    );
  }
}