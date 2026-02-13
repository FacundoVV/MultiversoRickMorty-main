import { Injectable, inject } from '@angular/core';
// Importamos las herramientas de rutas de Angular
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
// Importamos nuestro servicio de autenticación para saber el estado del usuario
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  // Usamos 'inject' para traer las herramientas necesarias sin usar el constructor
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * canActivate es el método que Angular llama automáticamente 
   * antes de que el usuario cambie de página.
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    
    // Consultamos el flujo de datos del usuario (el Observable $)
    return this.authService.currentUser$.pipe(
      // take(1) asegura que solo miremos el estado actual una vez y cerremos la consulta
      take(1),
      // map transforma el objeto "usuario" en un resultado que Angular entienda (true/false)
      map(user => {
        // Si el usuario existe (está logueado), devolvemos true para dejarlo pasar
        if (user) {
          return true;
        }
        
        // Si no hay usuario, creamos una "redirección" hacia la página de login
        // Esto impide que el usuario vea contenido privado si no ha iniciado sesión
        return this.router.createUrlTree(['/login']);
      })
    );
  }
}