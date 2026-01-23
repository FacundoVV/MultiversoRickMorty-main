import { Routes } from '@angular/router';
import { CharacterTableComponent } from './components/character-table/character-table.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { AuthGuard } from './auth/auth-guard';
import { FavoritesListComponent } from './components/favorites-list/favorites-list.component';

export const routes: Routes = [
  { 
    path: '', 
    component: CharacterTableComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: RegisterComponent 
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'favorites', 
    component: FavoritesListComponent,
    canActivate: [AuthGuard]  // AÑADIR AuthGuard aquí también
  },
  { path: '**', redirectTo: '' }
];