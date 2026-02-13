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
  // Inyección de servicios mediante la función inject()
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // Añadido para leer query params

  // Definición de variables de control del formulario y estados de carga
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  successMessage: string | null = null;

  constructor() {
    // Redirigir si ya está autenticado (evita que un logueado entre al login)
    if (this.authService.currentUserValue) {
      this.redirectAuthenticatedUser();
    }

    // Inicialización del formulario con validaciones obligatorias y de formato
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

  // Método que se ejecuta al presionar el botón de inicio de sesión
  async onSubmit(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;
    
    // Validación: Si el formulario es inválido, marcamos los campos y cortamos la ejecución
    if (this.loginForm.invalid) {
      this.markFormTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.isLoading = true; // Activa el indicador de carga
    const { email, password } = this.loginForm.value;

    try {
      // Llamada al servicio de autenticación para validar credenciales con Firebase
      await this.authService.login(email, password);
      
      // Mostrar mensaje de éxito si la respuesta es positiva
      this.successMessage = '¡Sesión iniciada con éxito! Redirigiendo...';
      
      // Obtener la URL a la que redirigir (donde quería ir el usuario originalmente)
      const redirectTo = this.getRedirectUrl();
      
      // Redirigir después de 1.5 segundos para que el usuario vea el mensaje
      setTimeout(() => {
        this.router.navigate([redirectTo]);
        // Resetear la URL de redirección para el próximo login
        this.authService.redirectUrl = '/';
      }, 1500);
      
    } catch (error: any) {
      // Si hay un error de Firebase (ej: contraseña mal), lo manejamos aquí
      this.handleAuthError(error);
    } finally {
      this.isLoading = false; // Desactiva el indicador de carga
    }
  }

  // Redirige al usuario si ya tiene una sesión iniciada
  private redirectAuthenticatedUser(): void {
    // Si ya está autenticado, redirigir a la página apropiada
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    const redirectUrl = returnUrl || this.authService.redirectUrl || '/';
    this.router.navigate([redirectUrl]);
  }

  // Calcula la URL de destino final después de un login exitoso
  private getRedirectUrl(): string {
    // 1. Primero verificar returnUrl de los query params (si vino de una página protegida)
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      return returnUrl;
    }
    
    // 2. Si no, usar la redirectUrl guardada en el servicio
    if (this.authService.redirectUrl && this.authService.redirectUrl !== '/login') {
      return this.authService.redirectUrl;
    }
    
    // 3. Por defecto ir a la ruta raíz (home)
    return '/';
  }

  // Marca visualmente los campos como "tocados" para que el HTML muestre los errores
  private markFormTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  // Traduce los códigos de error técnicos de Firebase a mensajes claros en español
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

  // Getters para acceder fácilmente a los controles desde el archivo HTML
  get emailControl() { return this.loginForm.get('email'); }
  get passwordControl() { return this.loginForm.get('password'); }
  
  // Función de ayuda para que el HTML sepa si debe mostrar un error visual
  hasError(controlName: string, errorType: string): boolean {
    const control = this.loginForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }
}