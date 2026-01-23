// src/app/models/character.model.ts
export interface Character {
locationName: any;
imageLoaded: any;
  notes?: string;
  isFavorite: any;
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type: string;
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown';
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface FavoriteCharacter extends Character {
  notes?: string;
  addedDate?: Date;
  userId?: string;
}