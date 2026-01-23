import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // Añadido para leer query params

  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  successMessage: string | null = null;

  constructor() {
    // Redirigir si ya está autenticado
    if (this.authService.currentUserValue) {
      this.redirectAuthenticatedUser();
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // También verificar en ngOnInit por si hay cambios después del constructor
    if (this.authService.currentUserValue) {
      this.redirectAuthenticatedUser();
    }
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;
    
    if (this.loginForm.invalid) {
      this.markFormTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email, password);
      
      // Mostrar mensaje de éxito
      this.successMessage = '¡Sesión iniciada con éxito! Redirigiendo...';
      
      // Obtener la URL a la que redirigir
      const redirectTo = this.getRedirectUrl();
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        this.router.navigate([redirectTo]);
        // Resetear la URL de redirección para el próximo login
        this.authService.redirectUrl = '/';
      }, 1500);
      
    } catch (error: any) {
      this.handleAuthError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private redirectAuthenticatedUser(): void {
    // Si ya está autenticado, redirigir a la página apropiada
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    const redirectUrl = returnUrl || this.authService.redirectUrl || '/';
    this.router.navigate([redirectUrl]);
  }

  private getRedirectUrl(): string {
    // 1. Primero verificar returnUrl de los query params
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      return returnUrl;
    }
    
    // 2. Si no, usar la redirectUrl del servicio
    if (this.authService.redirectUrl && this.authService.redirectUrl !== '/login') {
      return this.authService.redirectUrl;
    }
    
    // 3. Por defecto ir a la ruta raíz
    return '/';
  }

  private markFormTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  private handleAuthError(error: any): void {
    const errorMap: { [key: string]: string } = {
      'auth/user-not-found': 'No existe una cuenta con este email.',
      'auth/wrong-password': 'La contraseña es incorrecta.',
      'auth/invalid-email': 'El formato del email no es válido.',
      'auth/user-disabled': 'Esta cuenta ha sido desactivada.',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet.'
    };

    this.errorMessage = errorMap[error.code] || 'Error al iniciar sesión. Intenta nuevamente.';
    
    if (!errorMap[error.code]) {
      console.warn('Error de autenticación no manejado:', error);
    }
  }

  get emailControl() { return this.loginForm.get('email'); }
  get passwordControl() { return this.loginForm.get('password'); }
  
  hasError(controlName: string, errorType: string): boolean {
    const control = this.loginForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }
}