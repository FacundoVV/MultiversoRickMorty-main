import { TestBed } from '@angular/core/testing';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth-guard';
import { AuthService } from './auth.service';
import { provideRouter } from '@angular/router'; 
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  //Usamos la instancia inyectada directamente
  const executeGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    TestBed.runInInjectionContext(() => {
      const guard = TestBed.inject(AuthGuard); // Inyectamos el guardia
      return guard.canActivate(route, state);  // Llamamos al método
    });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        provideRouter([]), // Reemplaza a RouterTestingModule
        {
          provide: AuthService,
          useValue: {
            // Asegúrate de que estos nombres coincidan con tu AuthService
            currentUser$: of(null), 
            isLoggedIn: () => of(true)
          }
        }
      ]
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/' } as RouterStateSnapshot;
    expect(executeGuard(route, state)).toBeTruthy();
  });
});