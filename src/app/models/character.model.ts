// src/app/models/character.model.ts
// Define la estructura base de un personaje tal como viene de la API y se usa en la UI
export interface Character {
locationName: any; // Nombre legible de la ubicación para mostrar en la tabla
imageLoaded: any; // Flag para controlar el estado de carga de la imagen (evita parpadeos)
  notes?: string; // Notas opcionales que el usuario puede añadir al personaje
  isFavorite: any; // Estado que indica si el personaje está marcado como favorito
  id: number; // Identificador único numérico del personaje
  name: string; // Nombre completo del personaje
  status: 'Alive' | 'Dead' | 'unknown'; // Estado vital con valores estrictos
  species: string; // Especie (Humano, Alien, etc.)
  type: string; // Subtipo o información detallada de la especie
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown'; // Género del personaje
  origin: { // Objeto con información del lugar de origen
    name: string;
    url: string;
  };
  location: { // Objeto con información de la última ubicación conocida
    name: string;
    url: string;
  };
  image: string; // URL de la imagen del personaje
  episode: string[]; // Listado de URLs de los episodios donde aparece
  url: string; // URL del recurso individual en la API
  created: string; // Fecha de creación del registro en la API
}

// Extiende la interfaz Character para añadir metadatos específicos de la base de datos
export interface FavoriteCharacter extends Character {
  notes?: string; // Comentarios personalizados del usuario sobre su favorito
  addedDate?: Date; // Fecha en la que fue añadido a la lista de favoritos
  userId?: string; // ID del usuario de Firebase al que pertenece este favorito
}