import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  // Inyección de servicios necesarios para la lógica de registro y navegación
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Definición de variables de estado para el formulario y mensajes de la interfaz
  registerForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor() {
    // Verificación básica de sesión: si el usuario ya está dentro, se le expulsa al inicio
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }

    // Inicialización del formulario reactivo con sus reglas de validación
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Método que procesa el envío del formulario de registro
  async onSubmit(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;
    
    // Si el formulario no es válido, se marcan los campos y se detiene el proceso
    if (this.registerForm.invalid) {
      this.markFormTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.isLoading = true; // Activa el estado de carga (spinner)
    // Extraemos los valores del formulario
    const { username, email, password } = this.registerForm.value;

    try {
      // Llamamos al servicio pasando los 3 datos requeridos por Firebase y nuestra DB
      const registered = await this.authService.register(email, password, username);
      
      if (registered) {
        this.successMessage = '¡Cuenta creada con éxito! Redirigiendo al login...';
        
        // Esperamos 2 segundos para que el usuario vea el mensaje y mandamos al login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
      
    } catch (error: any) {
      // Manejo de errores específicos detectados por Firebase
      this.handleRegistrationError(error);
    } finally {
      this.isLoading = false; // Desactiva el estado de carga
    }
  }

  // Marca todos los controles como "tocados" para activar los errores visuales en el HTML
  private markFormTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  // Traducción de códigos técnicos de Firebase a mensajes legibles en español
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

  // Getters para simplificar el acceso a los controles desde el archivo HTML
  get usernameControl() { return this.registerForm.get('username'); }
  get emailControl() { return this.registerForm.get('email'); }
  get passwordControl() { return this.registerForm.get('password'); }
  
  // Función auxiliar para detectar errores específicos en un campo tocado
  hasError(controlName: string, errorType: string): boolean {
    const control = this.registerForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }
}