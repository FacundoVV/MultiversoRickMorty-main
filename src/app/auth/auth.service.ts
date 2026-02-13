import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
// Herramientas de Firebase: Auth para el acceso y Firestore para la base de datos de usuarios
import { Auth, User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

/**
 * Interfaz personalizada para definir qué datos manejamos de un usuario.
 * Firebase por defecto no guarda el 'username', por eso lo definimos nosotros.
 */
export interface AppUser {
  uid: string;
  email: string | null;
  username?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BehaviorSubject: El "emisor" interno. Guarda el valor actual y lo emite a quien se suscriba.
  private currentUserSubject: BehaviorSubject<AppUser | null>;
  
  // Observable: La "radio" pública. Los componentes escuchan este $ para reaccionar a cambios.
  public currentUser$: Observable<AppUser | null>;

  // Variable auxiliar para recordar a dónde quería ir el usuario antes de loguearse
  public redirectUrl: string = '/';

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    // Inicializamos el estado del usuario en 'null' (nadie logueado al arrancar)
    this.currentUserSubject = new BehaviorSubject<AppUser | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();

    /**
     * ESCUCHA ACTIVA (onAuthStateChanged):
     * Este es el corazón del servicio. Firebase nos avisa automáticamente
     * si el usuario está logueado o si cerró sesión, incluso si refresca la página.
     */
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        // Si hay un usuario en Firebase Auth, buscamos sus datos extra en Firestore (como el username)
        const userProfile = await this.getUserProfile(user.uid);
        
        // Actualizamos el Subject con el objeto completo: UID + Email + Username
        this.currentUserSubject.next({
          uid: user.uid,
          email: user.email,
          username: userProfile?.username || null
        });
      } else {
        // Si no hay usuario, emitimos 'null' para que la app sepa que estamos "fuera"
        this.currentUserSubject.next(null);
      }
    });
  }

  /**
   * Getter síncrono: Para obtener el usuario rápido sin tener que suscribirse.
   */
  public get currentUserValue(): AppUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Método privado para consultar la base de datos Firestore.
   * Busca en la colección 'users' el documento que coincida con el UID del usuario.
   */
  private async getUserProfile(uid: string): Promise<any> {
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  }

  /**
   * Lógica de inicio de sesión:
   * Se conecta con Firebase Auth para validar el correo y la contraseña.
   */
  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Lógica de cierre de sesión:
   * Limpia el estado en Firebase y redirige al usuario automáticamente al Login.
   */
  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}