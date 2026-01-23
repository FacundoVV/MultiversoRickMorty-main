import { Component, OnInit } from '@angular/core';
import { AuthService, AppUser } from './auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  title = 'Rick & Morty App'; 
  currentUser$: Observable<AppUser | null>;

  constructor(
    public authService: AuthService,
    public router: Router
  ) {
    this.currentUser$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    // Verificar si hay una redirección pendiente después del login
    const redirectTo = localStorage.getItem('redirectAfterLogin');
    if (redirectTo) {
      localStorage.removeItem('redirectAfterLogin'); // Limpiar
      this.router.navigate([redirectTo]);
    }
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión desde AppComponent:', error);
    }
  }
}