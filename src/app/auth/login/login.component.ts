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
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  successMessage: string | null = null;

  constructor() {
    // Si el usuario ya está dentro, lo sacamos del login inmediatamente
    if (this.authService.currentUserValue) {
      this.redirectAuthenticatedUser();
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
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
      
      this.successMessage = '¡Sesión iniciada con éxito! Redirigiendo...';
      
      // CAMBIO IMPORTANTE: Obtenemos la ruta segura
      const redirectTo = this.getRedirectUrl();
      
     // Redirigir con un pequeño delay para que Firebase se asiente
      setTimeout(() => {
        // 'replaceUrl: true' evita que el usuario pueda volver atrás al login con el botón del navegador
        this.router.navigate(['/characters'], { replaceUrl: true }).then((moved) => {
          // SI EL ROUTER FALLA (se queda en el login), forzamos la entrada
          if (!moved || this.router.url.includes('login')) {
            window.location.href = '/characters'; 
          }
        });
      }, 1000);
      
    } catch (error: any) {
      this.handleAuthError(error);
    } finally {
      // Nota: No ponemos isLoading = false aquí para que el spinner 
      // siga girando durante el 1.5s de espera y no parezca que se trabó.
      // Se desactivará solo cuando cambie de página.
    }
  }

  private redirectAuthenticatedUser(): void {
    const redirectTo = this.getRedirectUrl();
    this.router.navigate([redirectTo]);
  }

  private getRedirectUrl(): string {

    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      return returnUrl;
    }
    
    
    //CAMBIO: Por defecto vamos a '/characters' (o '/home') en lugar de '/'
    // Esto asegura que vaya a la lista y no se quede en un loop en el login.
    return '/characters'; 
  }

  private markFormTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  private handleAuthError(error: any): void {
    // IMPORTANTE: Si falla, apagamos el spinner para que pueda intentar de nuevo
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

  get emailControl() { return this.loginForm.get('email'); }
  get passwordControl() { return this.loginForm.get('password'); }
  
  hasError(controlName: string, errorType: string): boolean {
    const control = this.loginForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }
}