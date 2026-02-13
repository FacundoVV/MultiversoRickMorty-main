import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';


import { provideHttpClient } from '@angular/common/http';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // Optimiza la detección de cambios para mejorar el rendimiento de la app
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Configura el sistema de rutas definido en app.routes.ts
    provideRouter(routes),
    
    provideHttpClient(), // <--- ¡Aquí activamos el internet de la App para usar la API!

    // Inicialización de los servicios de Firebase usando las credenciales del entorno
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()), // Proveedor para la autenticación de usuarios
    provideFirestore(() => getFirestore()) // Proveedor para la base de datos en la nube
  ]
};