import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Character } from '../models/character.model';
import { AuthService } from './auth.service'; // Importamos el servicio para detectar al usuario

// Interfaz extendida: El personaje normal + datos propios de favoritos (notas, fecha)
export interface FavoriteCharacter extends Character {
  id: any;
  species: any;
  status: any;
  name: any;
  image: any;
  notes?: string;
  addedDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  
  // Estado Reactivo: BehaviorSubject mantiene la lista actual en memoria y avisa a los componentes si cambia
  private favoritesSubject = new BehaviorSubject<FavoriteCharacter[]>([]);
  
  // INYECCIÓN MODERNA: Usamos 'inject' para acceder al AuthService y saber quién está logueado
  private authService = inject(AuthService);

  constructor() {
    // --- LÓGICA DE SEGREGACIÓN DE DATOS ---
    // Nos suscribimos al observable 'currentUser$' del AuthService.
    // Esto se ejecuta automáticamente cada vez que alguien inicia o cierra sesión.
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Generamos una "llave" única usando el ID del usuario (ej: 'favorites_abc123')
        const userKey = `favorites_${user.uid}`; 
        // Buscamos en el localStorage SOLO la caja que corresponde a esa llave
        const savedFavorites = this.getFromLocalStorage(userKey);
        // Cargamos esos datos en la aplicación
        this.favoritesSubject.next(savedFavorites);
      } else {
        // Si el usuario se va, enviamos un array vacío [] para limpiar la pantalla inmediatamente
        // Esto evita que el siguiente usuario vea datos residuales
        this.favoritesSubject.next([]);
      }
    });
  }

  // Permite a los componentes "observar" la lista de favoritos sin poder modificarla directamente
  getFavorites(): Observable<FavoriteCharacter[]> {
    return this.favoritesSubject.asObservable();
  }

  // Agregar favorito (Protegido por usuario)
  addFavorite(character: Character, notes?: string): void {
    // Verificamos quién es el usuario actual (síncrono)
    const user = this.authService.currentUserValue;
    if (!user) return; // Si no hay nadie logueado, no guardamos nada por seguridad

    const currentFavorites = this.favoritesSubject.value;
    
    // Evitamos duplicados
    if (this.isFavorite(character.id)) return;

    const newFavorite: FavoriteCharacter = {
      ...character,
      notes: notes || '',
      addedDate: new Date()
    };

    const updatedFavorites = [...currentFavorites, newFavorite];
    
    // Guardamos usando la ID (uid) del usuario actual para no mezclar datos
    this.saveToLocalStorage(updatedFavorites, user.uid);
    this.favoritesSubject.next(updatedFavorites);
  }

  // Eliminar favorito
  removeFavorite(id: number): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    const updatedFavorites = this.favoritesSubject.value.filter(
      favorite => favorite.id !== id
    );
    
    // Guardamos la lista actualizada en la caja del usuario actual
    this.saveToLocalStorage(updatedFavorites, user.uid);
    this.favoritesSubject.next(updatedFavorites);
  }

  // Editar notas personales
  updateFavoriteNotes(id: number, notes: string): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    const updatedFavorites = this.favoritesSubject.value.map(favorite => {
      if (favorite.id === id) {
        return { ...favorite, notes };
      }
      return favorite;
    });

    this.saveToLocalStorage(updatedFavorites, user.uid);
    this.favoritesSubject.next(updatedFavorites);
  }

  // Utilidad: Verifica si un ID ya está en la lista actual
  isFavorite(id: number): boolean {
    return this.favoritesSubject.value.some(favorite => favorite.id === id);
  }

  // Utilidad: Devuelve el objeto completo del favorito
  getFavorite(id: number): FavoriteCharacter | undefined {
    return this.favoritesSubject.value.find(favorite => favorite.id === id);
  }

  // --- PERSISTENCIA PRIVADA ---
  // Guarda en el navegador pero usando una CLAVE ÚNICA por usuario
  private saveToLocalStorage(favorites: FavoriteCharacter[], uid: string): void {
    try {
      const key = `favorites_${uid}`; // La clave depende del usuario (ej: favorites_user1)
      localStorage.setItem(key, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage', error);
    }
  }

  // Lee del navegador usando la clave específica que le pasemos
  private getFromLocalStorage(key: string): FavoriteCharacter[] {
    try {
      const favoritesJson = localStorage.getItem(key);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error reading favorites from localStorage', error);
      return [];
    }
  }
}