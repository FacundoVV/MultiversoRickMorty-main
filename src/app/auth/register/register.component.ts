import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// CORRECCIÓN IMPORTANTE: La ruta correcta para llegar a tu servicio
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor() {
    // Verificación básica de sesión
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }

    // Inicializar formulario
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;
    
    if (this.registerForm.invalid) {
      this.markFormTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.isLoading = true;
    // Extraemos los valores del formulario
    const { username, email, password } = this.registerForm.value;

    try {
      // Llamamos al servicio pasando los 3 datos
      const registered = await this.authService.register(email, password, username);
      
      if (registered) {
        this.successMessage = '¡Cuenta creada con éxito! Redirigiendo al login...';
        
        // Esperamos 2 segundos y mandamos al login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
      
    } catch (error: any) {
      this.handleRegistrationError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private markFormTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  private handleRegistrationError(error: any): void {
    const errorMap: { [key: string]: string } = {
      'auth/email-already-in-use': 'Este correo electrónico ya está registrado.',
      'auth/invalid-email': 'El formato del correo electrónico no es válido.',
      'auth/weak-password': 'La contraseña es muy débil (mínimo 6 caracteres).',
      'auth/operation-not-allowed': 'El registro no está habilitado en Firebase.',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet.'
    };

    this.errorMessage = errorMap[error.code] || 'Error al crear la cuenta. Intenta nuevamente.';
    
    if (!errorMap[error.code]) {
      console.warn('Error desconocido:', error);
    }
  }

  // Getters para usar en el HTML
  get usernameControl() { return this.registerForm.get('username'); }
  get emailControl() { return this.registerForm.get('email'); }
  get passwordControl() { return this.registerForm.get('password'); }
  
  hasError(controlName: string, errorType: string): boolean {
    const control = this.registerForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }
}