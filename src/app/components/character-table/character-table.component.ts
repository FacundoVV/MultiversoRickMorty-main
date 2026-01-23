import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavoritesService } from '../../services/favorites.service';
import { Character } from '../../models/character.model';

@Component({
  selector: 'app-character-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-table.component.html',
  styleUrls: ['./character-table.component.css']
})
export class CharacterTableComponent implements OnInit {
  // URLs de la API
  private readonly API_URL = 'https://rickandmortyapi.com/api/character';

  // Estado del componente
  allCharacters: Character[] = [];               // TODOS los personajes cargados (solo 100 inicialmente)
  allCharactersFull: Character[] = [];           // TODOS los personajes de la API (cuando se cargan)
  displayedCharacters: Character[] = [];         // Personajes que se muestran actualmente
  sortDirection: 'asc' | 'desc' = 'asc';        // Dirección de ordenamiento
  showNotesInputId: number | null = null;       // ID del personaje al que se le editan notas
  notesText: string = '';                       // Texto de notas
  searchTerm: string = '';                      // Texto del buscador
  isLoading: boolean = false;                   // Estado de carga
  isLoadingMore: boolean = false;               // Estado de carga adicional
  errorMessage: string | null = null;           // Errores de API

  // Variables para controlar qué mostrar
  defaultLimit: number = 100;                   // Límite por defecto (sin filtros)
  showingLimitedView: boolean = true;           // Si estamos mostrando vista limitada
  hasLoadedAll: boolean = false;                // Si ya cargamos TODOS los personajes

  // Variables para filtros
  statusFilter: string = 'todos';
  speciesFilter: string = 'todas';
  locationFilter: string = 'todas';
  
  // Opciones para los filtros
  availableStatuses: string[] = [];
  availableSpecies: string[] = [];
  availableLocations: string[] = [];

  constructor(
    private http: HttpClient,
    private favoritesService: FavoritesService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialCharacters();
  }

  // --- CARGAR PRIMEROS 100 PERSONAJES (vista inicial sin lag) ---
  loadInitialCharacters(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.allCharacters = [];
    this.allCharactersFull = [];
    this.displayedCharacters = [];
    this.showingLimitedView = true;
    this.hasLoadedAll = false;
    
    // Cargar solo 5 páginas (100 personajes)
    const pagesNeeded = 5;
    const allPromises: Promise<Character[]>[] = [];
    
    for (let page = 1; page <= pagesNeeded; page++) {
      const promise = this.fetchPage(page);
      allPromises.push(promise);
    }
    
    Promise.all(allPromises).then(
      (pageResults) => {
        const loadedCharacters: Character[] = [];
        pageResults.forEach(characters => {
          loadedCharacters.push(...characters);
        });
        
        // Procesar los personajes
        this.allCharacters = loadedCharacters.map(char => ({
          ...this.enrichCharacterData(char),
          imageLoaded: false
        }));
        
        // Por defecto, mostrar solo los primeros 100
        this.displayedCharacters = this.allCharacters.slice(0, this.defaultLimit);
        
        // Extraer valores únicos para los filtros
        this.extractFilterOptions();
        
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      (error) => {
        this.errorMessage = 'Error al cargar personajes. Por favor, intenta nuevamente.';
        this.isLoading = false;
        this.cdRef.detectChanges();
        console.error('Error loading characters:', error);
      }
    );
  }

  // --- CARGAR TODOS LOS PERSONAJES DE LA API ---
  loadAllCharacters(): void {
    if (this.hasLoadedAll) return;
    
    this.isLoadingMore = true;
    
    // Primero obtener el total de páginas
    this.http.get<{info: {pages: number}}>(this.API_URL).subscribe({
      next: (response) => {
        const totalPages = response.info.pages;
        const allPromises: Promise<Character[]>[] = [];
        
        for (let page = 1; page <= totalPages; page++) {
          const promise = this.fetchPage(page);
          allPromises.push(promise);
        }
        
        Promise.all(allPromises).then(
          (pageResults) => {
            const allLoadedCharacters: Character[] = [];
            pageResults.forEach(characters => {
              allLoadedCharacters.push(...characters);
            });
            
            // Procesar TODOS los personajes
            this.allCharactersFull = allLoadedCharacters.map(char => ({
              ...this.enrichCharacterData(char),
              imageLoaded: false
            }));
            
            this.hasLoadedAll = true;
            this.isLoadingMore = false;
            
            // Si hay filtros activos, re-aplicarlos con TODOS los personajes
            if (this.hasActiveFilters()) {
              this.applyFiltersWithAllCharacters();
            }
            
            this.cdRef.detectChanges();
          },
          (error) => {
            this.isLoadingMore = false;
            this.cdRef.detectChanges();
            console.error('Error loading all characters:', error);
          }
        );
      },
      error: (err) => {
        this.isLoadingMore = false;
        this.cdRef.detectChanges();
      }
    });
  }

  // Método para obtener una página específica
  private fetchPage(page: number): Promise<Character[]> {
    return new Promise((resolve, reject) => {
      this.http.get<{results: Character[]}>(`${this.API_URL}?page=${page}`).subscribe({
        next: (response) => {
          resolve(response.results);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  // --- BÚSQUEDA DE PERSONAJES ---
  searchCharacters(searchTerm: string): void {
    const term = searchTerm.trim().toLowerCase();
    this.searchTerm = term;
    
    if (!term) {
      this.applyFilters();
      return;
    }

    // Cuando se busca, necesitamos TODOS los personajes
    if (!this.hasLoadedAll) {
      this.loadAllCharacters();
    }
    
    // Aplicar filtros con todos los personajes
    this.applyFiltersWithAllCharacters();
  }

  // Extrae valores únicos para los filtros
  private extractFilterOptions(): void {
    const statusSet = new Set<string>();
    const speciesSet = new Set<string>();
    const locationSet = new Set<string>();

    this.allCharacters.forEach(character => {
      if (character.status) statusSet.add(character.status);
      if (character.species) speciesSet.add(character.species);
      if (character.location?.name) locationSet.add(character.location.name);
    });

    this.availableStatuses = Array.from(statusSet).sort();
    this.availableSpecies = Array.from(speciesSet).sort();
    this.availableLocations = Array.from(locationSet).sort();
  }

  // Aplica todos los filtros
  private applyAllFilters(characters: Character[]): Character[] {
    let filtered = [...characters];

    // Filtrar por estado
    if (this.statusFilter !== 'todos') {
      filtered = filtered.filter(character => 
        character.status === this.statusFilter
      );
    }

    // Filtrar por especie
    if (this.speciesFilter !== 'todas') {
      filtered = filtered.filter(character => 
        character.species === this.speciesFilter
      );
    }

    // Filtrar por ubicación
    if (this.locationFilter !== 'todas') {
      filtered = filtered.filter(character => 
        character.location?.name === this.locationFilter
      );
    }

    return filtered;
  }

  // --- APLICAR FILTROS (con los personajes que correspondan) ---
  applyFilters(): void {
    if (this.allCharacters.length === 0) return;

    // Verificar si hay algún filtro activo
    const hasFilterActive = this.statusFilter !== 'todos' || 
                           this.speciesFilter !== 'todas' || 
                           this.locationFilter !== 'todas';
    
    // Si hay filtros activos O búsqueda, necesitamos TODOS los personajes
    if (hasFilterActive || this.searchTerm.trim()) {
      // Si aún no tenemos todos los personajes, cargarlos
      if (!this.hasLoadedAll) {
        this.loadAllCharacters();
      }
      
      // Aplicar filtros con todos los personajes
      this.applyFiltersWithAllCharacters();
    } else {
      // Si NO hay filtros activos, mostrar solo los primeros 100
      this.showingLimitedView = true;
      this.displayedCharacters = this.allCharacters.slice(0, this.defaultLimit);
    }
    
    this.cdRef.detectChanges();
  }

  // --- APLICAR FILTROS CON TODOS LOS PERSONAJES ---
  private applyFiltersWithAllCharacters(): void {
    const charactersToUse = this.hasLoadedAll ? this.allCharactersFull : this.allCharacters;
    
    // Aplicar búsqueda primero
    let filtered = charactersToUse;
    
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(character =>
        character.name.toLowerCase().includes(term)
      );
    }

    // Aplicar filtros adicionales
    this.displayedCharacters = this.applyAllFilters(filtered);
    this.showingLimitedView = false;
  }

  // Limpiar todos los filtros
  clearFilters(): void {
    this.statusFilter = 'todos';
    this.speciesFilter = 'todas';
    this.locationFilter = 'todas';
    this.searchTerm = '';
    
    // Volver a mostrar solo los primeros 100
    this.showingLimitedView = true;
    this.displayedCharacters = this.allCharacters.slice(0, this.defaultLimit);
    
    this.cdRef.detectChanges();
  }

  // Mostrar todos los personajes (sin filtros)
  showAllCharacters(): void {
    if (!this.hasLoadedAll) {
      this.loadAllCharacters();
    }
    
    this.showingLimitedView = false;
    this.displayedCharacters = this.hasLoadedAll ? [...this.allCharactersFull] : [...this.allCharacters];
    this.cdRef.detectChanges();
  }

  // Enriquecer datos con favoritos y notas
  private enrichCharacterData(character: Character): Character {
    return {
      ...character,
      isFavorite: this.favoritesService.isFavorite(character.id),
      notes: this.getFavoriteNotes(character.id),
      locationName: character.location?.name || 'Desconocido'
    };
  }

  // --- Manejo de imágenes
  handleImageLoad(character: Character): void {
    character.imageLoaded = true;
    this.cdRef.detectChanges();
  }

  handleImageError(event: Event, character: Character): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/default-character.png';
    character.imageLoaded = true;
    this.cdRef.detectChanges();
  }

  // --- Manejo de favoritos
  toggleFavorite(character: Character): void {
    if (this.favoritesService.isFavorite(character.id)) {
      this.favoritesService.removeFavorite(character.id);
    } else {
      this.favoritesService.addFavorite(character, this.notesText);
    }
    this.updateCharacterInList(character.id);
  }

  private updateCharacterInList(id: number): void {
    const index = this.displayedCharacters.findIndex(c => c.id === id);
    if (index !== -1) {
      this.displayedCharacters[index] = this.enrichCharacterData(this.displayedCharacters[index]);
      this.cdRef.detectChanges();
    }
  }

  // --- Manejo de notas
  getFavoriteNotes(id: number): string {
    const favorite = this.favoritesService.getFavorite(id);
    return favorite?.notes || '';
  }

  startEditingNotes(character: Character): void {
    this.showNotesInputId = character.id;
    this.notesText = this.getFavoriteNotes(character.id);
  }

  saveNotes(character: Character): void {
    if (this.notesText.trim()) {
      this.favoritesService.updateFavoriteNotes(character.id, this.notesText);
      this.updateCharacterInList(character.id);
    }
    this.cancelEditing();
  }

  cancelEditing(): void {
    this.showNotesInputId = null;
    this.notesText = '';
  }

  // --- Ordenación de tabla
  sortTable(sortBy: keyof Character): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    
    this.displayedCharacters.sort((a, b) => {
      const aValue = a[sortBy] ?? '';
      const bValue = b[sortBy] ?? '';
      return this.sortDirection === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }

  // --- Cargar información extra de ubicación
  loadLocation(character: Character): void {
    if (!character.locationName || character.locationName === 'Desconocido') {
      this.http.get<Character>(`${this.API_URL}/${character.id}`).subscribe({
        next: (data) => {
          const foundChar = this.displayedCharacters.find(c => c.id === character.id);
          if (foundChar) {
            foundChar.locationName = data.location?.name || 'Desconocido';
            this.cdRef.detectChanges();
          }
        }
      });
    }
  }

  // --- Métodos para la vista ---
  getTotalLoadedCharacters(): number {
    return this.hasLoadedAll ? this.allCharactersFull.length : this.allCharacters.length;
  }

  getDisplayedCount(): number {
    return this.displayedCharacters.length;
  }

  hasActiveFilters(): boolean {
    return this.statusFilter !== 'todos' || 
           this.speciesFilter !== 'todas' || 
           this.locationFilter !== 'todas' ||
           this.searchTerm.trim() !== '';
  }

  isLoadingAll(): boolean {
    return this.isLoadingMore;
  }
}