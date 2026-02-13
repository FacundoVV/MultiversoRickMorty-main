import { Injectable } from '@angular/core';
// Importamos las herramientas de autenticación de Firebase
// 'authState' es la clave: nos permite escuchar cambios en tiempo real
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, authState, User } from '@angular/fire/auth';
// Importamos Firestore para guardar datos extra del usuario (como el nombre de usuario)
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
// Importamos Observable para crear el "canal de transmisión" de datos
import { Observable } from 'rxjs'; 

@Injectable({
  providedIn: 'root' // Disponible en toda la aplicación (Singleton)
})
export class AuthService {

  // Inyectamos el servicio de Autenticación y la Base de Datos
  constructor(private auth: Auth, private firestore: Firestore) { }

  /**
   * Este es un "Observable" (un flujo de datos en vivo).
   * Funciona como una radio: Otros servicios (como FavoritesService) se "suscriben" a esto.
   * Cuando alguien inicia o cierra sesión, este canal emite el cambio inmediatamente.
   * @returns Un flujo que emite el usuario actual o null si no hay nadie.
   */
  get currentUser$(): Observable<User | null> {
    return authState(this.auth);
  }

  /**
   * Obtiene el valor actual del usuario de forma instantánea (síncrona).
   * Útil para verificaciones rápidas donde no necesitamos suscribirnos.
   * @returns El objeto usuario o null.
   */
  get currentUserValue() {
    return this.auth.currentUser;
  }

  /**
   * Registro de usuario completo:
   * 1. Crea la cuenta en el sistema de seguridad de Firebase (Email/Pass).
   * 2. Crea una carpeta personalizada en la Base de Datos para guardar el 'username'.
   */
  async register(email: string, pass: string, username: string) {
    try {
      // Paso 1: Crear credenciales de acceso
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, pass);
      const user = userCredential.user;

      // Paso 2: Referencia al documento en la base de datos (usando su UID único)
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      
      // Paso 3: Guardar los datos extra que Auth no guarda por defecto
      await setDoc(userDocRef, { 
        uid: user.uid,
        email: email, 
        username: username, 
        fechaRegistro: new Date()
      });
      
      return user;
    } catch (error) {
      console.error("Error en registro:", error);
      throw error; // Lanzamos el error para que el componente muestre la alerta al usuario
    }
  }

  /**
   * Inicia sesión con credenciales existentes.
   * Al hacerlo, Firebase actualiza automáticamente el 'currentUser$' y avisa a toda la app.
   */
  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  /**
   * Cierra la sesión actual.
   * Esto dispara el evento 'null' en currentUser$, limpiando los favoritos en la pantalla.
   */
  logout() {
    return signOut(this.auth);
  }
}