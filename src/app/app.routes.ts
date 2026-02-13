import { Routes } from '@angular/router';
import { CharacterTableComponent } from './components/character-table/character-table.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { AuthGuard } from './auth/auth-guard'; // El guardia que protege las rutas
import { FavoritesListComponent } from './components/favorites-list/favorites-list.component';

/**
 * Definición de las rutas de la aplicación.
 * Cada objeto vincula una URL específica con un Componente visual.
 */
export const routes: Routes = [
  { 
    path: '', // Ruta raíz o de inicio (Home)
    component: CharacterTableComponent,
    // canActivate: Indica que esta página no es pública. 
    // Si el AuthGuard devuelve 'false', el usuario es rebotado al Login.
    canActivate: [AuthGuard] 
  },
  { 
    path: 'login', 
    component: LoginComponent 
    // Esta ruta es abierta: cualquier usuario puede ver el formulario de ingreso.
  },
  { 
    path: 'register', 
    component: RegisterComponent 
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    // Protegemos el perfil para que solo el dueño de la cuenta pueda verlo.
    canActivate: [AuthGuard] 
  },
  { 
    path: 'favorites', 
    component: FavoritesListComponent,
    // Los favoritos son privados y dependen de la sesión activa.
    canActivate: [AuthGuard] 
  },

  { path: '**', redirectTo: '' } 
];