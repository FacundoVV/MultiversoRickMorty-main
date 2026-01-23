import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private firestore: Firestore) { }

  // ESTA ES LA PARTE QUE FALTA Y ARREGLA LA LÍNEA 32
  get currentUserValue() {
    return this.auth.currentUser;
  }

  // ESTA ES LA PARTE QUE FALTA Y ARREGLA LA LÍNEA 60 (Ahora acepta username)
  async register(email: string, pass: string, username: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, pass);
      const user = userCredential.user;

      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userDocRef, { 
        uid: user.uid,
        email: email, 
        username: username, 
        fechaRegistro: new Date()
      });
      
      return user;
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  }

  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  logout() {
    return signOut(this.auth);
  }
}