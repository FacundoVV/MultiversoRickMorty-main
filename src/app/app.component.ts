import { Component } from '@angular/core';
import { AuthService, AppUser } from './auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root', // El selector principal que se encuentra en el index.html
  standalone: true, // Indica que es un componente independiente
  imports: [CommonModule, RouterModule], // Importamos CommonModule para el async pipe y RouterModule para las rutas
  templateUrl: './app.component.html', // Ruta al archivo de estructura HTML
  styleUrls: ['./app.css'] // Ruta al archivo de estilos globales del componente
})
export class AppComponent {

  // Observable que rastrea el estado del usuario en toda la aplicación
  currentUser$: Observable<AppUser | null>;

  constructor(public authService: AuthService) {
    // Vinculamos el observable del componente con el del servicio de autenticación
    this.currentUser$ = this.authService.currentUser$;
  }

  // Método asíncrono para cerrar la sesión del usuario actual
  async logout() {
    await this.authService.logout();
  }
}