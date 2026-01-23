// Servicio para manejar los personajes favoritos y sus notas
// src/app/services/favorites.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Character } from '../models/character.model';

// Interfaz que extiende Character para incluir notas y fecha de agregado
export interface FavoriteCharacter extends Character {
  id: any;       // ID del personaje
  species: any;  // Especie
  status: any;   // Estado (vivo, muerto, desconocido)
  name: any;     // Nombre
  image: any;    // URL de la imagen
  notes?: string;      // Notas agregadas por el usuario
  addedDate?: Date;    // Fecha en la que se agregó a favoritos
}

@Injectable({ //define un servicio.
  
  providedIn: 'root' // Disponible en toda la aplicación
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'rickAndMortyFavorites'; // Clave para localStorage
  private favoritesSubject: BehaviorSubject<FavoriteCharacter[]>; // Estado reactivo de favoritos

  constructor() {
    const savedFavorites = this.getFromLocalStorage(); // Cargar favoritos guardados
    this.favoritesSubject = new BehaviorSubject<FavoriteCharacter[]>(savedFavorites);
  }

  // Observable para suscribirse a cambios de favoritos
  getFavorites(): Observable<FavoriteCharacter[]> {
    return this.favoritesSubject.asObservable();
  }

  // Agregar un personaje a favoritos
  addFavorite(character: Character, notes?: string): void {
    const currentFavorites = this.favoritesSubject.value;
    
    if (this.isFavorite(character.id)) {
      return; // Si ya es favorito, no hacer nada
    }

    const newFavorite: FavoriteCharacter = {
      ...character,
      notes: notes || '',
      addedDate: new Date() // Fecha de agregado
    };

    const updatedFavorites = [...currentFavorites, newFavorite];
    this.saveToLocalStorage(updatedFavorites); // Guardar en localStorage
    this.favoritesSubject.next(updatedFavorites); // Actualizar estado
  }

  // Quitar un personaje de favoritos
  removeFavorite(id: number): void {
    const updatedFavorites = this.favoritesSubject.value.filter(
      favorite => favorite.id !== id
    );
    this.saveToLocalStorage(updatedFavorites);
    this.favoritesSubject.next(updatedFavorites);
  }

  // Actualizar las notas de un personaje favorito
  updateFavoriteNotes(id: number, notes: string): void {
    const updatedFavorites = this.favoritesSubject.value.map(favorite => {
      if (favorite.id === id) {
        return { ...favorite, notes };
      }
      return favorite;
    });

    this.saveToLocalStorage(updatedFavorites);
    this.favoritesSubject.next(updatedFavorites);
  }

  // Verifica si un personaje ya está en favoritos
  isFavorite(id: number): boolean {
    return this.favoritesSubject.value.some(favorite => favorite.id === id);
  }

  // Obtener un personaje favorito por su ID
  getFavorite(id: number): FavoriteCharacter | undefined {
    return this.favoritesSubject.value.find(favorite => favorite.id === id);
  }

  // Guardar el arreglo de favoritos en localStorage
  private saveToLocalStorage(favorites: FavoriteCharacter[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage', error);
    }
  }

  // Obtener favoritos desde localStorage
  private getFromLocalStorage(): FavoriteCharacter[] {
    try {
      const favoritesJson = localStorage.getItem(this.STORAGE_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error reading favorites from localStorage', error);
      return [];
    }
  }
}
