import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile', // Define el nombre de la etiqueta HTML personalizada para este componente
  standalone: true, // Especifica que es un componente independiente (no requiere un @NgModule)
  imports: [CommonModule, RouterModule], // Importa módulos para usar directivas comunes (como *ngIf) y rutas
  templateUrl: './profile.component.html', // Vincula el archivo de maquetación HTML
  styleUrls: ['./profile.component.css'] // Vincula el archivo de estilos CSS
})
export class ProfileComponent {
  /**
   * El constructor inyecta el 'AuthService' con modificador de acceso 'public'.
   * Esto es fundamental porque permite que la plantilla HTML asociada
   * pueda acceder directamente a las propiedades y métodos del servicio,
   * facilitando la visualización de los datos del usuario autenticado.
   */
  constructor(public authService: AuthService) {}
}