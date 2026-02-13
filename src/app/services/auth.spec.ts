import { TestBed } from '@angular/core/testing';

// 1. Apuntamos al archivo correcto: './auth.service'
import { AuthService } from './auth.service'; 

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Aquí se configurarían los módulos de Firebase si hicieras tests reales
    });
    // 2. Inyectamos el nombre real de la clase
    service = TestBed.inject(AuthService); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});