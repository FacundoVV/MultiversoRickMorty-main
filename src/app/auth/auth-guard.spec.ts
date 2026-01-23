import { TestBed } from '@angular/core/testing';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth-guard';
import { AuthService } from './auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;
  const executeGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    TestBed.runInInjectionContext(() => {
      TestBed.inject(AuthGuard);
      return new AuthGuard(authService, router).canActivate(route, state);
    });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => of(true),
            currentUser: { role: 'user' }
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
