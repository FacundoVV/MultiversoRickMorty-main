import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Auth, User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

export interface AppUser {
  uid: string;
  email: string | null;
  username?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<AppUser | null>;
  // Cambiamos el nombre a currentUser$ (con el $) para que el HTML lo encuentre
  public currentUser$: Observable<AppUser | null>;

  public redirectUrl: string = '/';

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<AppUser | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();

    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const userProfile = await this.getUserProfile(user.uid);
        this.currentUserSubject.next({
          uid: user.uid,
          email: user.email,
          username: userProfile?.username || null
        });
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  public get currentUserValue(): AppUser | null {
    return this.currentUserSubject.value;
  }

  private async getUserProfile(uid: string): Promise<any> {
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  }

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}