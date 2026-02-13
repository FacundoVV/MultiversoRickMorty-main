import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true, // Componente independiente (no necesita AppModule)
  imports: [
    CommonModule,
    ReactiveFormsModule, // Necesario para los formularios reactivos
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // --- INYECCIÓN DE DEPENDENCIAS ---
  private formBuilder = inject(FormBuilder); // Constructor de formularios
  private authService = inject(AuthService); // Nuestro servicio de Firebase
  private router = inject(Router);           // Para navegar entre páginas
  private route = inject(ActivatedRoute);    // Para leer parámetros de la URL

  // Propiedades para controlar la interfaz de usuario (UI)
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false; // Controla el spinner de carga
  successMessage: string | null = null;

  constructor() {
    // Si el usuario ya tiene sesión activa, lo sacamos del login automáticamente
    if (this.authService.currentUserValue) {
      this.redirectAuthenticatedUser();
    }

    // --- INICIALIZACIÓN DEL FORMULARIO ---
    // Definimos los campos, valores iniciales y sus reglas de validación
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Doble verificación de seguridad al iniciar el componente
    if (this.authService.currentUserValue) {
      this.redirectAuthenticatedUser();
    }
  }

  /**
   * Método principal que se dispara al enviar el formulario (Submit)
   */
  async onSubmit(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;
    
    // 1. Validación preventiva: si el formulario está mal escrito, ni siquiera intentamos el login
    if (this.loginForm.invalid) {
      this.markFormTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.isLoading = true; // Iniciamos el estado de "Cargando..."
    const { email, password } = this.loginForm.value;

    try {
      // 2. Intento de autenticación con el servicio de Firebase
      await this.authService.login(email, password);
      
      this.successMessage = '¡Sesión iniciada con éxito! Redirigiendo...';
      
      // 3. Gestión de la redirección tras el éxito
      setTimeout(() => {
        // 'replaceUrl: true' borra el login del historial para que el usuario 
        // no pueda volver atrás con el botón del navegador una vez logueado.
        this.router.navigate(['/characters'], { replaceUrl: true }).then((moved) => {
          // MECANISMO DE EMERGENCIA: Si el Router de Angular se bloquea, 
          // forzamos la carga de la página con el motor del navegador.
          if (!moved || this.router.url.includes('login')) {
            window.location.href = '/characters'; 
          }
        });
      }, 1000); // Esperamos 1 segundo para que el usuario lea el mensaje de éxito
      
    } catch (error: any) {
      // 4. Manejo de errores de Firebase
      this.handleAuthError(error);
    } finally {
      // El spinner solo se apaga si hubo un error. Si fue éxito, 
      // dejamos que el spinner siga hasta que la página cambie.
    }
  }

  // --- MÉTODOS DE APOYO ---

  private redirectAuthenticatedUser(): void {
    const redirectTo = this.getRedirectUrl();
    this.router.navigate([redirectTo]);
  }

  /**
   * Calcula a dónde debe ir el usuario.
   * Prioridad: 1. A donde quería ir antes (returnUrl) | 2. A la lista de personajes
   */
  private getRedirectUrl(): string {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    return returnUrl || '/characters'; 
  }

  // Marca todos los campos como "tocados" para mostrar errores visuales en el HTML
  private markFormTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * TRADUCTOR DE ERRORES: Convierte los códigos técnicos de Firebase
   * en mensajes amigables para el usuario final.
   */
  private handleAuthError(error: any): void {
    this.isLoading = false; 

    const errorMap: { [key: string]: string } = {
      'auth/user-not-found': 'No existe una cuenta con este email.',
      'auth/wrong-password': 'La contraseña es incorrecta.',
      'auth/invalid-email': 'El formato del email no es válido.',
      'auth/user-disabled': 'Esta cuenta ha sido desactivada.',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet.'
    };

    this.errorMessage = errorMap[error.code] || 'Error al iniciar sesión. Intenta nuevamente.';
  }

  // Getters para que el archivo HTML pueda preguntar por el estado de los campos
  get emailControl() { return this.loginForm.get('email'); }
  get passwordControl() { return this.loginForm.get('password'); }
  
  hasError(controlName: string, errorType: string): boolean {
    const control = this.loginForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }
}